import mongoose from 'mongoose';
import { ISpeciality } from './speciality.interface';

const specialitySchema = new mongoose.Schema<ISpeciality>({
    name: { type: String, required: true },
    image: { type: String, required: true }
}, {
    timestamps: true
});

specialitySchema.index({ name: 'text'}); 

const Speciality = mongoose.model<ISpeciality>('speciality', specialitySchema);
export default Speciality;
