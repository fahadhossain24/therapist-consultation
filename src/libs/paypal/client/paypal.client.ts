import axios from 'axios';
import { paypalConfig } from '../config/paypal.config';

export const paypalAccount = paypalConfig.mode === 'sandbox' ? paypalConfig.sandbox : paypalConfig.live;
console.log(paypalAccount)
export const getPaypalAccessToken = async () => {
    const credentials = Buffer.from(`${paypalAccount.clientId}:${paypalAccount.clientSecret}`).toString('base64');

    const response = await axios.post(`${paypalAccount.baseUrl}/v1/oauth2/token`, `grant_type=client_credentials`, {
        headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });
console.log(response.data.access_token)
    return response.data.access_token;
};
