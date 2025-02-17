import mongoose from 'mongoose';
import { CURRENCY_ENUM } from '../../../enums/currency';
import { IAppointmentDue } from './appointmentDue.interface';

const appointmentDueSchema = new mongoose.Schema<IAppointmentDue>({
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  due: {
    amount: { type: Number, default: 0 },
    currency: { type: String, enum: CURRENCY_ENUM, default: CURRENCY_ENUM.USD },
  },
}, {
    timestamps: true,
});

const AppointmentDue = mongoose.model<IAppointmentDue>('appointmentDue', appointmentDueSchema);
export default AppointmentDue;
