import express from 'express';
import conversationControllers from './conversation.controllers';
import authorization from '../../middlewares/authorization';

const conversationRouter = express.Router();
// conversationRouter.use(authorization('super-admin', 'admin', 'patient', 'therapist'))

conversationRouter.get('/retrive/specific/:appointmentId', conversationControllers.retriveConversationByAppointmentId)

conversationRouter.get('/retrive/:userId', conversationControllers.retriveConversationsBySpecificUser)

conversationRouter.post('/start-call', conversationControllers.startCall)

conversationRouter.post('/end-call', conversationControllers.endCall)

export default conversationRouter;