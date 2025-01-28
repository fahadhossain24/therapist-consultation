import { populate } from 'dotenv';
import TherapistProfessional from '../../professionalModule/therapistProfessional/therapistProfessional.model';
import ITherapistProfile from './therapistProfile.interface';
import TherapistProfile from './therapistProfile.model';

// service for create therapist profile
const createTherapistProfile = async (data: Partial<ITherapistProfile>) => {
  return await TherapistProfile.create(data);
};

// service for retrive specific therapist profile by user
const getTherapistProfileByUserId = async (userId: string) => {
  return await TherapistProfile.findOne({ user: userId });
};

// service for update therapist profile
const updateTherapistProfileByuserId = async (userId: string, data: Partial<ITherapistProfile>) => {
  return await TherapistProfile.findOneAndUpdate({ user: userId }, data);
};

// service for delete therapist profile
const deleteTherapistProfileByUserId = async (userId: string) => {
  return await TherapistProfile.findOneAndDelete({ user: userId });
};

// service to get popular therapists
const getPopularTherapists = async (documentCount: number) => {
  return await TherapistProfessional.find()
    .sort('-consumeCount')
    .limit(documentCount)
    .populate({
      path: 'therapist',
      select: '-verification -password -isEmailVerified -isSocial -fcmToken -createdAt -updatedAt',
      populate: {
        path: 'profile',
        select: '',
      },
    });
};

// service to get active and premium therapists
// const getActiveAndPremiumTherapists = async (searchQuery: string) => {
//   return await TherapistProfessional.find().populate({
//     path: 'therapist',
//     select: '-verification -password -isEmailVerified -isSocial -fcmToken -createdAt -updatedAt',
//     match: {
//       status: 'active', // Ensure only active users are retrieved
//       ...(searchQuery ? { $text: { $search: searchQuery } } : {}),
//     },
//     populate: {
//       path: 'profile',
//       select: '',
//       match: searchQuery ? { $text: { $search: searchQuery } } : {},
//     },
//   });
// };
const getActiveAndPremiumTherapists = async (searchQuery: string) => {
  const matchCondition: any = {
    status: 'active', // Only include active therapists
  };

  if (searchQuery) {
    matchCondition.$text = { $search: searchQuery }; // Add search criteria if provided
  }
console.log(matchCondition)
  return await TherapistProfessional.find({isPremium: true})
    .populate({
      path: 'therapist',
      select: '-verification -password -isEmailVerified -isSocial -fcmToken -createdAt -updatedAt',
      match: matchCondition,
      populate: {
        path: 'profile',
        select: ''
      },
    })
    .then((result) =>
      // Filter out TherapistProfessional documents where therapist is null
      result.filter((doc) => doc.therapist !== null),
    );
};

export default {
  createTherapistProfile,
  getTherapistProfileByUserId,
  updateTherapistProfileByuserId,
  deleteTherapistProfileByUserId,
  getPopularTherapists,
  getActiveAndPremiumTherapists,
};
