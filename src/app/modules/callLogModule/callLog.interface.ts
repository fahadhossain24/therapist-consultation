import { Document, Types } from "mongoose";

export interface ICallLog extends Document {
    conversationId: Types.ObjectId, 
    senderId: Types.ObjectId,
    receiverId: Types.ObjectId, 
    type: string, 
    startedAt: Date, 
    endedAt: Date, 
    duration: {
        value: number,
        type: string
    }, 
    recordingUrl: string, 
    status: string,
}