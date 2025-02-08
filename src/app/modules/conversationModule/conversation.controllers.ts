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
  const { conversationId, userId, callType } = req.body;
  const socketManager = SocketManager.getInstance();

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
  if (conversation.patient.patientUserId.toString() !== userId && conversation.therapist.therapistUserId.toString() !== userId) {
    throw new CustomError.BadRequestError('Your are unauthorized to start this call');
  }

  // Generate Zego Token for the user
  const zegoToken = generateZegoToken(conversationId);

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
    callerId: conversation.patient.patientUserId.toString(),
    calleeId: conversation.therapist.therapistUserId.toString(),
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
const endCall = asyncHandler(async (req: Request, res: Response) => {
  const { appointmentId, totalCallDuration, callLogId } = req.body;

  if (!appointmentId || typeof totalCallDuration !== 'number') {
    throw new CustomError.BadRequestError('Appointment ID and valid total call duration are required');
  }

  // Find the appointment
  const appointment = await appointmentService.getSpecificAppointment(appointmentId);
  if (!appointment) {
    throw new CustomError.NotFoundError('Appointment not found');
  }

  const bookedFee = appointment.feeInfo.bookedFee.amount;
  const holdFee = appointment.feeInfo.holdFee.amount;
  const totalApppointmentFee = bookedFee + holdFee;

  // calculate total seconds per cent
  const secondsPerCent = appointment.duration.value / (totalApppointmentFee * 100);

  // calculate total remaining duration based on appointment booked fee in seconds
  const totalRemainingDuration = secondsPerCent * (bookedFee * 100);

  let totalDueCost = 0;
  let due: IAppointmentDue | null = null;

  if (totalCallDuration < totalRemainingDuration) {
    const appointmentRemainingDuration = totalRemainingDuration - totalCallDuration;
    const appointmentRemainingAmount = secondsPerCent * appointmentRemainingDuration; // amount in cent

    const callFee = bookedFee - appointmentRemainingAmount;
    appointment.feeInfo.bookedFee.amount -= callFee;
    appointment.feeInfo.holdFee.amount += callFee;
  } else {
    // calculate total extra duration in seconds
    const totalExtraDuration = totalCallDuration - totalRemainingDuration;

    if (totalExtraDuration > 0) {
      const centPerSecond = (totalApppointmentFee * 100) / appointment.duration.value;
      totalDueCost = totalExtraDuration * centPerSecond;
    }

    // add due fee in appointment fee info and transfer booked fee to hold fee
    appointment.feeInfo.bookedFee.amount = 0;
    appointment.feeInfo.holdFee.amount += bookedFee;
    appointment.feeInfo.dueFee.amount += totalDueCost;
    await appointment.save();

    due = await appointmentDueServices.createAppointmentDue({
      appointment: appointment._id as unknown as Types.ObjectId,
      due: {
        amount: totalDueCost,
        currency: appointment.feeInfo.bookedFee.currency,
      },
    });

    if (!due) {
      throw new CustomError.BadRequestError('Appointment due not created');
    }
  }

  // update call log.............
  const payload = {
    endedAt: new Date(),
    duration: {
      value: totalCallDuration,
      type: 'seconds',
    },
    status: 'ended',
  };
  await callLogServices.updateCallLog(callLogId, payload);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: `Call ended, Summery generated successfull`,
    data: {
      totalCallDuration: {
        amount: totalCallDuration,
        unit: 'seconds',
      },
      totalCost: {
        amount: totalApppointmentFee + totalDueCost,
        currency: 'USD',
      },
      dueCost: {
        dueId: due?._id as string,
        amount: totalDueCost / 100,
        currency: 'USD',
      },
      needPay: totalDueCost > 0 ? true : false,
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
