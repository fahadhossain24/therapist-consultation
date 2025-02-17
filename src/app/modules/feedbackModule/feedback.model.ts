import mongoose from 'mongoose';
import { IFeedback } from './feedback.interface';

const feedbackSchema = new mongoose.Schema<IFeedback>(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
    therapist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
    rating: {
      type: Number,
      default: 0,
    },
    comment: String,
  },
  {
    timestamps: true,
  },
);

const Feedback = mongoose.model<IFeedback>('feedback', feedbackSchema);
export default Feedback;
