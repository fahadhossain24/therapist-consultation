import { IInvoice } from './invoice.interface';
import Invoice from './invoice.model';
import invoiceServices from './invoice.services';

// function for create invoice
const createInvoice = async (data: Partial<IInvoice>) => {
  const lastInvoice = await Invoice.findOne().sort("-createdAt");
  const invoiceId = generateNextInvoiceId(lastInvoice?.invoiceId as string);
  data.invoiceId = invoiceId;

  return await invoiceServices.createInvoice(data);
};

function generateNextInvoiceId(lastInvoiceId: string | null): string {
  const lastNumber = lastInvoiceId ? parseInt(lastInvoiceId.split('-')[1], 10) : 0;

  const nextNumber = (lastNumber + 1).toString().padStart(4, '0');

  return `INV-${nextNumber}`;
}

export default {
  createInvoice,
  generateNextInvoiceId,
};
