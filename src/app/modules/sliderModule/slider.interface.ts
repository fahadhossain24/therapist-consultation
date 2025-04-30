import { Document, Types } from 'mongoose';

export interface ISlider extends Document {
    therapist: Types.ObjectId;
    title: string;
    image: string;
}
