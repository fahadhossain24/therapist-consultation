import { Request, Response } from 'express';
import specialityService from './speciality.service';
import CustomError from '../../errors';
import sendResponse from '../../../shared/sendResponse';
import asyncHandler from '../../../shared/asyncHandler';
import fileUploader from '../../../utils/fileUploader';
import { FileArray } from 'express-fileupload';

// Controller for adding a new speciality
const createSpeciality = asyncHandler(async (req: Request, res: Response) => {
  const speciality = req.body;
  const files = req.files;
  console.log('hellow');
  console.log(speciality);
  if (files) {
    const specialityImagePath = await fileUploader(files as FileArray, `speciality-image`, 'image');
    speciality.image = specialityImagePath;
  }
  const newSpeciality = await specialityService.addSpeciality(speciality);
  if (!newSpeciality) {
    throw new CustomError.BadRequestError('Failed to create new speciality!');
  }
  sendResponse(res, {
    statusCode: 201,
    status: 'success',
    message: 'Speciality created successfully',
    data: newSpeciality,
  });
});

// Controller for getting all specialities
const getSpecialities = asyncHandler(async (req: Request, res: Response) => {
  const { query } = req.query;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 8;

  const skip = (page - 1) * limit;
  const specialities = await specialityService.getAllSpecialities(query as string, skip, limit);

  const totalSpecialities = specialities.length || 0;
  const totalPages = Math.ceil(totalSpecialities / limit);

  sendResponse(res, {
    statusCode: 200,
    status: 'success',
    message: 'Specialities retrieved successfully',
    meta: {
      totalData: totalSpecialities,
      totalPage: totalPages,
      currentPage: page,
      limit: limit,
    },
    data: specialities,
  });
});

// controller for update specific speciality
const updateSpecificSpeciality = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  const files = req.files;
  
  if (files) {
    const specialityImagePath = await fileUploader(files as FileArray, `speciality-image`, 'image');
    data.image = specialityImagePath;
  }
  
  const updatedSpeciality = await specialityService.updateSpecificSpeciality(id, data);
  
  if (!updatedSpeciality.modifiedCount) {
    throw new CustomError.BadRequestError('Failed to update Speciality!');
  }
  
  sendResponse(res, {
    statusCode: 200,
    status: 'success',
    message: 'Speciality updated successfully',
  });
});

// controller for delete specific speciality
const deleteSpecificSpeciality = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const deletedSpeciality = await specialityService.deleteSpecificSpeciality(id);

  if (!deletedSpeciality.deletedCount) {
    throw new CustomError.BadRequestError('Failed to delete Speciality!');
  }
  sendResponse(res, {
    statusCode: 200,
    status: 'success',
    message: 'Speciality deleted successfully',
  });
});

export default {
  createSpeciality,
  getSpecialities,
  updateSpecificSpeciality,
  deleteSpecificSpeciality
};
