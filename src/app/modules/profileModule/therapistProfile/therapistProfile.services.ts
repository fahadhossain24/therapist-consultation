import ITherapistProfile from "./therapistProfile.interface";
import TherapistProfile from "./therapistProfile.model";

// service for create therapist profile
const createTherapistProfile = async (data: Partial<ITherapistProfile>) => {
  return await TherapistProfile.create(data);
};

// service for retrive specific therapist profile by user
const getTherapistProfileByUserId = async (userId: string) => {
  return await TherapistProfile.findOne({ user: userId })
};

// service for update therapist profile
const updateTherapistProfileByuserId = async (userId: string, data: Partial<ITherapistProfile>) => {
  return await TherapistProfile.findOneAndUpdate({ user: userId }, data);
};

// service for delete therapist profile
const deleteTherapistProfileByUserId = async (userId: string) => {
  return await TherapistProfile.findOneAndDelete({ user: userId });
};

export default {
  createTherapistProfile,
  getTherapistProfileByUserId,
  updateTherapistProfileByuserId,
  deleteTherapistProfileByUserId
};
