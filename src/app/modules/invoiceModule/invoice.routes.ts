import express from 'express';
import invoiceControllers from './invoice.controllers';

const invoiceRouter = express.Router();

invoiceRouter.get('/retrive/user/:userId/search', invoiceControllers.getAllInvoicesByUserId )
invoiceRouter.get('/retrive/:invoiceId', invoiceControllers.getSpecificInvoiceById)

export default invoiceRouter