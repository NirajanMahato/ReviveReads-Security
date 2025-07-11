# ReviveReads - Secure Book Marketplace

A secure, full-stack book marketplace application built with React frontend and Node.js/Express backend, featuring comprehensive security measures and modern web technologies.

## Features

### Core Functionality

- **User Authentication & Authorization**

  - JWT-based authentication with httpOnly cookies
  - Role-based access control (User/Admin)
  - Google OAuth integration
  - Two-factor authentication via email OTP
  - Password reset functionality

- **Book Management**

  - Book listings with search and filtering
  - Book details with images and descriptions
  - User book management (add, edit, delete)
  - Admin book approval system

- **Messaging System**

  - Real-time messaging between users
  - WebSocket integration for instant updates
  - Message history and conversation management

- **User Profiles**

  - User profile management
  - Analytics and dashboard
  - Saved lists and book tracking

- **Notifications**
  - Real-time notifications
  - Email notifications
  - In-app notification system

### Security Features

- **Authentication Security**

  - JWT tokens with httpOnly cookies
  - Session management with versioning
  - Secure password policies
  - Account lockout protection

- **Data Protection**

  - Input validation and sanitization
  - XSS protection with DOMPurify
  - CSRF protection
  - SQL injection prevention

- **File Upload Security**

  - File type validation
  - File size limits
  - Secure file storage

- **API Security**
  - Rate limiting
  - Security headers (Helmet)
  - CORS configuration
  - Audit logging

## 🛠 Tech Stack

### Frontend

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Socket.io-client** - Real-time communication
- **DOMPurify** - XSS protection
- **React Hook Form** - Form handling

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Socket.io** - Real-time communication
- **Multer** - File upload handling
- **Nodemailer** - Email services
- **Helmet** - Security headers
- **Express-rate-limit** - Rate limiting
- **Express-validator** - Input validation

## Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- MongoDB
- Google Cloud Console account (for OAuth)

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd Backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:

   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   JWT_REFRESH_SECRET=your_refresh_secret_key
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_app_password
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

4. Start the backend server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd Frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:

   ```env
   VITE_API_URL=http://localhost:5000
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

### Backend (.env)

- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_REFRESH_SECRET` - Secret key for refresh tokens
- `EMAIL_USER` - Gmail address for sending emails
- `EMAIL_PASS` - Gmail app password
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

### Frontend (.env)

- `VITE_API_URL` - Backend API URL
- `VITE_GOOGLE_CLIENT_ID` - Google OAuth client ID

## Available Scripts

### Backend

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run test suite

### Frontend

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run Playwright tests

## Security Implementation

### Authentication & Authorization

- JWT tokens stored in httpOnly cookies
- Role-based access control (User/Admin)
- Session versioning for security
- Account lockout after failed attempts

### Data Validation

- Input sanitization and validation
- File upload security with type checking
- SQL injection prevention
- XSS protection with DOMPurify

### API Security

- Rate limiting on all endpoints
- Security headers via Helmet
- CORS configuration
- Audit logging for sensitive operations

### Real-time Security

- WebSocket authentication
- Message validation
- User status tracking
