import { Request, Response } from 'express';
import asyncHandler from '../../../shared/asyncHandler';
import appointmentService from './appointment.service';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import userServices from '../userModule/user.services';
import therapistProfileServices from '../profileModule/therapistProfile/therapistProfile.services';
import walletServices from '../walletModule/wallet.services';
import paymentHistoryUtils from '../paymentHistoryModule/paymentHistory.utils';
import mongoose, { Types } from 'mongoose';
import therapistProfessionalServices from '../professionalModule/therapistProfessional/therapistProfessional.services';
import invoiceUtils from '../invoiceModule/invoice.utils';
import patientProfileServices from '../profileModule/patientProfile/patientProfile.services';
import notificationUtils from '../notificationModule/notification.utils';
import CustomError from '../../errors';
import Appointment from './appointment.model';
import { generateNextAppointmentId } from './appointment.utils';
import conversationUtils from '../conversationModule/conversation.utils';
import { IConversation } from '../conversationModule/conversation.interface';
import SocketManager from '../../socket/manager.socket';
import appointmentDueServices from '../appointmentDueModule/appointmentDue.services';

// controller for create new appointment
const createAppointment = asyncHandler(async (req: Request, res: Response) => {
  const appointmentData = req.body;

  const lastAppointment = await Appointment.findOne().sort('-createdAt');
  const appointmentId = generateNextAppointmentId(lastAppointment?.appointmentId as string);
  appointmentData.appointmentId = appointmentId;

  // ...............Validate patient and therapist existence.....................
  const patientUser = await userServices.getSpecificUser(appointmentData.patient);
  const therapistUser = await userServices.getSpecificUser(appointmentData.therapist);

  const patient = await patientProfileServices.getPatientProfileByUserId(appointmentData.patient);
  const therapist = await therapistProfileServices.getTherapistProfileByUserId(appointmentData.therapist);

  if (!patientUser) {
    throw new CustomError.NotFoundError('Patient not found!');
  }

  if (!therapistUser) {
    throw new CustomError.NotFoundError('Therapist not found!');
  }

  if (!therapist) {
    throw new CustomError.NotFoundError('Therapist profile not found!');
  }

  // .....................Ensure appointment date is in the future.........................
  const currentDate = new Date();
  const appointmentDate = new Date(appointmentData.date);

  if (appointmentDate < currentDate) {
    throw new CustomError.BadRequestError('Appointment date must be in the future!');
  }

  // .......................Check therapist availability for the provided slot and limit for booked appointments.......................
  const bookedAppointments = await appointmentService.getAppointmentsByDateAndTherapist(appointmentDate, appointmentData.therapist);

  const availability = therapist.availabilities.find((a) => a.dayIndex === appointmentDate.getDay() && !a.isClosed);
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDayOfWeek = daysOfWeek[appointmentDate.getDay()];

  if (!availability) {
    throw new CustomError.BadRequestError(`Therapist is not available on ${currentDayOfWeek}!`);
  }

  if (!availability.slotsPerDay.includes(appointmentData.slot)) {
    throw new CustomError.BadRequestError(`The selected slot '${appointmentData.slot}' is not available on ${currentDayOfWeek}!`);
  }

  // at a time multiple appointments are not allowed in same slot (which already booked)
  const bookedSlots = bookedAppointments.map((a) => a.slot);
  if (bookedSlots.includes(appointmentData.slot)) {
    throw new CustomError.BadRequestError(
      `Appointment is already booked for the selected slot '${appointmentData.slot}' on ${currentDayOfWeek}!`,
    );
  }

  if (bookedAppointments.length >= availability.appointmentLimit) {
    throw new CustomError.BadRequestError(`Appointment limit for ${currentDayOfWeek} has been exceeded!`);
  }

  // .................Handle wallet balance and transactions..................
  const patientWallet = await walletServices.getSpecificWalletByUserId(appointmentData.patient);

  if (!patientWallet) {
    throw new CustomError.NotFoundError('Patient wallet not found!');
  }

  if (appointmentData.isAvailableInWallet) {
    // Check if sufficient balance is available
    if (patientWallet.balance.amount < appointmentData.feeInfo.bookedFee.amount) {
      throw new CustomError.BadRequestError('Sorry, Insufficient balance in patient wallet!');
    }

    // Hold the amount in the wallet
    patientWallet.balance.amount -= appointmentData.feeInfo.bookedFee.amount;
    patientWallet.holdBalance.amount += appointmentData.feeInfo.bookedFee.amount;

    // await walletServices.updateWalletById(patientWallet.user.id as unknown as string, {
    //   balance: {
    //     amount: patientWallet.balance.amount,
    //     currency: patientWallet.balance.currency,
    //   },
    //   holdBalance: {
    //     amount: patientWallet.holdBalance.amount,
    //     currency: patientWallet.holdBalance.currency,
    //   },
    // });
  } else {
    // Handle payment through transaction ID
    if (!appointmentData.feeInfo.patientTransactionId) {
      throw new CustomError.BadRequestError('Transaction ID is required for booked time payment!');
    }

    // ..................Record payment in payment history............................
    await paymentHistoryUtils.createPaymentHistory({
      user: new mongoose.Types.ObjectId(appointmentData.patient),
      purpose: 'Appointment booking',
      amount: appointmentData.feeInfo.bookedFee.amount,
      transactionId: appointmentData.feeInfo.patientTransactionId,
      currency: appointmentData.feeInfo.bookedFee.currency,
      paymentType: 'debit',
    });

    // Add the fee to the wallet's hold balance
    patientWallet.holdBalance.amount += appointmentData.feeInfo.bookedFee.amount;

    // await walletService.updateWalletById(patientWallet._id, {
    //   holdBalance: patientWallet.holdBalance,
    // });
  }

  // save the patient wallet
  await patientWallet.save();

  // ....................Increase therapist's consume count...............
  const therapistProfessional = await therapistProfessionalServices.getSpecificTherapistProfessional(appointmentData.therapist);

  if (therapistProfessional) {
    therapistProfessional.consumeCount += 1;
    await therapistProfessional.save();
  } else {
    throw new CustomError.NotFoundError('Therapist professional profile not found!');
  }

  // Create a new appointment
  const newAppointment = await appointmentService.createAppointment(appointmentData);
  if (!newAppointment) {
    throw new CustomError.BadRequestError('Failed to create new appointment!');
  }

  // ...................create invoice for the patient...................
  await invoiceUtils.createInvoice({
    user: {
      type: 'patient',
      id: new mongoose.Types.ObjectId(appointmentData.patient),
    },
    appointment: newAppointment._id as unknown as Types.ObjectId,
  });

  // ...................create notification for the patient...................
  await notificationUtils.createNotification({
    consumer: new mongoose.Types.ObjectId(appointmentData.patient),
    content: {
      title: 'New Appointment Booked',
      message: `Your appointment with ${therapistUser.firstName} ${therapistUser.lastName} has been booked.`,
      source: {
        type: 'appointment',
        id: newAppointment._id as unknown as Types.ObjectId,
      },
    },
  });

  // ...................create notification for the therapist...................
  await notificationUtils.createNotification({
    consumer: new mongoose.Types.ObjectId(appointmentData.therapist),
    content: {
      title: 'New Appointment Booked',
      message: `A new appointment has been booked with you.`,
      source: {
        type: 'appointment',
        id: newAppointment._id as unknown as Types.ObjectId,
      },
    },
  });

  // Send success response
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    status: 'success',
    message: 'Appointment created successfully',
    data: newAppointment,
  });
});

// controller to get appointments by user(therapist/patient) and status
const getAppointmentsByUserAndStatus = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { role, appointmentStatus } = req.query;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 8;

  if (!role || !appointmentStatus) {
    throw new CustomError.BadRequestError('User type and status are required!');
  }

  const skip = (page - 1) * limit;
  const appointments = await appointmentService.getAppointmentsByUserAndStatus(
    role as string,
    userId,
    appointmentStatus as string,
    skip,
    limit,
  );

  const totalAppointments = appointments?.length || 0;
  const totalPages = Math.ceil(totalAppointments / limit);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Appointments retrieved successfully',
    meta: {
      totalData: totalAppointments,
      totalPage: totalPages,
      currentPage: page,
      limit: limit,
    },
    data: appointments,
  });
});

// controller to get available slots of specific date by therapist
const getAvailableSlotsByDateAndTherapist = asyncHandler(async (req: Request, res: Response) => {
  const { therapistId } = req.params;
  const { date } = req.query;

  if (!date) {
    throw new CustomError.BadRequestError('Date is required!');
  }

  const day = new Date(date as string).getDay();

  const bookedAppointments = await appointmentService.getAppointmentsByDateAndTherapist(new Date(date as string), therapistId);

  const availability = await therapistProfileServices.getTherapistProfileByUserId(therapistId);
  if (!availability) {
    throw new CustomError.NotFoundError('Therapist not found!');
  }

  const bookedSlots = bookedAppointments.map((a) => a.slot);
  const slots: string[] = [];
  availability.availabilities.map((singleDay) => {
    if (singleDay.dayIndex === day) {
      singleDay.slotsPerDay.map((singleSlot) => {
        if (!bookedSlots.includes(singleSlot)) {
          slots.push(singleSlot);
        }
      });
    }
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Available slots retrieved successfully',
    data: slots,
  });
});

// controller to cancel appointment by patient before approved
const cancelAppointmentByPatientBeforeApproved = asyncHandler(async (req: Request, res: Response) => {
  const { appointmentId } = req.params;

  const appointment = await appointmentService.getSpecificAppointment(appointmentId);
  if (!appointment) {
    throw new CustomError.NotFoundError('Appointment not found!');
  }

  const therapistUser = await userServices.getSpecificUser(appointment.therapist as unknown as string);
  const patienttUser = await userServices.getSpecificUser(appointment.patient as unknown as string);

  if (appointment.status !== 'pending') {
    throw new CustomError.BadRequestError('Only pending appointments can be cancelled!');
  }

  const updatedAppointment = await appointmentService.updateSpecificAppointmentById(appointmentId, { status: 'cancelled' });

  // make notification for the patient
  await notificationUtils.createNotification({
    consumer: new mongoose.Types.ObjectId(appointment.patient),
    content: {
      title: 'Appointment Cancelled',
      message: `Your appointment with ${therapistUser.firstName} ${therapistUser.lastName} has been cancelled.`,
      source: {
        type: 'appointment',
        id: appointment._id as unknown as Types.ObjectId,
      },
    },
  });

  // make notification for the therapist
  await notificationUtils.createNotification({
    consumer: new mongoose.Types.ObjectId(appointment.therapist),
    content: {
      title: 'Appointment Cancelled',
      message: `Your appointment with ${patienttUser.firstName} ${patienttUser.lastName} has been cancelled.`,
      source: {
        type: 'appointment',
        id: appointment._id as unknown as Types.ObjectId,
      },
    },
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Appointment cancelled successfully',
    data: updatedAppointment,
  });
});

// controller to cancel appointment by patient after approved
const cancelAppointmentByPatientAfterApproved = asyncHandler(async (req: Request, res: Response) => {
  const { appointmentId } = req.params;
  const { cancelReason } = req.body;

  const appointment = await appointmentService.getSpecificAppointment(appointmentId);
  if (!appointment) {
    throw new CustomError.NotFoundError('Appointment not found!');
  }

  if (!cancelReason) {
    throw new CustomError.BadRequestError('Cancel reason is required!');
  }

  const therapistUser = await userServices.getSpecificUser(appointment.therapist as unknown as string);
  const patienttUser = await userServices.getSpecificUser(appointment.patient as unknown as string);

  if (appointment.status !== 'approved') {
    throw new CustomError.BadRequestError('Only approved appointments can be cancelled!');
  }

  const updatedAppointment = await appointmentService.updateSpecificAppointmentById(appointmentId, {
    status: 'cancelled-requested',
    cancelReason,
  });

  // make notification for the patient
  await notificationUtils.createNotification({
    consumer: new mongoose.Types.ObjectId(appointment.patient),
    content: {
      title: 'Appointment Cancelled Request',
      message: `You requested to cancel appointment with ${therapistUser.firstName} ${therapistUser.lastName}`,
      source: {
        type: 'appointment',
        id: appointment._id as unknown as Types.ObjectId,
      },
    },
  });

  // make notification for the therapist
  await notificationUtils.createNotification({
    consumer: new mongoose.Types.ObjectId(appointment.therapist),
    content: {
      title: 'Appointment Cancelled Request',
      message: `${patienttUser.firstName} ${patienttUser.lastName} requested to cancel the appointment. Need to approve!`,
      source: {
        type: 'appointment',
        id: appointment._id as unknown as Types.ObjectId,
      },
    },
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Appointment cancelled successfully',
    data: updatedAppointment,
  });
});

// controller to accept appointment by therapist from pending
const acceptAppointmentByTherapistFromPending = asyncHandler(async (req: Request, res: Response) => {
  const { appointmentId } = req.params;
  const socketManager = SocketManager.getInstance();

  const appointment = await appointmentService.getSpecificAppointment(appointmentId);
  if (!appointment) {
    throw new CustomError.NotFoundError('Appointment not found!');
  }

  const therapistUser = await userServices.getSpecificUser(appointment.therapist as unknown as string);
  const patienttUser = await userServices.getSpecificUser(appointment.patient as unknown as string);

  if (appointment.status !== 'pending') {
    throw new CustomError.BadRequestError('Only pending appointments can be accepted!');
  }

  const updatedAppointment = await appointmentService.updateSpecificAppointmentById(appointmentId, { status: 'approved' });

  // make notification for the patient
  await notificationUtils.createNotification({
    consumer: new mongoose.Types.ObjectId(appointment.patient),
    content: {
      title: 'Appointment Approved',
      message: `Your appointment with ${therapistUser.firstName} ${therapistUser.lastName} is approved`,
      source: {
        type: 'appointment',
        id: appointment._id as unknown as Types.ObjectId,
      },
    },
  });

  // create new conversation for the appointment by appointmentId
  const conversationPayload: Partial<IConversation> = {
    patient: {
      name: patienttUser.firstName + ' ' + patienttUser.lastName,
      patientUserId: patienttUser._id as unknown as string,
    },
    therapist: {
      name: therapistUser.firstName + ' ' + therapistUser.lastName,
      therapistUserId: therapistUser._id as unknown as string,
    },
    appointment: new mongoose.Types.ObjectId(appointmentId),
  };
  const conversation = await conversationUtils.createConversation(conversationPayload);

  if (conversation) {
    // join socket room using appointmentId
    socketManager.joinUserToRoom(conversation);
  } else {
    console.log('conversation not created and failed to join this conversation room!');
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Appointment accepted successfully',
    data: updatedAppointment,
  });
});

// controller to approved cancelled request by therapist from cancelled-requested status
const approveAppointmentCancelledRequest = asyncHandler(async (req: Request, res: Response) => {
  const { appointmentId } = req.params;

  const appointment = await appointmentService.getSpecificAppointment(appointmentId);
  if (!appointment) {
    throw new CustomError.NotFoundError('Appointment not found!');
  }

  const therapistUser = await userServices.getSpecificUser(appointment.therapist as unknown as string);
  const patientUser = await userServices.getSpecificUser(appointment.patient as unknown as string);

  if (appointment.status !== 'cancelled-requested') {
    throw new CustomError.BadRequestError('Only cancelled requests can be approved!');
  }

  const updatedAppointment = await appointmentService.updateSpecificAppointmentById(appointmentId, {
    status: 'cancelled-approved',
  });

  // make notification for the patient
  await notificationUtils.createNotification({
    consumer: new mongoose.Types.ObjectId(appointment.patient),
    content: {
      title: 'Your cancelled request is approved',
      message: `Your appointment with ${therapistUser.firstName} ${therapistUser.lastName} is cancelled`,
      source: {
        type: 'appointment',
        id: appointment._id as unknown as Types.ObjectId,
      },
    },
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Appointment cancelled successfully',
    data: updatedAppointment,
  });
});

// controller to reschedule appointment by therapist after missed
const rescheduleAppointmentByTherapistAfterMissed = asyncHandler(async (req: Request, res: Response) => {
  const { appointmentId } = req.params;
  const { date, slot, reason } = req.body;

  if (!date || !slot || !reason) {
    throw new CustomError.BadRequestError('date, slot and reason are required for rescheduling!');
  }

  const appointment = await appointmentService.getSpecificAppointment(appointmentId);
  if (!appointment) {
    throw new CustomError.NotFoundError('Appointment not found!');
  }

  const therapistUser = await userServices.getSpecificUser(appointment.therapist as unknown as string);
  const patientUser = await userServices.getSpecificUser(appointment.patient as unknown as string);

  if (appointment.status !== 'missed') {
    throw new CustomError.BadRequestError('Only missed appointments can be rescheduled!');
  }

  const updatedAppointment = await appointmentService.updateSpecificAppointmentById(appointmentId, {
    date: new Date(date),
    slot,
    rescheduleReason: reason,
    status: 'rescheduled',
  });

  if (!updatedAppointment?.isModified) {
    throw new CustomError.BadRequestError('Failed to reschedule appointment!');
  }

  // make notification for the patient
  await notificationUtils.createNotification({
    consumer: new mongoose.Types.ObjectId(appointment.patient),
    content: {
      title: 'Your appointment is rescheduled',
      message: `Your appointment with ${therapistUser.firstName} ${therapistUser.lastName} is rescheduled on ${date} at ${slot}`,
      source: {
        type: 'appointment',
        id: appointment._id as unknown as Types.ObjectId,
      },
    },
  });

  // make notification for the therapist
  await notificationUtils.createNotification({
    consumer: new mongoose.Types.ObjectId(appointment.therapist),
    content: {
      title: 'You rescheduled an appointment',
      message: `Your appointment with ${patientUser.firstName} ${patientUser.lastName} is rescheduled on ${date} at ${slot}`,
      source: {
        type: 'appointment',
        id: appointment._id as unknown as Types.ObjectId,
      },
    },
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Appointment rescheduled successfully',
    data: updatedAppointment,
  });
});

// controller to retrive specific appointment by appointment id
const getSpecificAppointment = asyncHandler(async (req: Request, res: Response) => {
  const { appointmentId } = req.params;
  const appointment = await appointmentService.getSpecificAppointment(appointmentId);
  if (!appointment) {
    throw new CustomError.NotFoundError('Appointment not found!');
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Appointment retrieved successfully',
    data: appointment,
  });
});

// controller to get all appointments
const getAppointments = asyncHandler(async (req: Request, res: Response) => {
  const { searchQuery } = req.query;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 8;

  const skip = (page - 1) * limit;

  const appointments = await appointmentService.getAppointments(searchQuery as string, skip, limit);
  const totalAppointments = appointments?.length || 0;
  const totalPages = Math.ceil(totalAppointments / limit);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Appointments retrieved successfully',
    meta: {
      totalData: totalAppointments,
      totalPage: totalPages,
      currentPage: page,
      limit: limit,
    },
    data: appointments,
  });
});

// controller for pay patient appointment due amount
const payPatientAppointmentDueAmount = asyncHandler(async (req: Request, res: Response) => {
  const { appointmentId } = req.params;
  const paymentData = req.body;

  const appointment = await appointmentService.getSpecificAppointment(appointmentId);
  if (!appointment) {
    throw new CustomError.NotFoundError('Appointment not found!');
  }
  
  const due = await appointmentDueServices.getSpecificDueByAppointmentId(appointmentId);
  if (!due) {
    throw new CustomError.NotFoundError('Due not found!');
  }

  const paymentPayload = {
    user: new mongoose.Types.ObjectId(appointment.patient),
    purpose: 'Pay appointment due fee',
    transactionId: paymentData.transactionId,
    currency: paymentData.currency,
    amount: paymentData.amount,
    paymentType: 'debit',
  }

  const payment = await paymentHistoryUtils.createPaymentHistory(paymentPayload);
  if(!payment){
    throw new CustomError.BadRequestError('Failed to make payment!');
  }

  // make notification for the payment
  await notificationUtils.createNotification({
    consumer: new mongoose.Types.ObjectId(appointment.patient),
    content: {
      title: 'Payment Successfull',
      message: `Your payment for appointment due is successfull!`,
      source: {
        type: 'paymentHistory',
        id: payment._id as unknown as Types.ObjectId,
      },
    },
  });

  // delete due document for the appointment from database
  await appointmentDueServices.deleteSpecificDueByAppointmentId(appointmentId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Payment successfull',
  });
});

export default {
  createAppointment,
  getAppointmentsByUserAndStatus,
  getAvailableSlotsByDateAndTherapist,
  cancelAppointmentByPatientBeforeApproved,
  cancelAppointmentByPatientAfterApproved,
  acceptAppointmentByTherapistFromPending,
  approveAppointmentCancelledRequest,
  rescheduleAppointmentByTherapistAfterMissed,
  getSpecificAppointment,
  getAppointments,
};
