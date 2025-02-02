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
    }).skip(skip).limit(limit);
  }

  if (userType === 'patient') {
    return Appointment.find({
      patient: userId,
      status,
    }).skip(skip).limit(limit);
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



export default {
  createAppointment,
  getAppointmentsByDateAndTherapist,
  getAppointmentsByUserAndStatus,
  getSpecificAppointment,
  updateSpecificAppointmentById,
};
