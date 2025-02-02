import { Document, Types } from 'mongoose';

interface ITherapistProfile extends Document {
  user: Types.ObjectId;
  speciality: Types.ObjectId;
  subSpecialty: string;
  professionalSummary: string;
  image?: string;
  experience: string;
  curriculumVitae?: string; // file
  certificates?: string[]; // files
  brandLogo?: string; // file
  availabilities: {
    dayName: string;
    dayIndex: number;
    startTime: string;
    endTime: string;
    appointmentLimit: number;
    slotsPerDay: string[];
    isClosed: boolean;
  }[];
  chargePerHour: {
    amount: number;
    currency: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export default ITherapistProfile;
