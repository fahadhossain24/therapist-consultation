import express from 'express';
import appointmentControllers from './appointment.controllers';
import authorization from '../../middlewares/authorization';

const appointmentRouter = express.Router();

appointmentRouter.post('/create', authorization('therapist', 'patient'), appointmentControllers.createAppointment);

appointmentRouter.get('/retrive/:userId', authorization('therapist', 'patient'), appointmentControllers.getAppointmentsByUserAndStatus);

appointmentRouter.get(
    '/retrive/todays/approved/:therapistId',
    authorization('therapist', 'patient'),
    appointmentControllers.getTodayApprovedAppointmentsByTherapist,
);

appointmentRouter.get(
    '/retrive/slots/by-therapist/:therapistId',
    authorization('therapist', 'patient'),
    appointmentControllers.getAvailableSlotsByDateAndTherapist,
);

appointmentRouter.delete(
    '/cancel/:appointmentId',
    authorization('patient', 'therapist'),
    appointmentControllers.cancelAppointmentByPatientBeforeApproved,
);

appointmentRouter.delete(
    '/cancel/after-approval/:appointmentId',
    authorization('patient', 'therapist'),
    appointmentControllers.cancelAppointmentByPatientAfterApproved,
);

appointmentRouter.patch(
    '/accept/:appointmentId',
    authorization('therapist', 'patient'),
    appointmentControllers.acceptAppointmentByTherapistFromPending,
);

appointmentRouter.patch(
    '/approve-cancelled-request/:appointmentId',
    authorization('therapist', 'patient'),
    appointmentControllers.approveAppointmentCancelledRequest,
);

appointmentRouter.patch(
    '/reschedule/:appointmentId',
    authorization('therapist', 'patient'),
    appointmentControllers.rescheduleAppointmentByTherapistAfterMissed,
);

appointmentRouter.get('/retrive/specific/:appointmentId', appointmentControllers.getSpecificAppointment);

appointmentRouter.get('/retrive/all/sss', appointmentControllers.getAppointments);

appointmentRouter.post(
    '/pay-appointment-due-amount/:appointmentId',
    authorization('therapist', 'patient'),
    appointmentControllers.payPatientAppointmentDueAmount,
);

appointmentRouter.patch(
    '/mark-appointment-as-completed',
    authorization('therapist', 'patient'),
    appointmentControllers.markAppointmentAsCompleted,
);

appointmentRouter.post(
    '/appointment-payment/initiate',
    authorization('patient'),
    appointmentControllers.initiateAppointmentPaymentOrder,
);

appointmentRouter.get(
    '/appointment-payment/return',
    appointmentControllers.returnAppointmentPaymentOrder,
);

appointmentRouter.get(
    '/appointment-payment/cancel',
    appointmentControllers.cancelAppointmentPaymentOrder,
);

export default appointmentRouter;
