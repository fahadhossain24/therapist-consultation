import express from 'express';
import dashboardMatricControllers from './dashboardMatric.controllers';

const dashboardMatricRouter = express.Router();

dashboardMatricRouter.get('/metrixs/retrive', dashboardMatricControllers.retrieveDashboardMetrics)

export default dashboardMatricRouter;