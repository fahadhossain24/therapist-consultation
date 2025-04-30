import { Document, Types } from 'mongoose';

export interface IFeedback extends Document {
    patient: Types.ObjectId;
    therapist: Types.ObjectId;
    rating: number;
    comment: string;
}
