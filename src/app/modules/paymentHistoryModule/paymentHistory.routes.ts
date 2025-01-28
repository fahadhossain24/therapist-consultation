import express from 'express';
import paymentHistoryControllers from './paymentHistory.controllers';
import authentication from '../../middlewares/authorization';


const paymentHistoryRouter = express.Router();

paymentHistoryRouter.get('/retrive/user/:userId', authentication('patient', 'therapist'), paymentHistoryControllers.getAllPaymentHistoryByUserId)

paymentHistoryRouter.delete('/delete/all', authentication('admin', 'super-admin'), paymentHistoryControllers.deleteAllPaymentHistories)

export default paymentHistoryRouter