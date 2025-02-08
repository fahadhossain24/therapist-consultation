import { IConversation } from './conversation.interface';
import conversationService from './conversation.service';

// function for create conversation
const createConversation = async (conversationData: Partial<IConversation>) => {
  // const socketManager = SocketManager.getInstance();

  const existingConversation = await conversationService.retriveConversationBySenderIdAndReceiverId(
    conversationData.patient?.patientUserId as string,
    conversationData.therapist?.therapistUserId as string,
  );

  if (existingConversation) {
    return existingConversation;
  } else {
    const newConversation = await conversationService.createConversation(conversationData);
    if (!newConversation) {
      throw new Error('Failed to create conversation');
    }
    return newConversation;
  }

  // Join or create room for the conversation
  // socketManager.joinDirectUserOrCreateOnlyRoom(existingConversation as Partial<IConversation>);
};

export default {
  createConversation,
}


