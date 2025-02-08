import { Document, Types } from 'mongoose';

export interface IAttachment extends Document {
  conversation: Types.ObjectId;
  message: Types.ObjectId;
  type: string;
  content: string[];
}
