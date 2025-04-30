import mongoose from 'mongoose';
import { IConversation } from './conversation.interface';

const conversationSchema = new mongoose.Schema<IConversation>(
    {
        patient: {
            name: {
                type: String,
                required: true,
            },
            patientUserId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'user',
            },
        },
        therapist: {
            name: {
                type: String,
                required: true,
            },
            therapistUserId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'user',
            },
        },
        appointment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'appointment',
            unique: true,
        },
        lastMessage: {
            content: {
                type: String,
                default: null,
            },
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'message',
                default: null,
            },
        },
        isMarkAsCompleted: {
            type: Boolean,
            default: false,
        },
        // TODO: Add a limit to number of members in the conversation.
        memberCounts: {
            type: Number,
            default: 2,
        },
        characterNewCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    },
);

const Conversation = mongoose.model<IConversation>('conversation', conversationSchema);
export default Conversation;
