import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../../shared/sendResponse';
import IdGenerator from '../../../utils/IdGenerator';
import CustomError from '../../errors';
import userServices from './user.services';
import sendMail from '../../../utils/sendEmail';
import { Request, Response } from 'express';
import jwtHelpers from '../../../healpers/healper.jwt';
import config from '../../../config';
import fileUploader from '../../../utils/fileUploader';
import { FileArray } from 'express-fileupload';
import asyncHandler from '../../../shared/asyncHandler';
import patientProfileServices from '../profileModule/patientProfile/patientProfile.services';
import therapistProfileServices from '../profileModule/therapistProfile/therapistProfile.services';
import mongoose from 'mongoose';
import { slotsPerDayOfAvailities } from './user.utils';

// controller for create new user
const createUser = asyncHandler(async (req: Request, res: Response) => {
  const userData = req.body;
  const files = req.files;

  const expireDate = new Date();
  expireDate.setMinutes(expireDate.getMinutes() + 30);

  userData.verification = {
    code: IdGenerator.generateNumberId(),
    expireDate,
  };

  // token for social user
  let profile, accessToken, refreshToken;
  if (userData.isSocial) {
    userData.isEmailVerified = true;

    const payload = {
      email: userData.email,
      role: userData.role,
    };
    accessToken = jwtHelpers.createToken(payload, config.jwt_access_token_secret as string, config.jwt_access_token_expiresin as string);
    refreshToken = jwtHelpers.createToken(payload, config.jwt_refresh_token_secret as string, config.jwt_refresh_token_expiresin as string);
  }

  if (userData.role === 'patient') {
    if (files && files.image) {
      const userImagePath = await fileUploader(files as FileArray, `user-image`, 'image');
      userData.image = userImagePath;
    }

    profile = await patientProfileServices.createPatientProfile(userData);
  }

  if (userData.role === 'therapist') {
    if (files && files.curriculumVitae) {
      const curriculumVitaePath = await fileUploader(files as FileArray, `curriculum-vitae`, 'curriculumVitae');
      userData.curriculumVitae = curriculumVitaePath;
    }
    if (files && files.certificates) {
      const certificatesPath = await fileUploader(files as FileArray, `certificates`, 'certificates');
      userData.certificates = certificatesPath;
    }
    if (files && files.brandLogo) {
      const brandLogoPath = await fileUploader(files as FileArray, `brand-logo`, 'brandLogo');
      userData.brandLogo = brandLogoPath;
    }
    if (files && files.image) {
      const imagePath = await fileUploader(files as FileArray, `image`, 'image');
      userData.image = imagePath;
    }

    const chargePerHour = JSON.parse(userData.chargePerHour);
    const availabilities = JSON.parse(userData.availabilities);

    availabilities.forEach((day: any) => {
      if (!day.isClosed) {
        day.slotsPerDay = slotsPerDayOfAvailities(day);
      }
    });
    userData.availabilities = availabilities;
    userData.chargePerHour = chargePerHour;
    // console.log(userData)

    profile = await therapistProfileServices.createTherapistProfile(userData);
  }

  if (profile) {
    userData.profile = profile._id;
  }

  const user = await userServices.createUser(userData);
  if (!user) {
    throw new CustomError.BadRequestError('Failed to create new user!');
  }

  if (profile) {
    profile.user = new mongoose.Types.ObjectId(user._id as string);
    await profile.save();
  }

  const { password, ...userInfoAcceptPass } = user.toObject();

  if (!userData.isSocial) {
    // send email verification mail
    const content = `Your email veirfication code is ${userData?.verification?.code}`;
    // const verificationLink = `${server_base_url}/v1/auth/verify-email/${user._id}?userCode=${userData.verification.code}`
    // const content = `Click the following link to verify your email: ${verificationLink}`
    const mailOptions = {
      from: config.gmail_app_user as string,
      to: userData.email,
      subject: 'Counta - Email Verification',
      text: content,
    };

    sendMail(mailOptions);
  }

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    status: 'success',
    message: 'User creation successfull',
    data: { ...userInfoAcceptPass, accessToken, refreshToken },
  });
});

// service for get specific user by id
const getSpecificUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await userServices.getSpecificUser(id);
  if (!user) {
    throw new CustomError.NotFoundError('User not found!');
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'User retrive successfull',
    data: user,
  });
});

// service for get specific user by id
const getAllUser = asyncHandler(async (req: Request, res: Response) => {
  const users = await userServices.getAllUser();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'User retrive successfull',
    data: users,
  });
});

// controller for delete specific user
const deleteSpecificUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.user!;
  const isDelete = await userServices.deleteSpecificUser(id, role);
  if (!isDelete) {
    throw new CustomError.BadRequestError('Failed to delete user!');
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'User delete successfull',
  });
});

// controller for update specific user
const updateSpecificUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userData = req.body;
  const files = req.files;

  const { role } = req.user!;

  if (userData.password || userData.email || userData.isEmailVerified) {
    throw new CustomError.BadRequestError("You can't update email, verified status and password directly!");
  }

  // if (files) {
  //   const userImagePath = await fileUploader(files as FileArray, `user-image`, 'image');
  //   userData.image = userImagePath;
  // }
  let updatedProfile;

  if (role === 'patient') {
    if (files && files.image) {
      const userImagePath = await fileUploader(files as FileArray, `user-image`, 'image');
      userData.image = userImagePath;
    }

    updatedProfile = await patientProfileServices.updatePatientProfileByuserId(id, userData);
  }

  if (role === 'therapist') {
    const therapistProfile = await therapistProfileServices.getTherapistProfileByUserId(id)
    if (files && files.curriculumVitae) {
      const curriculumVitaePath = await fileUploader(files as FileArray, `curriculum-vitae`, 'curriculumVitae');
      userData.curriculumVitae = curriculumVitaePath;
    }
    if (files && files.certificates) {
      const certificatesPath = await fileUploader(files as FileArray, `certificates`, 'certificates');
      userData.certificates = certificatesPath;
    }
    if (files && files.brandLogo) {
      const brandLogoPath = await fileUploader(files as FileArray, `brand-logo`, 'brandLogo');
      userData.brandLogo = brandLogoPath;
    }
    if (files && files.image) {
      const imagePath = await fileUploader(files as FileArray, `image`, 'image');
      userData.image = imagePath;
    }

    const chargePerHour = userData.chargePerHour ? JSON.parse(userData.chargePerHour) : therapistProfile?.chargePerHour;
    const availabilities = userData.availabilities ? JSON.parse(userData.availabilities) : therapistProfile?.availabilities;

    availabilities.forEach((day: any) => {
      if (!day.isClosed) {
        day.slotsPerDay = slotsPerDayOfAvailities(day);
      }
    });
    userData.availabilities = availabilities;
    userData.chargePerHour = chargePerHour;
console.log("userData...........", userData)
    updatedProfile = await therapistProfileServices.updateTherapistProfileByuserId(id, userData);
  }
// console.log(userData)
  const updatedUser = await userServices.updateSpecificUser(id, userData);
  // console.log(updatedUser, updatedProfile)
  if (!updatedUser?.isModified) {
    throw new CustomError.BadRequestError('Failed to update user!');
  }

  if (!updatedProfile?.isModified) {
    throw new CustomError.BadRequestError('Failed to update user profile!');
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'User modified successfull',
  });
});

// controller for change profile image of specific user
const changeUserProfileImage = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const files = req.files;
  const { role } = req.user!;

  // console.log(files)
  const user = await userServices.getSpecificUser(id);
  // console.log(req.files)
  if (!user) {
    throw new CustomError.NotFoundError('No user found!');
  }

  let updateUser;

  const userImagePath = await fileUploader(files as FileArray, `user-image`, 'image');
  if (role === 'patient') {
    updateUser = await patientProfileServices.updatePatientProfileByuserId(id, {
      image: userImagePath as string,
    });
  } else if (role === 'therapist') {
    updateUser = await therapistProfileServices.updateTherapistProfileByuserId(id, {
      image: userImagePath as string,
    });
  } else {
    throw new CustomError.BadRequestError('Invalid role!');
  }

  if (!updateUser?.isModified) {
    throw new CustomError.BadRequestError('Failed to change user profile image!');
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'User profile change successfull',
  });
});

export default {
  createUser,
  getSpecificUser,
  getAllUser,
  deleteSpecificUser,
  updateSpecificUser,
  changeUserProfileImage,
};
