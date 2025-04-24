# Therapist-Doctor Appointment Booking System

A full-featured appointment booking and video consultation system for therapists and doctors, built with TypeScript and modern web technologies.

## Features

- Real-time appointment scheduling
- Video consultation using Zego Express Engine
- Secure user authentication
- Message and conversation management
- Call logging and tracking
- Payment deduction for consultations (based on each second of call duration and characters which patient chat with doctors)
- Appointment management (booking, approved, rejection, cancellation, missed and rescheduling)
- Cron job scheduling for automated tasks
- Email notifications for appointment reminders and notifications

## Tech Stack

- **Backend**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Real-time Communication**: Socket.IO
- **Video Conferencing**: Zego Express Engine
- **Authentication**: JWT, OAuth
- **File Upload**: Express-fileupload with AWS-S3 bucket
- **Security**: Express-rate-limit, security-audit, jwt, hashing
- **Email Service**: Nodemailer
- **Validation**: Zod
- **Logging**: Morgan and winston
- **Cron Job**: Node-cron
- **Testing**: Jest
- **Caching**: Redis
- **Payment Gateway**: PayPal
- **Cloud Compute Service**: AWS-EC2
- **Cloud Storage Service**: AWS-S3
- **Containerization**: Docker
- **CI/CD**: GitHub Actions

## Prerequisites

- Node.js (v20 or higher)
- MongoDB
- npm or yarn
- Zego Express Engine account (for video conferencing)
- AWS account (Optional for cloud storage and compute)
- Docker (Optional for containerization)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/fahadhossain24/therapist-consultation.git
cd therapist-consultation
```

2. Install dependencies:
```bash
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Build the project:
```bash
yarn build
```

5. Run the development server:
```bash
yarn dev
```

6. Run the production server:
```bash
yarn start
```

7. Test the API:
```bash
yarn test
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.


## 🤝 Contributing
1. Fork the repository
2. Create your feature branch (git checkout -b feature/amazing-feature)
3. Commit your changes (git commit -m 'Add some amazing feature')
4. Push to the branch (git push origin feature/amazing-feature)
5. Open a Pull Request


## 📢 Support
For support, email fahadhossain0503@gmail.com