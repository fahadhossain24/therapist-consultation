import { Document, Types } from 'mongoose';

export interface ITherapistProfessional extends Document {
    therapist: Types.ObjectId;
    consumeCount: number;
    isPremium: boolean;
}
