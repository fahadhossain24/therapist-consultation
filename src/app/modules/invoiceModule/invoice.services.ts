import { IInvoice } from './invoice.interface';
import Invoice from './invoice.model';

// service for create new invoice
const createInvoice = async (data: Partial<IInvoice>) => {
    return await Invoice.create(data);
};

// service for get specific invoice by id
const getInvoiceById = async (invoiceId: string) => {
    return await Invoice.findById(invoiceId)
        .populate({
            path: 'user.id',
            select: 'firstName lastName email phone',
        })
        .populate({
            path: 'appointment',
            select: 'date slot feeInfo.bookedFee feeInfo.patientTransactionId feeInfo.therapistTransactionId',
            populate: {
                path: 'therapist',
                select: 'firstName lastName',
            },
        });
};

// service for get all invoices by userId
const getAllInvoicesByUserId = async (userId: string, searchQuery: string, skip: number, limit: number) => {
    const query: any = {};

    if (userId) {
        query['user.id'] = userId;
    }

    if (searchQuery) {
        query.invoiceId = searchQuery;
    }

    return await Invoice.find(query)
        .skip(skip)
        .limit(limit)
        .populate({
            path: 'user.id',
            select: 'firstName lastName email phone',
        })
        .populate({
            path: 'appointment',
            select: 'date slot feeInfo.mainFee feeInfo.patientTransactionId feeInfo.therapistTransactionId',
            populate: {
                path: 'therapist',
                select: 'firstName lastName',
            },
        });
};

// service for retrieve invoice by appointment id
const retrieveInvoiceByAppointmentId = async (appointmentId: string) => {
    return await Invoice.find({ appointment: appointmentId })
        .populate({
            path: 'user.id',
            select: 'firstName lastName email phone',
        })
        .populate({
            path: 'appointment',
            select: 'date slot feeInfo.mainFee feeInfo.patientTransactionId feeInfo.therapistTransactionId',
            populate: {
                path: 'therapist',
                select: 'firstName lastName',
            },
        });
};

export default {
    createInvoice,
    getInvoiceById,
    getAllInvoicesByUserId,
    retrieveInvoiceByAppointmentId,
};
