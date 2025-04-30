// controller for create new messages inside a conversation

import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../../shared/sendResponse';
import CustomError from '../../errors';
import messageServices from './message.services';
import { Request, Response } from 'express';
import fileUploader from '../../../utils/fileUploader';
import { FileArray } from 'express-fileupload';
import Attachment from '../attachmentModule/attachment.model';
// import createNotification from '../../../utils/notificationCreator';
import conversationService from '../conversationModule/conversation.service';
import mongoose, { Types } from 'mongoose';
import asyncHandler from '../../../shared/asyncHandler';
import SocketManager from '../../socket/manager.socket';
import therapistProfileServices from '../profileModule/therapistProfile/therapistProfile.services';
import userServices from '../userModule/user.services';
import appointmentService from '../appointmentModule/appointment.service';
import messageCostService from '../messageCostModule/messageCost.service';
import walletServices from '../walletModule/wallet.services';
import paymentHistoryUtils from '../paymentHistoryModule/paymentHistory.utils';
import { generateTransactionId } from '../../../utils/generateTnxId';
import notificationUtils from '../notificationModule/notification.utils';

const createMessage = asyncHandler(async (req: Request, res: Response) => {
    const messageData = req.body;
    const files = req.files;
    const socketManager = SocketManager.getInstance();

    // Validate and sanitize message data
    //   messageData.content = validator.escape(messageData.content);

    const conversation = await conversationService.retriveConversationByConversationId(messageData.conversation);
    if (!conversation) {
        throw new CustomError.BadRequestError('Invalid conversation');
    }

    if (messageData.senderRole === 'patient' && messageData.sender !== conversation.patient.patientUserId.toString()) {
        throw new CustomError.BadRequestError('You are not authorized to send a message in this conversation!');
    }

    if (messageData.senderRole === 'therapist' && messageData.sender !== conversation.therapist.therapistUserId.toString()) {
        throw new CustomError.BadRequestError('You are not authorized to send a message in this conversation!');
    }

    if (files && messageData.type !== 'attachment') {
        throw new CustomError.BadRequestError('Please use attachment as message type!');
    }

    const messageCost = await messageCostService.getMessageCosts();
    if (!messageCost) {
        throw new CustomError.BadRequestError('Message cost not found.');
    }

    // Step 4: Check wallet and character count for patients
    // if (messageData.senderRole === 'patient' && messageData.content) {
    //   if (conversation.characterNewCount >= messageCost.maxCharacters) {
    //     console.log('inside', conversation.characterNewCount, messageCost.maxCharacters);
    //     const therapistProfile = await therapistProfileServices.getTherapistProfileByUserId(conversation.therapist.therapistUserId);
    //     if (!therapistProfile || !therapistProfile.chargePerHour) {
    //       throw new CustomError.BadRequestError('Therapist charge per hour is not set yet.');
    //     }

    //     const chargePerHour = therapistProfile.chargePerHour.amount;
    //     const patient = await userServices.getSpecificUser(conversation.patient.patientUserId);
    //     if (!patient) {
    //       throw new CustomError.BadRequestError('Patient not found in conversation.');
    //     }

    //     const appointment = await appointmentService.getSpecificAppointment(conversation.appointment as unknown as string);
    //     if (!appointment) {
    //       throw new CustomError.BadRequestError('Conversation is not associated with a valid appointment.');
    //     }

    //     const totalCharacter = conversation.characterNewCount;

    //     if (appointment.feeInfo.bookedFee.amount < messageCost.costPerMessage.amount) {
    //       const patientWallet = await walletServices.getSpecificWalletByUserId(conversation.patient.patientUserId);
    //       if (!patientWallet) {
    //         throw new CustomError.BadRequestError('Insufficient appointment booked fee and patient wallet not found');
    //       }

    //       if (patientWallet.balance.amount < messageCost.costPerMessage.amount) {
    //         throw new CustomError.BadRequestError('Insufficient wallet balance, need to recharge wallet.');
    //       }

    //       if (totalCharacter >= messageCost.maxCharacters) {
    //         patientWallet.balance.amount -= messageCost.costPerMessage.amount;
    //         appointment.feeInfo.holdFee.amount += messageCost.costPerMessage.amount;
    //       }

    //       // create a new payment history
    //       paymentHistoryUtils.createPaymentHistory({
    //         user: new mongoose.Types.ObjectId(conversation.patient.patientUserId),
    //         purpose: 'Message Cost Deduction',
    //         amount: messageCost.costPerMessage.amount,
    //         transactionId: generateTransactionId(),
    //         currency: messageCost.costPerMessage.currency,
    //         paymentType: 'debit',
    //       });

    //       // make new notification
    //       notificationUtils.createNotification({
    //         consumer: new mongoose.Types.ObjectId(conversation.patient.patientUserId),
    //         content: {
    //           title: 'Message Cost Deduction',
    //           message: `You have spent ${messageCost.costPerMessage.amount} ${messageCost.costPerMessage.currency} for your conversation.`,
    //           source: {
    //             type: 'message',
    //             id: conversation._id as unknown as Types.ObjectId,
    //           },
    //         },
    //       });

    //       await patientWallet.save();
    //     }

    //     if (totalCharacter >= messageCost.maxCharacters) {
    //       appointment.feeInfo.bookedFee.amount -= messageCost.costPerMessage.amount;
    //       appointment.feeInfo.holdFee.amount += messageCost.costPerMessage.amount;
    //     }
    //     await appointment.save();

    //     conversation.characterNewCount -= messageCost.maxCharacters;
    //   } else {
    //     console.log('outside else', conversation.characterNewCount, messageCost.maxCharacters);
    //     const characterCount = messageData.content.length;
    //     conversation.characterNewCount += characterCount;
    //   }

    //   await conversation.save();
    // }

    if (messageData.senderRole === 'patient' && messageData.content) {
        const characterCount = messageData.content.length;
        conversation.characterNewCount += characterCount;

        while (conversation.characterNewCount >= messageCost.maxCharacters) {
            console.log('Character limit reached, deducting cost');

            const therapistProfile = await therapistProfileServices.getTherapistProfileByUserId(conversation.therapist.therapistUserId);

            if (!therapistProfile || !therapistProfile.chargePerHour) {
                throw new CustomError.BadRequestError('Therapist charge per hour is not set yet.');
            }

            const chargePerHour = therapistProfile.chargePerHour.amount;
            const patient = await userServices.getSpecificUser(conversation.patient.patientUserId);
            if (!patient) {
                throw new CustomError.BadRequestError('Patient not found in conversation.');
            }

            const appointment = await appointmentService.getSpecificAppointment(conversation.appointment as unknown as string);
            if (!appointment) {
                throw new CustomError.BadRequestError('Conversation is not associated with a valid appointment.');
            }

            if (appointment.feeInfo.bookedFee.amount < messageCost.costPerMessage.amount) {
                const patientWallet = await walletServices.getSpecificWalletByUserId(conversation.patient.patientUserId);
                if (!patientWallet) {
                    throw new CustomError.BadRequestError('Insufficient appointment booked fee and patient wallet not found.');
                }

                if (patientWallet.balance.amount < messageCost.costPerMessage.amount) {
                    throw new CustomError.BadRequestError('Insufficient wallet balance, need to recharge wallet.');
                }

                // Deduct from wallet and hold in appointment fee
                patientWallet.balance.amount -= messageCost.costPerMessage.amount;
                appointment.feeInfo.holdFee.amount += messageCost.costPerMessage.amount;

                // Create payment history
                paymentHistoryUtils.createPaymentHistory({
                    user: new mongoose.Types.ObjectId(conversation.patient.patientUserId),
                    purpose: 'Message Cost Deduction',
                    amount: messageCost.costPerMessage.amount,
                    transactionId: generateTransactionId(),
                    currency: messageCost.costPerMessage.currency,
                    paymentType: 'debit',
                });

                // Create notification
                notificationUtils.createNotification({
                    consumer: new mongoose.Types.ObjectId(conversation.patient.patientUserId),
                    content: {
                        title: 'Message Cost Deduction',
                        message: `You have spent ${messageCost.costPerMessage.amount} ${messageCost.costPerMessage.currency} for your conversation.`,
                        source: {
                            type: 'message',
                            id: conversation._id as unknown as Types.ObjectId,
                        },
                    },
                });

                await patientWallet.save();
            }

            // Deduct from booked fee
            appointment.feeInfo.bookedFee.amount -= messageCost.costPerMessage.amount;
            appointment.feeInfo.holdFee.amount += messageCost.costPerMessage.amount;
            await appointment.save();

            // Reduce the counter by `maxCharacters`
            conversation.characterNewCount -= messageCost.maxCharacters;
        }

        await conversation.save();
    }

    if (messageData.type === 'attachment') {
        if (!files || !files.attachment) {
            throw new CustomError.BadRequestError('Missing attachment in request');
        }

        const attachmentPath = await fileUploader(files as FileArray, `${messageData.type}-attachment`, 'attachment');
        messageData.attachment = attachmentPath as string;
    }

    const message = await messageServices.createMessage(messageData);
    socketManager.sendMessage(messageData.conversation, message);

    // const getConversation = await conversationService.retriveConversationByConversationId(messageData.conversation)
    // // create notification for new message
    // if(getConversation){
    //   createNotification(getConversation.user.userId as unknown as Types.ObjectId, getConversation.user.name, `Received new message.`);
    // }

    if (!message) {
        throw new CustomError.BadRequestError('Failed to create message.');
    }

    if (messageData.type === 'text') {
        conversation.lastMessage.id = new mongoose.Types.ObjectId(message._id as string);
        conversation.lastMessage.content = null!;
    } else {
        conversation.lastMessage.content = 'Sent you a attachment' as string;
        conversation.lastMessage.id = null!;
    }

    await conversation.save();
    console.log(conversation);

    if (messageData.type === 'attachment') {
        const attachmentPayload = {
            conversation: messageData.conversation,
            message: message._id,
            type: messageData.type,
            content: messageData.attachment,
        };

        await Attachment.create(attachmentPayload);
    }

    sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        status: 'success',
        message: `Message sended successfull`,
        data: message,
    });
});

// controller for get all messages of a conversation
const retriveMessagesByConversation = asyncHandler(async (req: Request, res: Response) => {
    const { conversationId } = req.params;
    const messages = await messageServices.retriveMessages(conversationId);

    sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        status: 'success',
        message: `Messages retrive successfull`,
        data: messages,
    });
});

export default {
    createMessage,
    retriveMessagesByConversation,
};
