import mongoose from 'mongoose';
import { IAppointment } from './appointment.interface';
import { CURRENCY_ENUM } from '../../../enums/currency';

const appointmentSchema = new mongoose.Schema<IAppointment>(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    therapist: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    date: { type: Date, required: true },
    slot: { type: String, required: true },
    reason: { type: String, required: true },
    description: { type: String, required: true },
    duration: {
      value: { type: Number, required: true },
      unit: { type: String, default: 'seconds' },
    },
    // paymentSource: {
    //   number: { type: String, required: true },
    //   cardHolderName: { type: String, required: true },
    //   type: {
    //     type: String,
    //     enum: {
    //       values: ['card', 'bank', 'mobile-wallet'],
    //       message: '{VALUE} is not supported, use card/bank/mobile-wallet',
    //     },
    //     required: true,
    //    },
    //   transactionId: { type: String, required: true },
    //   isSaved: { type: Boolean, required: true },
    // },
    feeInfo: {
      feeStatus: { type: String, enum: ['paid', 'hold'], default: 'hold' },
      mainFee: {
        amount: { type: Number, default: 0 },
        currency: { type: String, enum: CURRENCY_ENUM, default: CURRENCY_ENUM.USD },
      },
      bookedFee: {
        amount: { type: Number, default: 0 },
        currency: { type: String, enum: CURRENCY_ENUM, default: CURRENCY_ENUM.USD },
      },
      holdFee: {
        amount: { type: Number, default: 0 },
        currency: { type: String, enum: CURRENCY_ENUM, default: CURRENCY_ENUM.USD },
      },
      dueFee: {
        amount: { type: Number, default: 0 },
        currency: { type: String, enum: CURRENCY_ENUM, default: CURRENCY_ENUM.USD },
      },
      therapistTransactionId: String, // it come when payout to doctor, when appointment is completed
      patientTransactionId: String, // it is patient transaction id when patient payment for the apppointment
    },
    isAvailableInWallet: Boolean,
    status: {
      type: String,
      enum: ['pending', 'approved', 'completed', 'cancelled', 'missed', 'cancelled-requested', 'cancelled-approved', 'rescheduled'],
      default: 'pending',
    },
    cancelReason: {
      type: String,
      default: null,
    },
    rescheduleReason: {
      type: String,
      default: null,
    },
    appointmentId: String,
  },
  {
    timestamps: true,
  },
);

appointmentSchema.index({ appointmentId: 'text' });

const Appointment = mongoose.model<IAppointment>('appointment', appointmentSchema);
export default Appointment;
