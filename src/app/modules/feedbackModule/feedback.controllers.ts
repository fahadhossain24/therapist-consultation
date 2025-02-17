import { Request, Response } from 'express';
import feedbackServices from './feedback.services';
import CustomError from '../../errors';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

// controller for create or update new feedback
const createOrUpdateFeedback = async (req: Request, res: Response) => {
  const feedbackData = req.body;
  const feedback = await feedbackServices.createOrUpdateFeedback(feedbackData);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Feedback provide successfully'
  });
};

// controller for get feedbacks by therapist
const getFeedbacksByTherapist = async (req: Request, res: Response) => {
  const { therapistId } = req.params;
  const feedbacks = await feedbackServices.getAllFeedbacksByTherapistId(therapistId);
  let totalRating: number = 0;

  feedbacks.map((feedback) => {
    totalRating += feedback.rating || 0;
  });

  const overallRating = totalRating / feedbacks.length;

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: `Feedbacks retrive successful!`,
    data: {
      feedbackCount: feedbacks.length,
      ratings: overallRating,
    },
  });
};

export default {
  createOrUpdateFeedback,
  getFeedbacksByTherapist,
};
