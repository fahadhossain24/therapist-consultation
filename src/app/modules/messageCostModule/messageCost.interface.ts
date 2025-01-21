import { Document } from "mongoose";

export interface IMessageCost extends Document {
    costPerMessage: {
        currency: string;
        amount: number
    };
    maxWords: number;
}
