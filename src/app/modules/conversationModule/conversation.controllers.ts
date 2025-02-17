import { Request, Response } from 'express';
import conversationService from './conversation.service';
import CustomError from '../../errors';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
// import SocketManager from '../../socket/manager.socket';
import mongoose, { Types } from 'mongoose';
import { IConversation } from './conversation.interface';
import asyncHandler from '../../../shared/asyncHandler';
import SocketManager from '../../socket/manager.socket';
import appointmentService from '../appointmentModule/appointment.service';
import { generateZegoToken } from '../../../utils/zegoTokenGenerator';
import callLogServices from '../callLogModule/callLog.services';
import appointmentDueServices from '../appointmentDueModule/appointmentDue.services';
import { IAppointmentDue } from '../appointmentDueModule/appointmentDue.interface';
import Big from 'big.js';
import userServices from '../userModule/user.services';
import { CURRENCY_ENUM } from '../../../enums/currency';
import walletServices from '../walletModule/wallet.services';
import paymentHistoryUtils from '../paymentHistoryModule/paymentHistory.utils';
import { generateTransactionId } from '../../../utils/generateTnxId';
import notificationUtils from '../notificationModule/notification.utils';
// import createNotification from '../../../utils/notificationCreator';

// controller for create new conversation
// const createConversation = async (req: Request, res: Response) => {
//   const conversationData = req.body;
//   const socketManager = SocketManager.getInstance();
//   let existConversation;
//   if(conversationData.type === 'direct'){
//     existConversation = await conversationService.retriveConversationBySenderIdAndReceiverId(conversationData.sender.senderId, conversationData.receiver.receiverId);
//   }else{
//     console.log('group')
//     const existGroupConversation = await conversationService.retriveConversationByReceiverId(conversationData.receiver.receiverId);
//     if(!existGroupConversation){
//       const conversation = await conversationService.createConversation(conversationData);
//       conversation._id = conversationData.receiver.receiverId
//     } // for group
//   }

//   if (existConversation) {
//     // function for cratea and join user using conversationId
//     socketManager.joinDirectUserOrCreateOnlyRoom(existConversation);

//     sendResponse(res, {
//       statusCode: StatusCodes.OK,
//       status: 'success',
//       message: `Conversation retrive successfull`,
//       data: existConversation,
//     });
//   } else {
//     const conversation = await conversationService.createConversation(conversationData);

//     if (!conversation) {
//       throw new CustomError.BadRequestError('Failed to create conversation!');
//     }

//     // function for cratea and join user using conversationId
//     socketManager.joinDirectUserOrCreateOnlyRoom(conversation);

//     // create notification for new conversation
//     // createNotification(conversationData.user.userId, conversationData.user.name, `New conversation created.`);

//     sendResponse(res, {
//       statusCode: StatusCodes.CREATED,
//       status: 'success',
//       message: `Conversation created successfull`,
//       data: conversation,
//     });
//   }
// };
const retriveConversationByAppointmentId = asyncHandler(async (req: Request, res: Response) => {
  const { appointmentId } = req.params;
  const socketManager = SocketManager.getInstance();
  if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
    throw new CustomError.BadRequestError('Invalid appointment id!');
  }

  const conversation = await conversationService.retriveConversationByAppointmentId(appointmentId);
  if (!conversation) {
    throw new CustomError.NotFoundError("Conversation channel hasn't initialized yet, wait for approved appointment!");
  }
  console.log(conversation);
  // join user to conversation room
  socketManager.joinUserToRoom(conversation);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Conversation retrive successfull',
    data: conversation,
  });
});

// controller for get all conversation by user (sender/receiver)
const retriveConversationsBySpecificUser = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const conversations = await conversationService.retriveConversationsBySpecificUser(userId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: `Conversations retrive successful!`,
    data: conversations,
  });
});

// controller for start call
const startCall = asyncHandler(async (req: Request, res: Response) => {
  const { conversationId, role, userId, callType } = req.body;
  const socketManager = SocketManager.getInstance();

  if (role !== 'therapist') {
    throw new CustomError.BadRequestError('Only therapist can start call');
  }

  // Validate request data
  if (!conversationId || !userId) {
    throw new CustomError.BadRequestError('Conversation ID and User ID are required!');
  }

  // Check if the conversation exists and is valid
  const conversation = await conversationService.retriveConversationByConversationId(conversationId);
  if (!conversation) {
    throw new CustomError.NotFoundError('Conversation not found!');
  }

  // Ensure the user is either the patient or the therapist
  if (conversation.therapist.therapistUserId.toString() !== userId) {
    throw new CustomError.BadRequestError('Your are unauthorized to start this call');
  }

  // Generate Zego Token for the user
  const zegoToken = generateZegoToken(conversationId);
  console.log(zegoToken);

  // Generate transaction ID for payment tracking
  // const transactionId = generateTransactionId();

  // Mark the appointment as "ongoing"
  // appointment.status = 'approved'; // Change to 'ongoing' if you have that status
  // appointment.feeInfo.patientTransactionId = transactionId;
  // await appointment.save();

  // create call log
  const callLog = await callLogServices.createCallLog({
    conversationId,
    senderId: new mongoose.Types.ObjectId(conversation.therapist.therapistUserId),
    receiverId: new mongoose.Types.ObjectId(conversation.patient.patientUserId),
    startedAt: new Date(),
    type: callType,
    status: 'ongoing',
  });

  // call socket method for handle start call
  socketManager.handleStartCall({
    conversationId: conversationId.toString(),
    callerId: conversation.therapist.therapistUserId.toString(),
    calleeId: conversation.patient.patientUserId.toString(),
    callLogId: callLog._id as string,
  });

  // Respond with Zego token and transaction details
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: `Call started successful!`,
    data: {
      zegoToken,
      // appointmentId,
      // userId,
      // transactionId,
    },
  });
});

// controller for end call
// const endCall = asyncHandler(async (req: Request, res: Response) => {
//   const { appointmentId, totalCallDuration, callLogId, recordingUrl } = req.body;

//   if (!appointmentId || typeof totalCallDuration !== 'number') {
//     throw new CustomError.BadRequestError('Appointment ID and valid total call duration are required');
//   }

//   const conversation = await conversationService.retriveConversationByAppointmentId(appointmentId);
//   if (!conversation) {
//     throw new CustomError.NotFoundError('Conversation not found for the appointment');
//   }

//   // Find the appointment
//   const appointment = await appointmentService.getSpecificAppointment(appointmentId);
//   if (!appointment) {
//     throw new CustomError.NotFoundError('Appointment not found');
//   }

//   const bookedFee = appointment.feeInfo.bookedFee.amount;
//   const holdFee = appointment.feeInfo.holdFee.amount;
//   const totalApppointmentFee = bookedFee + holdFee;
//   // console.log("total appointment fee", totalApppointmentFee);

//   // calculate total seconds per cent
//   const secondsPerCent = appointment.duration.value / (totalApppointmentFee * 100);
//   // console.log("seconds per cent", secondsPerCent);

//   // calculate total remaining duration based on appointment booked fee in seconds
//   const totalRemainingDuration = secondsPerCent * (bookedFee * 100);
//   // console.log("total remaining duration", totalRemainingDuration);

//   let totalDueCost = 0;
//   let due: IAppointmentDue | null = null;

//   if (totalCallDuration < totalRemainingDuration) {
//     const appointmentRemainingDuration = totalRemainingDuration - totalCallDuration;
//     const appointmentRemainingAmount = secondsPerCent * appointmentRemainingDuration; // amount in cent

//     // console.log("appointment booked fee", bookedFee)
//     // console.log("appointment remaining amount", appointmentRemainingAmount)

//     const callFee = (bookedFee * 100) - appointmentRemainingAmount;
//     // console.log("call fee", callFee)
//     appointment.feeInfo.bookedFee.amount -= (callFee / 100);
//     appointment.feeInfo.holdFee.amount += (callFee / 100);
//   } else {
//     // calculate total extra duration in seconds
//     const totalExtraDuration = totalCallDuration - totalRemainingDuration;
//     console.log("total extra duration", totalExtraDuration);
//     if (totalExtraDuration > 0) {
//       console.log("total extra duration is greater than 0");
//       const centPerSecond = Math.round((totalApppointmentFee * 100) / appointment.duration.value);
//       console.log("cent per second", centPerSecond);
//       totalDueCost = totalExtraDuration * centPerSecond;
//       console.log("total due cost", totalDueCost);
//     }

//     // add due fee in appointment fee info and transfer booked fee to hold fee
//     appointment.feeInfo.bookedFee.amount = 0;
//     appointment.feeInfo.holdFee.amount += bookedFee;
//     appointment.feeInfo.dueFee.amount += Math.round((totalDueCost / 100));

//     due = await appointmentDueServices.createAppointmentDue({
//       appointment: appointment._id as unknown as Types.ObjectId,
//       due: {
//         amount: totalDueCost,
//         currency: appointment.feeInfo.bookedFee.currency,
//       },
//     });

//     if (!due) {
//       throw new CustomError.BadRequestError('Appointment due not created');
//     }
//   }

//   await appointment.save();

//   // update call log.............
//   const payload = {
//     endedAt: new Date(),
//     duration: {
//       value: totalCallDuration,
//       type: 'seconds',
//     },
//     status: 'ended',
//     recordingUrl,
//   };
//   await callLogServices.updateCallLog(callLogId, payload);

//   sendResponse(res, {
//     statusCode: StatusCodes.OK,
//     status: 'success',
//     message: `Call ended, Summery generated successfull`,
//     data: {
//       totalCallDuration: {
//         amount: totalCallDuration,
//         unit: 'seconds',
//       },
//       totalCost: {
//         amount: totalApppointmentFee + (totalDueCost / 100),
//         currency: 'USD',
//       },
//       dueCost: {
//         dueId: due?._id as string,
//         amount: totalDueCost / 100,
//         currency: 'USD',
//       },
//       needPay: totalDueCost > 0 ? true : false,
//       appointmentId,
//     },
//   });
// });
const endCall = asyncHandler(async (req: Request, res: Response) => {
  const { appointmentId, totalCallDuration, callLogId, recordingUrl } = req.body;

  if (!appointmentId || typeof totalCallDuration !== 'number') {
    throw new CustomError.BadRequestError('Appointment ID and valid total call duration are required');
  }

  const callLog = await callLogServices.getCallLogById(callLogId);
  if (callLog && callLog.status !== 'ongoing') {
    throw new CustomError.NotFoundError('Only ongoing call can be ended');
  }

  const conversation = await conversationService.retriveConversationByAppointmentId(appointmentId);
  if (!conversation) {
    throw new CustomError.NotFoundError('Conversation not found for the appointment');
  }

  // Retrieve appointment
  const appointment = await appointmentService.getSpecificAppointment(appointmentId);
  if (!appointment) {
    throw new CustomError.NotFoundError('Appointment not found');
  }

  const bookedFeeCents = new Big(appointment.feeInfo.bookedFee.amount).times(100); // Convert to cents
  const holdFeeCents = new Big(appointment.feeInfo.holdFee.amount).times(100);
  const totalAppointmentFeeCents = bookedFeeCents.plus(holdFeeCents); // In cents
  const mainFeeCents = new Big(appointment.feeInfo.mainFee.amount).times(100);

  // Calculate seconds per cent
  const secondsPerCent = new Big(appointment.duration.value).div(mainFeeCents);

  // Calculate total remaining duration in seconds
  const totalRemainingDuration = secondsPerCent.times(bookedFeeCents);
  let totalDueCostCents = new Big(0);
  let due: IAppointmentDue | null = null;
  let callFeeCents = new Big(0);
  let totalCallCostCents = new Big(0);
  let isCuttingFromWallet = false;

  if (new Big(totalCallDuration).lte(totalRemainingDuration)) {
    const centPerSecond = mainFeeCents.div(appointment.duration.value);

    // If the call ends within the booked time
    const appointmentRemainingDuration = totalRemainingDuration.minus(totalCallDuration);
    const appointmentRemainingAmountCents = centPerSecond.times(appointmentRemainingDuration);

    callFeeCents = bookedFeeCents.minus(appointmentRemainingAmountCents);
    appointment.feeInfo.bookedFee.amount = bookedFeeCents.minus(callFeeCents).div(100).toNumber();
    appointment.feeInfo.holdFee.amount = holdFeeCents.plus(callFeeCents).div(100).toNumber();
  } else {
    // Extra duration beyond the booked time
    const totalExtraDuration = new Big(totalCallDuration).minus(totalRemainingDuration);
    if (totalExtraDuration.gt(0)) {
      const centPerSecond = mainFeeCents.div(appointment.duration.value);
      totalDueCostCents = totalExtraDuration.times(centPerSecond).round(0); // Round to nearest cent
      callFeeCents = totalDueCostCents;
      totalCallCostCents = centPerSecond.times(totalCallDuration);
    }

    // check user wallet
    const patientWallet = await walletServices.getSpecificWalletByUserId(appointment.patient as unknown as string);
    if (patientWallet) {
      const patientWalletBalanceCents = new Big(patientWallet.balance.amount).times(100);
      if (patientWalletBalanceCents.lt(totalDueCostCents)) {
        // throw new CustomError.BadRequestError('Insufficient balance in patient wallet');
        totalDueCostCents = totalDueCostCents.minus(patientWalletBalanceCents);
        appointment.feeInfo.holdFee.amount += patientWalletBalanceCents.div(100).toNumber();
        patientWallet.balance.amount = 0;
        isCuttingFromWallet = true;

        // create payment history
        paymentHistoryUtils.createPaymentHistory({
          user: new mongoose.Types.ObjectId(appointment.patient as unknown as string),
          purpose: 'Pay appointment due fee',
          transactionId: generateTransactionId(),
          currency: CURRENCY_ENUM.USD,
          amount: totalDueCostCents.div(100).toNumber(),
          paymentType: 'debit',
        });

        // create notification for patient
        notificationUtils.createNotification({
          consumer: new mongoose.Types.ObjectId(appointment.patient as unknown as string),
          content: {
            title: 'Due fee deducted from wallet',
            message: `Due fee deducted for the appointment on ${appointment.date}`,
            source: {
              type: 'appointment',
              id: new mongoose.Types.ObjectId(appointment._id as unknown as string),
            },
          },
        });
      } else {
        appointment.feeInfo.holdFee.amount += totalDueCostCents.div(100).toNumber();
        patientWallet.balance.amount = patientWalletBalanceCents.minus(totalDueCostCents).div(100).toNumber();

        // create payment history
        paymentHistoryUtils.createPaymentHistory({
          user: new mongoose.Types.ObjectId(appointment.patient as unknown as string),
          purpose: 'Pay appointment due fee',
          transactionId: generateTransactionId(),
          currency: CURRENCY_ENUM.USD,
          amount: totalDueCostCents.div(100).toNumber(),
          paymentType: 'debit',
        });

        // create notification for patient
        notificationUtils.createNotification({
          consumer: new mongoose.Types.ObjectId(appointment.patient as unknown as string),
          content: {
            title: 'Due fee deducted from wallet',
            message: `Due fee deducted for the appointment on ${appointment.date}`,
            source: {
              type: 'appointment',
              id: new mongoose.Types.ObjectId(appointment._id as unknown as string),
            },
          },
        });

        totalDueCostCents = new Big(0);
        isCuttingFromWallet = true;
      }
      await patientWallet.save();
    }
    // Transfer booked fee to hold fee and add due cost
    appointment.feeInfo.bookedFee.amount = 0;
    appointment.feeInfo.holdFee.amount += bookedFeeCents.div(100).toNumber();
    appointment.feeInfo.dueFee.amount += totalDueCostCents.div(100).toNumber();

    const existingDue = await appointmentDueServices.getSpecificDueByAppointmentId(appointment._id as unknown as string);

    if (!existingDue) {
      due = await appointmentDueServices.createAppointmentDue({
        appointment: appointment._id as unknown as Types.ObjectId,
        due: {
          amount: totalDueCostCents.div(100).toNumber(), // Convert back to dollars
          currency: appointment.feeInfo.bookedFee.currency,
        },
      });

      if (!due) {
        throw new CustomError.BadRequestError('Appointment due not created');
      }
    } else {
      due = existingDue;
      (existingDue.due.amount += totalDueCostCents.div(100).toNumber()), // Convert back to dollars
        await existingDue.save();
    }
  }

  await appointment.save();

  // Update call log
  const payload = {
    endedAt: new Date(),
    duration: {
      value: totalCallDuration,
      type: 'seconds',
    },
    status: 'ended',
    recordingUrl,
  };
  await callLogServices.updateCallLog(callLogId, payload);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: `Call ended, Summary generated successfully`,
    data: {
      // totalCallDuration: {
      //   amount: totalCallDuration,
      //   unit: 'seconds',
      // },
      // totalCost: {
      //   amount: totalDueCostCents.gt(0)
      //     ? Number(totalAppointmentFeeCents.plus(new Big(appointment.feeInfo.dueFee.amount).times(100)).div(100).toFixed(2))
      //     : Number(holdFeeCents.plus(callFeeCents).div(100).toString()),
      //   currency: CURRENCY_ENUM.USD,
      // },
      dueCost: {
        dueId: (due?._id as string) || null,
        amount: Number(appointment.feeInfo.dueFee.amount.toFixed(2)),
        currency: CURRENCY_ENUM.USD,
      },
      remainingCost: {
        amount:
          totalDueCostCents.lte(0) && !isCuttingFromWallet
            ? Number(mainFeeCents.minus(holdFeeCents).minus(callFeeCents).div(100).toString())
            : 0,
        currency: CURRENCY_ENUM.USD,
      },
      needPay: totalDueCostCents.gt(0),
      appointmentId,
    },
  });
});

export default {
  retriveConversationByAppointmentId,
  retriveConversationsBySpecificUser,
  startCall,
  endCall,
};
