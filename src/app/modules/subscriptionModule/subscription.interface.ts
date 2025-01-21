import { Document } from "mongoose";

export interface ISubscription extends Document {
    name: string;
    price: {
        currency: string;
        amount: number
    };
    validity: {
        type: string;
        value: number
    };
    features: string[];
}
