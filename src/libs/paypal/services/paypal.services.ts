import axios from 'axios';
import { getPaypalAccessToken, paypalAccount } from '../client/paypal.client';

class PaypalService {
    accessToken: string = '';
    init = async () => {
        this.accessToken = await getPaypalAccessToken();
        return this;
    };

    createPaypalOrder = async (amount: string, currency: string, cancelUrl: string, returnUrl: string, userId: string) => {
        const response = await axios.post(
            `${paypalAccount.baseUrl}/v2/checkout/orders`,
            {
                intent: 'CAPTURE',
                purchase_units: [
                    {
                        amount: {
                            value: amount,
                            currency_code: currency,
                        },
                        custom_id: userId,
                    },
                ],
                application_context: {
                    user_action: 'CONTINUE',
                    brand_name: 'Counta',
                    return_url: returnUrl,
                    cancel_url: cancelUrl,
                },
            },
            {
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json',
                },
            },
        );

        return response.data;
    };

    capturePaypalOrder = async (orderId: string) => {
        const response = await axios.post(
            `${paypalAccount.baseUrl}/v2/checkout/orders/${orderId}/capture`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json',
                },
            },
        );

        return response.data;
    };

    paypalPayout = async(receiverEmail: string, amount: string, currency: string, appointmentId: string) => {
        const response = await axios.post(
            `${paypalAccount.baseUrl}/v2/payments/payouts`,
            {
                sender_batch_header: {
                    sender_batch_id: appointmentId,
                    email_subject: 'Payment Received for new appointment',
                },
                items: [
                    {
                        recipient_type: 'EMAIL',
                        amount: {
                            value: amount,
                            currency_code: currency,
                        },
                        note: 'Thank you for your service!',
                        sender_item_id: appointmentId,
                        receiver: receiverEmail,
                    },
                ],
            },
            {
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json',
                },
            },
        );

        return response.data;
    }
}

const paypalService = new PaypalService();
export const paypalServiceInstancePromise = paypalService.init();
