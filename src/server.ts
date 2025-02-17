import mongoose from 'mongoose';
import config from './config';
import app from './app';
import http from 'http';
import { Server } from 'socket.io';
import configSocket from './app/socket/config.socket';
import cron from 'node-cron';
import appointmentService from './app/modules/appointmentModule/appointment.service';
import { sendNotificationBefore1Hour } from './app/modules/appointmentModule/appointment.utils';

// let server: any;
const server = http.createServer(app);

// Socket.io setup
export const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// call socket configuation function
configSocket(io);

// handle uncaught exception error
process.on('uncaughtException', (error) => {
  console.log('uncaughtException error', error);
  process.exit(1);
});

// schedully update appointment status (make missed when appointment date is past using node-cron)
cron.schedule('*/15 * * * *', async () => {
  // Runs every hour
  // console.log('Checking for missed appointments...');
  await appointmentService.updateAllPastAppointments();
  console.log('Missed appointments updated successfully.');
  await sendNotificationBefore1Hour();
  console.log('Notifications sent successfully.');
});

const startServer = async () => {
  await mongoose.connect(config.database_url as string);
  console.log('\x1b[36mDatabase connection successfull\x1b[0m');

  server.listen(config.server_port || 5002, () => {
    console.log(`\x1b[32mServer is listening on port ${config.server_port || 5002}\x1b[0m`);
  });
};

// handle unhandled rejection
process.on('unhandledRejection', (reason, promise) => {
  console.log(`unhandle rejection at ${promise} and reason ${reason}`);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// gracefull shoutdown on SIGTERM
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received.');
  server.close(() => {
    console.log('Server closed.');
  });
});

startServer();
