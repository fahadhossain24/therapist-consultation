import mongoose from 'mongoose';
import { IAppointmentDue } from './appointmentDue.interface';
import AppointmentDue from './appointmentDue.model';

// service for create new appointment due
const createAppointmentDue = async (data: Partial<IAppointmentDue>) => {
  return await AppointmentDue.create(data);
};

// service for get specific due by appointment id
const getSpecificDueByAppointmentId = async (appointmentId: string, session?: mongoose.ClientSession) => {
  const query = AppointmentDue.findOne({ appointment: appointmentId });
  if (session) query.session(session); // Apply session if provided
  return query.exec();
};

// service for delete specific due by appointment id
const deleteSpecificDueByAppointmentId = async (appointmentId: string, session?: mongoose.ClientSession) => {
  const query = AppointmentDue.findOneAndDelete({ appointment: appointmentId });
  if (session) query.session(session); // Apply session if provided
  return query.exec();
};

// service for update specific due by appointment id
const updateSpecificDueByAppointmentId = async (appointmentId: string, data: Partial<IAppointmentDue>) => {
  return await AppointmentDue.findOneAndUpdate({ appointment: appointmentId }, data, { new: true });
};
export default {
  createAppointmentDue,
  getSpecificDueByAppointmentId,
  deleteSpecificDueByAppointmentId,
  updateSpecificDueByAppointmentId,
};
