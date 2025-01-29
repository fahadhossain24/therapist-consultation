import express from 'express';
import appointmentControllers from './appointment.controllers';

const appointmentRouter = express.Router();

appointmentRouter.post('/create', appointmentControllers.createAppointment);

export default appointmentRouter;
