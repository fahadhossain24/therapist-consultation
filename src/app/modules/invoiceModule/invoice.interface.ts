import { Document, Types } from "mongoose";

export interface IInvoice extends Document{
    user: {
        type: string,
        id: Types.ObjectId
    },
    appointment: Types.ObjectId;
    invoiceId: string;
    createdAt: Date;
    updatedAt: Date;
}