import { Request, Response } from 'express';
import asyncHandler from '../../../shared/asyncHandler';
import Appointment from '../appointmentModule/appointment.model';
import PatientProfile from '../profileModule/patientProfile/patientProfile.model';
import TherapistProfile from '../profileModule/therapistProfile/therapistProfile.model';
import purchaseSubscriptionServices from '../purchaseSubscriptionModule/purchaseSubscription.services';
import User from '../userModule/user.model';
import PurchaseSubscription from '../purchaseSubscriptionModule/purchaseSubscription.model';
import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../../shared/sendResponse';

// Controller for retrieving dashboard metrics
const retrieveDashboardMetrics = asyncHandler(async (req: Request, res: Response) => {
  try {
    // Get the requested year from query params, default to the current year
    const year = parseInt(req.query.year as string, 10) || new Date().getFullYear();

    // Total counts
    const totalUsers = await User.countDocuments();
    const totalPatients = await PatientProfile.countDocuments();
    const totalTherapists = await TherapistProfile.countDocuments();
    const totalAppointments = await Appointment.countDocuments();
    const totalEarnings = await purchaseSubscriptionServices.getTotalEarnings();

    // Initialize data structures for monthly stats
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const userGrowth = Array(12).fill(0);
    const subscriptionGrowth = Array(12).fill(0);
    const appointmentGrowth = Array(12).fill(0);

    // Fetch monthly stats for users in the given year
    const usersByMonth = await User.aggregate([
      { $match: { createdAt: { $gte: new Date(`${year}-01-01`), $lt: new Date(`${year + 1}-01-01`) } } },
      { $group: { _id: { $month: '$createdAt' }, count: { $sum: 1 } } },
    ]);
    usersByMonth.forEach(({ _id, count }) => {
      userGrowth[_id - 1] = count;
    });

    // Fetch monthly stats for subscription purchases in the given year
    const subscriptionsByMonth = await PurchaseSubscription.aggregate([
      { $match: { createdAt: { $gte: new Date(`${year}-01-01`), $lt: new Date(`${year + 1}-01-01`) } } },
      { $group: { _id: { $month: '$createdAt' }, count: { $sum: 1 } } },
    ]);
    subscriptionsByMonth.forEach(({ _id, count }) => {
      subscriptionGrowth[_id - 1] = count;
    });

    // Fetch monthly stats for appointments in the given year
    const appointmentsByMonth = await Appointment.aggregate([
      { $match: { createdAt: { $gte: new Date(`${year}-01-01`), $lt: new Date(`${year + 1}-01-01`) } } },
      { $group: { _id: { $month: '$createdAt' }, count: { $sum: 1 } } },
    ]);
    appointmentsByMonth.forEach(({ _id, count }) => {
      appointmentGrowth[_id - 1] = count;
    });

    // Normalize data for chart representation
    const maxUsers = Math.max(...userGrowth) || 1;
    const maxSubscriptions = Math.max(...subscriptionGrowth) || 1;
    const maxAppointments = Math.max(...appointmentGrowth) || 1;

    const chartData = {
      months,
      userStatistics: userGrowth.map((count) => (count / maxUsers) * 100),
      subscriptionStatistics: subscriptionGrowth.map((count) => (count / maxSubscriptions) * 100),
      appointmentStatistics: appointmentGrowth.map((count) => (count / maxAppointments) * 100),
    };

    const responseData = {
      totalUsers,
      totalPatients,
      totalTherapists,
      totalAppointments,
      totalEarnings,
      chartData,
    };

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      status: 'success',
      message: 'Dashboard metrics retrieved successfully',
      data: responseData,
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: 'error',
      message: 'Failed to retrieve dashboard metrics.',
      data: null,
    });
  }
});

export default { retrieveDashboardMetrics };
