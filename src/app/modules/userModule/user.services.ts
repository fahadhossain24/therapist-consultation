import { ObjectId, Types } from 'mongoose';
import IUser from './user.interface';
import User from './user.model';
import PatientProfile from '../profileModule/patientProfile/patientProfile.model';
import TherapistProfile from '../profileModule/therapistProfile/therapistProfile.model';

// service for create new user
const createUser = async (data: IUser) => {
  return await User.create(data);
};

// service for get specific user
const getSpecificUser = async (id: string): Promise<IUser> => {
  return await User.findOne({ _id: id })
    .populate({
      path: 'profile',
      select: '',
    })
    .select('-password');
};

// service for get specific user
const getAllUser = async (): Promise<IUser[]> => {
  return await User.find()
    .populate({
      path: 'profile',
      select: '',
    })
    .select('-password');
};

// service for get specific user
const getSpecificUserByEmail = async (email: string): Promise<IUser> => {
  return await User.findOne({ email })
    .populate({
      path: 'profile',
      select: '',
    })
    .select('-password');
};

// service for update specific user
const updateSpecificUser = async (id: string, data: Partial<IUser>) => {
  console.log(data)
  return await User.updateOne({ _id: id }, data);
};

// service for delete specific user
const deleteSpecificUser = async (id: string, role: string) => {
  await User.deleteOne({ _id: id });
  if(role === 'patient'){
    await PatientProfile.deleteOne({ user : id });
  }else if(role === 'therapist') {
    await TherapistProfile.deleteOne({ user : id });
  }else{
    return false
  }
  return true;
};

export default {
  createUser,
  getSpecificUser,
  getSpecificUserByEmail,
  updateSpecificUser,
  deleteSpecificUser,
  getAllUser,
};
