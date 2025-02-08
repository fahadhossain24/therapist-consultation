import { IAppointmentDue } from './appointmentDue.interface';
import AppointmentDue from './appointmentDue.model';

// service for create new appointment due
const createAppointmentDue = async (data: Partial<IAppointmentDue>) => {
  return await AppointmentDue.create(data);
};

// service for get specific due by appointment id
const getSpecificDueByAppointmentId = async (appointmentId: string) => {
  return await AppointmentDue.findOne({ appointment: appointmentId });
};

// service for delete specific due by appointment id
const deleteSpecificDueByAppointmentId = async (appointmentId: string) => {
  return await AppointmentDue.findOneAndDelete({ appointment: appointmentId });
};

export default {
  createAppointmentDue,
  getSpecificDueByAppointmentId,
  deleteSpecificDueByAppointmentId
};
