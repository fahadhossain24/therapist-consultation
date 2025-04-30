import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
    path: path.join(process.cwd(), '.env'),
});

export const paypalConfig = {
    mode: process.env.PAYPAL_MODE,
    live: {
        clientId: process.env.PAYPAL_LIVE_CLIENT_ID,
        clientSecret: process.env.PAYPAL_LIVE_CLIENT_SECRET,
        baseUrl: process.env.PAYPAL_LIVE_BASE_URL,
    },
    sandbox: {
        clientId: process.env.PAYPAL_SANDBOX_CLIENT_ID,
        clientSecret: process.env.PAYPAL_SANDBOX_CLIENT_SECRET,
        baseUrl: process.env.PAYPAL_SANDBOX_BASE_URL,
    },
};
