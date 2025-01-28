import mongoose from 'mongoose';
import ITherapistProfile from './therapistProfile.interface';

const therapistProfileSchema = new mongoose.Schema<ITherapistProfile>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
    specialty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'speciality',
      required: true,
    },
    subSpecialty: {
      type: String,
      required: true,
    },
    professionalSummary: {
      type: String,
      required: true,
    },
    experience: {
      type: String,
      required: true,
    },
    curriculumVitae: {
      type: String,
      required: true,
    },
    certificates: [
      {
        type: String,
        required: true,
      },
    ],
    brandLogo: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    availabilities: [
      {
        dayName: String,
        dayIndex: Number,
        startTime: String,
        endTime: String,
        appointmentLimit: Number,
        slotsPerDay: [String],
        isClosed: Boolean,
      },
    ],
    chargePerHour: {
      amount: {
        type: Number,
        default: 0,
      },
      currency: {
        type: String,
        enum: ['USD'],
        default: 'USD',
      },
    },
  },
  {
    timestamps: true,
  },
);

therapistProfileSchema.index({
  subSpecialty: 'text',
  professionalSummary: 'text',
  experience: 'text',
})

const TherapistProfile = mongoose.model<ITherapistProfile>('therapist', therapistProfileSchema);
export default TherapistProfile;
