import jwt from 'jsonwebtoken';
import config from '../config';

// const APP_ID = process.env.ZEGO_APP_ID; // Your ZegoCloud App ID
// const SERVER_SECRET = process.env.ZEGO_SERVER_SECRET; // Your ZegoCloud Server Secret

export const generateZegoToken = (roomId: string) => {
    const payload = {
        app_id: config.zego_app_id,
        // user_id: userId,
        room_id: roomId,
        privilege: { 1: 1, 2: 1 }, // Allow both audio and video
        exp: Math.floor(Date.now() / 1000) + 3600, // Expiry in 1 hour
    };

    const token = jwt.sign(payload, config.zego_server_secret as string, { algorithm: 'HS256' });
    return token;
};
