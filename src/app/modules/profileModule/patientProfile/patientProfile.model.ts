import mongoose from "mongoose";
import IPatientProfile from "./patientProfile.interface";

const patientProfileSchema = new mongoose.Schema<IPatientProfile>({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    address: String,
    dateOfBirth: String,
    gender: {
        type: String,
        enum: {
            values: ['male', 'female', 'other'],
            message: '{VALUE} is not accepted as gender. Please use male/female or other'
        }
    },
    image: String,
}, {
    timestamps: true
})

const PatientProfile = mongoose.model<IPatientProfile>('patient', patientProfileSchema);
export default PatientProfile;