import { Request, Response } from 'express';
import asyncHandler from '../../../shared/asyncHandler';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import walletServices from '../../../app/modules/walletModule/wallet.services';

export const handlePayPalWebhook = asyncHandler(async (req: Request, res: Response) => {
    const event = req.body;

    switch (event.event_type) {
        case 'PAYMENT.CAPTURE.COMPLETED':
            // handle wallet top-up or appointment payment
            await walletServices.handleWalletTopUpAfterPaymentCapture(event)
            break;
        case 'PAYMENT.CAPTURE.DENIED':
            // handle wallet top-up or appointment payment
            break;
        case 'BILLING.SUBSCRIPTION.ACTIVATED':
            // handle subscription activated
            break;
        case 'BILLING.SUBSCRIPTION.CANCELLED':
            // handle subscription cancelled
            break;
        case 'BILLING.SUBSCRIPTION.EXPIRED':
            // handle subscription expired
            break;
        case 'BILLING.SUBSCRIPTION.SUSPENDED':
            // handle subscription suspended
            break;
        case 'PAYMENT.PAYOUTS-ITEM.SUCCEEDED':
            // mark the therapist payouts as complete
            break;
        case 'PAYMENT.PAYOUTS-ITEM.FAILED':
            // mark the therapist payouts as failed
            break;
        default:
            break;
    }

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        status: 'success',
        message: 'Webhook processed successfully',
    });
});
