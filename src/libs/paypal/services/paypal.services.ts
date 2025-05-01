import axios from 'axios';
import { getPaypalAccessToken, paypalAccount } from '../client/paypal.client';
import { paypalConfig } from '../config/paypal.config';

class PaypalService {
    accessToken: string = '';
    init = async () => {
        this.accessToken = await getPaypalAccessToken();
        return this;
    };

    createPaypalOrder = async (amount: string, currency: string, userId: string) => {
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
                    return_url: paypalConfig.return_url,
                    cancel_url: paypalConfig.cancel_url,
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
}

const paypalService = new PaypalService();
export const paypalServiceInstancePromise = paypalService.init();
