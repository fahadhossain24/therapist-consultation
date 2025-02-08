import mongoose from 'mongoose';
import { ICallLog } from './callLog.interface';

const callLogSchema = new mongoose.Schema<ICallLog>(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'conversation',
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
    startedAt: {
      type: Date,
      required: true,
    },
    endedAt: {
      type: Date,
      default: null
    },
    type: {
      type: String,
      enum: ['audio', 'video'],
      required: true,
    },
    duration: {
      value: Number,
      type: {
        type: String,
        enum: ['seconds'],
        default: 'seconds',
      },
    },
    recordingUrl: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['ongoing', 'declined', 'received', 'ended'],
      default: 'ongoing',
    },
  },
  {
    timestamps: true,
  },
);

const CallLog = mongoose.model<ICallLog>('callLog', callLogSchema);
export default CallLog;
