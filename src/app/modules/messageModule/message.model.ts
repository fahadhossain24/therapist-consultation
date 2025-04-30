import mongoose, { mongo } from 'mongoose';
import { IMessage } from './message.interface';

const messageSchema = new mongoose.Schema<IMessage>(
    {
        conversation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'conversation',
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
        },
        senderRole: {
            type: String,
            enum: {
                values: ['patient', 'therapist'],
                message: '{VALUE} is not accepted as a sender role. Please use patient and therapist as a sender role.',
            },
        },
        type: {
            type: String,
            enum: {
                values: ['text', 'attachment', 'audio', 'video'],
                message: '{VALUE} is not accepted as a message type. Please use text, attachment, audio or video as a message type.',
            },
        },
        content: {
            type: String,
            validate: {
                validator: function (this: any, value: string) {
                    if (this.type === 'attachment') {
                        return true;
                    }
                    return !!value;
                },
                message: 'Content is required when type is text.',
            },
        },
        attachment: [
            {
                type: String,
                default: null,
            },
        ],
        isCallReceived: Boolean,
        duration: Number,
        recordingUrl: String,
        callLog: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'callLog',
        },
        // status: {
        //   type: String,
        //   enum: ['sent', 'received', 'read'],
        //   default: 'sent'
        // }
    },
    {
        timestamps: true,
    },
);

const Message = mongoose.model<IMessage>('message', messageSchema);
export default Message;
