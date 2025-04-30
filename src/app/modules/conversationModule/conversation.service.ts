import { IConversation } from './conversation.interface';
import Conversation from './conversation.model';

// service for create new conversation
const createConversation = async (data: Partial<IConversation>) => {
    return await Conversation.create(data);
};

// service for retrive specific conversation by senderId and receiverId
const retriveConversationBySenderIdAndReceiverId = async (senderId: string, receiverId: string) => {
    return await Conversation.findOne({
        $or: [
            { 'sender.senderId': senderId, 'receiver.receiverId': receiverId },
            { 'sender.senderId': receiverId, 'receiver.receiverId': senderId }, // Handle bidirectional conversations
        ],
    });
};

// service for retrive specific conversation by receiverId
// const retriveConversationByReceiverId = async (receiverId: string) => {
//   return await Conversation.findOne({
//     'receiver.receiverId': receiverId,
//   });
// };

// service for retrive specific conversation by conversationId
const retriveConversationByConversationId = async (conversationId: string) => {
    return await Conversation.findOne({ _id: conversationId });
};

// service for retrive specific conversation by appointment Id
const retriveConversationByAppointmentId = async (appointmentId: string) => {
    return await Conversation.findOne({ appointment: appointmentId });
};

// service for retrive all conversations by user (sender/receiver)
const retriveConversationsBySpecificUser = async (userId: string) => {
    return await Conversation.find({ $or: [{ 'patient.patientUserId': userId }, { 'therapist.therapistUserId': userId }] }).populate([
        {
            path: 'patient.patientUserId',
            select: 'firstName lastName image role',
        },
        {
            path: 'therapist.therapistUserId',
            select: 'firstName lastName image role',
        },
        {
            path: 'lastMessage.id',
            select: 'type content updatedAt',
        },
    ]);
};

export default {
    createConversation,
    retriveConversationBySenderIdAndReceiverId,
    // retriveConversationByReceiverId,
    retriveConversationByConversationId,
    retriveConversationByAppointmentId,
    retriveConversationsBySpecificUser,
};
