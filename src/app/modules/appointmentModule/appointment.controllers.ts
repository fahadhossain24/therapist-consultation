import { Request, Response } from 'express';
import asyncHandler from '../../../shared/asyncHandler';
import appointmentService from './appointment.service';
import CustomError from '../../errors';
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

// controller for create new appointment
const createAppointment = asyncHandler(async (req: Request, res: Response) => {
  const appointmentData = req.body;

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

export default {
  createAppointment,
};
