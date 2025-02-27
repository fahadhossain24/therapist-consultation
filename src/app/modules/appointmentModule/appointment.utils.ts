import mongoose, { Types } from 'mongoose';
import { convertTo24HourFormat } from '../../../utils/convertTo24HourFormat';
import notificationUtils from '../notificationModule/notification.utils';
import Appointment from './appointment.model';
import userServices from '../userModule/user.services';

export function generateNextAppointmentId(lastAppointmentId: string | null): string {
  const lastNumber = lastAppointmentId ? parseInt(lastAppointmentId.split('-')[1], 10) : 0;

  const nextNumber = (lastNumber + 1).toString().padStart(4, '0');

  return `APPO-${nextNumber}`;
}

// utility function fot send notification before 1 hour for all upcomming appointments of a patient and therapist also
export async function sendNotificationBefore1Hour() {
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour later

  // Fetch only relevant appointments happening exactly 1 hour later
  const appointments = await Appointment.find({
    status: { $in: ['approved', 'rescheduled'] },
  });

  if (appointments.length === 0) return;

  // Process all appointments in parallel
  await Promise.all(
    appointments.map(async (appointment) => {
      const [startTime] = appointment.slot.split(' - '); // Extract start time
      const formattedDate = appointment.date.toISOString().split('T')[0];
      const appointmentDateTime = new Date(`${formattedDate}T${convertTo24HourFormat(startTime)}`);

      if (
        !isNaN(appointmentDateTime.getTime()) &&
        appointmentDateTime.toISOString().slice(0, 16) === oneHourLater.toISOString().slice(0, 16)
      ) {
        // Fetch patient & therapist in parallel
        const [patient, therapist] = await Promise.all([
          userServices.getSpecificUser(appointment.patient as unknown as string),
          userServices.getSpecificUser(appointment.therapist as unknown as string),
        ]);

        if (!patient || !therapist) return;

        // Send notifications in parallel
        await Promise.all([
          notificationUtils.createNotification({
            consumer: new mongoose.Types.ObjectId(appointment.patient),
            content: {                                                                                                    
              title: 'Upcoming Appointment Reminder – 1 Hour Left.',
              message: `Dear ${patient.firstName}, your appointment with ${therapist.firstName} ${therapist.lastName} starts in 1 hour. Please ensure you're ready!`,
              source: { type: 'appointment', id: appointment._id as unknown as Types.ObjectId },
            },
          }),

          notificationUtils.createNotification({
            consumer: new mongoose.Types.ObjectId(appointment.therapist),
            content: {
              title: 'Scheduled Appointment Reminder – Starts in 1 Hour.',
              message: `Dear ${therapist.firstName}, you have a scheduled appointment with ${patient.firstName} ${patient.lastName} in 1 hour. Please be prepared!`,
              source: { type: 'appointment', id: appointment._id as unknown as Types.ObjectId },
            },
          }),
        ]);

        console.log(`Notification sent for appointment: ${appointment._id}`);
      }
    }),
  );
}
