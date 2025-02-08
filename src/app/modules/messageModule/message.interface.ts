import { Document, Types } from 'mongoose';

export interface IMessage extends Document {
  conversation: Types.ObjectId;
  sender: Types.ObjectId;
  type: string;
  content: string;
  attachment: string[];
  status: string;
  isCallReceived: boolean;
  duration: number;
  recordingUrl: string;
  callLog: Types.ObjectId;
  senderRole: string;
} 
