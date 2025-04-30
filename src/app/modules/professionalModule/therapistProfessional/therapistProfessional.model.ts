import mongoose from 'mongoose';
import { ITherapistProfessional } from './therapistProfessional.interface';

const therapistProfessionalSchema = new mongoose.Schema<ITherapistProfessional>(
    {
        therapist: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true, unique: true },
        consumeCount: { type: Number, default: 0 },
        isPremium: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    },
);

const TherapistProfessional = mongoose.model<ITherapistProfessional>('therapistProfessional', therapistProfessionalSchema);
export default TherapistProfessional;
