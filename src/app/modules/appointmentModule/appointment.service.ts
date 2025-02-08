import { populate } from 'dotenv';
import { IAppointment } from './appointment.interface';
import Appointment from './appointment.model';

// service to create new appointment
const createAppointment = async (data: Partial<IAppointment>) => {
  return await Appointment.create(data);
};

// service to get appointments by date and therapist
const getAppointmentsByDateAndTherapist = async (date: Date, therapistId: string) => {
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));
  return Appointment.find({
    therapist: therapistId,
    date: { $gte: startOfDay, $lte: endOfDay },
    status: { $nin: ['cancelled', 'missed', 'cancelled-approved'] }, // Optional: Exclude cancelled appointments
  });
};

// service to get appointments by user(therapist/patient) and status
const getAppointmentsByUserAndStatus = async (userType: string, userId: string, status: string, skip: number, limit: number) => {
  if (userType === 'therapist') {
    return Appointment.find({
      therapist: userId,
      status,
    })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'therapist',
        select: '-verificationCode -password -email -isVerified -fcmToken -isSocial -createdAt -updatedAt -isDeleted -__v',
        populate: {
          path: 'profile',
          select: 'speciality image',
          populate: {
            path: 'speciality',
            select: 'name',
          },
        },
      });
  }

  if (userType === 'patient') {
    return Appointment.find({
      patient: userId,
      status,
    })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'therapist',
        select: '-verificationCode -password -email -isVerified -fcmToken -isSocial -createdAt -updatedAt -__v',
        populate: {
          path: 'profile',
          select: 'speciality image',
          populate: {
            path: 'speciality',
            select: 'name',
          },
        },
      });
  }
};

// service to get specific appointment by id
const getSpecificAppointment = async (appointmentId: string) => {
  return await Appointment.findById(appointmentId);
};

// service to cancel appointment by patient before approved
const updateSpecificAppointmentById = async (appointmentId: string, data: Partial<IAppointment>) => {
  return await Appointment.findOneAndUpdate({ _id: appointmentId }, data, { new: true });
};

// service to retrive specific appointment by appointment id
const retriveSpecificAppointmentByAppointmentId = async (appointmentId: string) => {
  return await Appointment.findOne({ _id: appointmentId });
};

// service for get all appointments with search and pagination
const getAppointments = async (searchQuery: string, skip: number, limit: number) => {
  const query: any = {};
  if (searchQuery) {
    query.$text = { $search: searchQuery };
  }
  return await Appointment.find(query).skip(skip).limit(limit).select('-feeInfo.holdFee').populate({
    path: 'patient',
    select: '-verification -password -email -isVerified -fcmToken -isSocial -createdAt -updatedAt -isDeleted -__v',
    populate: {
      path: 'profile',
      select: '',
      // populate: {
      //   path: 'speciality',
      //   select: 'name',
      // },
    },
  }).populate({
    path: 'therapist',
    select: '-verification -password -email -isVerified -fcmToken -isSocial -createdAt -updatedAt -isDeleted -__v',
    populate: {
      path: 'profile',
      select: '',
      populate: {
        path: 'speciality',
        select: 'name',
      },
    },
  });
};

export default {
  createAppointment,
  getAppointmentsByDateAndTherapist,
  getAppointmentsByUserAndStatus,
  getSpecificAppointment,
  updateSpecificAppointmentById,
  retriveSpecificAppointmentByAppointmentId,
  getAppointments,
};
