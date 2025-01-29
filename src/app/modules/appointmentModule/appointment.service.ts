import { IAppointment } from './appointment.interface';
import Appointment from './appointment.model';

// service to create new appointment
const createAppointment = async (data: Partial<IAppointment>) => {
  return await Appointment.create(data);
};

const getAppointmentsByDateAndTherapist = async (date: Date, therapistId: string) => {
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));
  return Appointment.find({
    therapist: therapistId,
    date: { $gte: startOfDay, $lte: endOfDay },
    status: { $nin: ['cancelled', 'missed', 'cancelled-approved'] }, // Optional: Exclude cancelled appointments
  });
};

export default {
  createAppointment,
  getAppointmentsByDateAndTherapist
};
