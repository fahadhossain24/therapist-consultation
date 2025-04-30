import { IFeedback } from './feedback.interface';
import Feedback from './feedback.model';

// service for create or update feedback by patient
const createOrUpdateFeedback = async (data: Partial<IFeedback>) => {
    return await Feedback.findOneAndUpdate(
        { patient: data.patient },
        data,
        { runValidators: true, upsert: true, new: true }, // Add upsert: true
    );
};

// service to get all feedbacks for a specific therapist
const getAllFeedbacksByTherapistId = async (therapistId: string) => {
    return await Feedback.find({ therapist: therapistId });
};

// get specific feedback by outletId
// const getSpecificFeedbackByOutletId = async (id: string) => {
//   return await Feedback.findOne({ 'outlet.outletId': id });
// };

// get specific feedback by outletId and userId
// const getSpecificFeedbackByUserIdAndOutletId = async (userId: string, outletId: string) => {
//   return await Feedback.findOne({ 'user.userId': userId, 'outlet.outletId': outletId });
// };

// get feedbacks by outletId
// const getFeedbacksByOutletId = async (outletId: string) => {
//   return await Feedback.find({ 'outlet.outletId': outletId }).populate({
//     path: 'booking',
//     select: 'service',
//   });
// };

// service for update specific feedback by userId and outletId
// const updateSpecificFeedbackByUserIdAndoutletId = async (userId: string, outletId: string, data: Partial<IFeedback>) => {
//   return await Feedback.updateOne(
//     { 'user.userId': userId, 'outlet.outletId': outletId },
//     { $set: data }, // Use `$set` to update the object fields properly
//     { runValidators: true },
//   );
// };

export default {
    createOrUpdateFeedback,
    getAllFeedbacksByTherapistId,
};
