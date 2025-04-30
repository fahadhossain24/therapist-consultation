import { Document, Types } from 'mongoose';

export interface IAppointmentDue extends Document {
    appointment: Types.ObjectId;
    due: {
        amount: number;
        currency: string;
    };
}
