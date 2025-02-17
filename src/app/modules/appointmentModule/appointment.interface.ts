import { Document, Types } from 'mongoose';

export interface IAppointment extends Document {
  patient: Types.ObjectId;
  therapist: Types.ObjectId;
  date: Date;
  slot: string;
  reason: string;
  description: string;
  duration: {
    value: number;
    unit: string;
  };
  // paymentSource: {

  //     number: string;
  //     cardHolderName: string;
  //     type: string;
  //     transactionId: string;
  //     isSaved: boolean;
  // },
  feeInfo: {
    feeStatus: string;
    mainFee: {
      amount: number;
      currency: string;
    };
    bookedFee: {
      amount: number;
      currency: string;
    };
    holdFee: {
      amount: number;
      currency: string;
    };
    dueFee: {
      amount: number;
      currency: string;
    };
    therapistTransactionId: string;
    patientTransactionId: string;
  };
  isAvailableInWallet: boolean;
  status: string;
  cancelReason: string;
  appointmentId: string;
  rescheduleReason: string;
}
