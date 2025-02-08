import { Document, Types } from 'mongoose';

export interface IConversation extends Document {
  patient: {
    name: string;
    patientUserId: string;
  };
  therapist: {
    name: string;
    therapistUserId: string;
  };
  appointment: Types.ObjectId;
  isMarkAsCompleted: boolean;
  lastMessage: {
    content: string;
    id: Types.ObjectId
  };
  lastCalledAt: Date;
  memberCounts: number;
  characterNewCount: number;
}
