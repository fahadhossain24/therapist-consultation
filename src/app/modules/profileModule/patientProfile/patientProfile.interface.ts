import { Document, Types } from 'mongoose';

interface IPatientProfile extends Document {
    user: Types.ObjectId;
    address: string;
    dateOfBirth: Date;
    gender: string;
    image?: string;
    createdAt: Date;
    updatedAt: Date;
}

export default IPatientProfile;
