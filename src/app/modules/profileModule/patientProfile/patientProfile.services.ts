import IPatientProfile from './patientProfile.interface';
import PatientProfile from './patientProfile.model';

// service for create patient profile
const createPatientProfile = async (data: Partial<IPatientProfile>) => {
  return await PatientProfile.create(data);
};

// service for retrive specific patient profile by user
const getPatientProfileByUserId = async (userId: string) => {
  return await PatientProfile.findOne({ user: userId })
};

// service for update patient profile
const updatePatientProfileByuserId = async (userId: string, data: Partial<IPatientProfile>) => {
  return await PatientProfile.findOneAndUpdate({ user: userId }, data);
};

// service for delete patient profile
const deletePatientProfileByUserId = async (userId: string) => {
  return await PatientProfile.findOneAndDelete({ user: userId });
};

export default {
  createPatientProfile,
  getPatientProfileByUserId,
  updatePatientProfileByuserId,
  deletePatientProfileByUserId
};
