import { populate } from 'dotenv';
import { IAppointment } from './appointment.interface';
import Appointment from './appointment.model';
import mongoose from 'mongoose';
import { convertTo24HourFormat } from '../../../utils/convertTo24HourFormat';

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
        path: 'patient',
        select: '-verification -password -email -isEmailVerified -fcmToken -isSocial -createdAt -updatedAt -isDeleted -__v',
        populate: {
          path: 'profile',
          select: 'dateOfBirth gender image',
          // populate: {
          //   path: 'speciality',
          //   select: 'name',
          // },
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
        select: '-verification -password -email -isEmailVerified -fcmToken -isSocial -createdAt -updatedAt -__v',
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

// service to get today approved appointments by therapist
const getTodayApprovedAppointmentsByTherapist = async (therapistId: string) => {
  const startOfDay = new Date().setHours(0, 0, 0, 0);
  const endOfDay = new Date().setHours(23, 59, 59, 999);
  return Appointment.find({
    therapist: therapistId,
    date: { $gte: startOfDay, $lte: endOfDay },
    status: 'approved',
  }).populate({
    path: 'patient',
    select: '-verification -password -email -isEmailVerified -fcmToken -isSocial -createdAt -updatedAt -isDeleted -__v',
    populate: {
      path: 'profile',
      select: 'dateOfBirth gender image',
    },
  });
};

// service to get specific appointment by id
const getSpecificAppointment = async (appointmentId: string, session?: mongoose.ClientSession) => {
  const query = Appointment.findById(appointmentId);
  if (session) query.session(session); // Apply session if provided
  return query.exec();
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
    query.appointmentId = searchQuery;
  }
  return await Appointment.find(query)
    .skip(skip)
    .limit(limit)
    .select('-feeInfo.holdFee')
    .populate({
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
    })
    .populate({
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

// service for update all past appointment status as missed
const updateAllPastAppointments = async () => {
  const now = new Date(); // Current date and time

  // Fetch only relevant appointments (approved & rescheduled)
  const appointments = await Appointment.find({
    status: { $in: ['approved', 'rescheduled'] },
  });

  const updates = [];

  for (const appointment of appointments) {
    const [startTime] = appointment.slot.split(' - '); // Extract start time (e.g., "09:00 AM")

    // Extract the date as YYYY-MM-DD
    const formattedDate = appointment.date.toISOString().split('T')[0];

    // Convert date and time into a valid Date object
    const appointmentDateTime = new Date(`${formattedDate}T${convertTo24HourFormat(startTime)}`);

    if (!isNaN(appointmentDateTime.getTime()) && appointmentDateTime < now) {
      updates.push(appointment._id);
    }
  }

  // Bulk update all past appointments to 'missed'
  if (updates.length > 0) {
    const result = await Appointment.updateMany({ _id: { $in: updates } }, { status: 'missed' });
  }
};

export default {
  createAppointment,
  getAppointmentsByDateAndTherapist,
  getAppointmentsByUserAndStatus,
  getTodayApprovedAppointmentsByTherapist,
  getSpecificAppointment,
  updateSpecificAppointmentById,
  retriveSpecificAppointmentByAppointmentId,
  getAppointments,
  updateAllPastAppointments,
};
