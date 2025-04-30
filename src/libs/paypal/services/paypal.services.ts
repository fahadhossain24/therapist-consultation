import axios from 'axios';
import { getPaypalAccessToken, paypalAccount } from '../client/paypal.client';
import config from '../../../config';

class PaypalService {
    accessToken: string = '';
    init = async () => {
        this.accessToken = await getPaypalAccessToken();
        return this;
    };

    createPaypalOrder = async (amount: string, currency: string) => {
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
                    },
                ],
                application_context: {
                    user_action: 'CONTINUE',
                    brand_name: 'Counta',
                    cancel_url: 'http://localhost:5002/wallet/add-balance/cencel',
                    return_url: 'http://localhost:5002/wallet/add-balance/return',
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
