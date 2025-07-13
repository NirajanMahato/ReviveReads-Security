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

- **Admin Dashboard**
  - User management
  - Book listings management
  - System settings
  - **Security Monitoring Dashboard** (NEW)
    - Real-time security metrics
    - Activity logs and audit trails
    - Security event monitoring
    - System health indicators
    - Suspicious IP tracking
    - Export capabilities

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

- **Security Monitoring** (NEW)
  - Real-time security event tracking
  - Activity logging and analytics
  - Security metrics dashboard
  - Suspicious activity detection
  - IP address monitoring
  - System health monitoring
  - Export and reporting capabilities

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
- **Chart.js** - Data visualization
- **TanStack Table** - Data tables

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Nodemailer** - Email service
- **Socket.io** - Real-time communication
- **Multer** - File upload handling
- **Helmet** - Security headers
- **Rate Limiting** - API protection
- **Winston** - Logging
- **Morgan** - HTTP request logging

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

### Security Monitoring Dashboard

The Security Monitoring Dashboard provides comprehensive real-time monitoring of system security:

#### Real-time Metrics

- **Failed Login Attempts** - Track failed authentication attempts in the last hour
- **Suspicious Activities** - Monitor suspicious behavior patterns
- **Rate Limit Violations** - Track API abuse attempts
- **Locked Accounts** - Monitor account security status

#### System Health

- **Total Users** - System user count
- **Active Users** - Currently active users
- **Active Rate** - Percentage of active users

#### Security Analytics

- **24-Hour Activity Trends** - Visualize system activity patterns
- **Security Event Trends** - Track security incidents over time
- **Severity Distribution** - Analyze event severity levels
- **Top Actions** - Most common user actions

#### Monitoring Features

- **Suspicious IP Tracking** - Identify and monitor suspicious IP addresses
- **Security Events Table** - Detailed view of recent security incidents
- **Activity Logs** - Comprehensive audit trail with filtering
- **Export Capabilities** - Export logs in CSV format for analysis

#### Alert System

- **Visual Alerts** - Pulsing indicators for critical metrics
- **Real-time Updates** - Automatic refresh every 30 seconds
- **Threshold Monitoring** - Alerts when metrics exceed thresholds

## Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- MongoDB
- npm or yarn

### Backend

1. `cd Backend`
2. Install dependencies: `npm install`
3. Create a `.env` file with the following variables:

   - `JWT_SECRET=your_jwt_secret`
   - `MONGO_DB_URI=your_mongodb_connection_string`
   - `EMAIL_USER=your_email`
   - `EMAIL_PASS=your_email_password`
   - `FRONTEND_URL=http://localhost:4000`
   - `GOOGLE_CLIENT_ID=your_google_client_id`
   - `GOOGLE_CLIENT_SECRET=your_google_client_secret`

4. **Create a `logs/` directory** in `Backend` for logging if it does not exist: `mkdir logs`
5. Start the server: `npm run dev`

### Frontend

1. `cd Frontend`
2. Install dependencies: `npm install`
3. Create a `.env` file with the following variables:

   - `VITE_API_URL=http://localhost:5000`
   - `VITE_GOOGLE_CLIENT_ID=your_google_client_id`

4. Start the frontend: `npm run dev`

---

## Security Features Implemented

### 1. **JWT Authentication**

- All protected routes require a valid JWT token.
- Tokens are signed with a secret and have a 3-day expiry.
- JWT tokens are stored in httpOnly cookies for enhanced security.
- Session versioning prevents token reuse after logout.

### 2. **Password Hashing**

- User passwords are hashed using bcrypt before storage.
- Passwords are never stored or transmitted in plain text.

### 3. **Two-Factor Authentication (2FA) via Email OTP**

- On login, after correct password, a 6-digit OTP is sent to the user's email.
- OTP is valid for 5 minutes and must be verified before login is completed.
- JWT is only issued after successful OTP verification.

### 4. **Role-Based Access Control**

- Admin and user roles are enforced both in backend and frontend.
- Admin-only routes are protected by middleware.
- React Context API used for user state management instead of localStorage.

### 5. **Enhanced Input Validation & Sanitization**

- Frontend uses Yup for comprehensive form validation with strong password requirements.
- Backend implements comprehensive input sanitization using XSS protection.
- Email and phone number formats are strictly validated.
- All MongoDB ObjectIds are validated before DB queries to prevent NoSQL injection.
- Input sanitization middleware applied to all user inputs.
- Strong password policy: minimum 8 characters with uppercase, lowercase, number, and special character requirements.

### 6. **Enhanced File Upload Security**

- Only image files are accepted for uploads (avatars, book images).
- Strict MIME type validation prevents file type spoofing.
- File size limits are enforced (5MB for book images, 5MB for avatars).
- Uploaded files are renamed with random names to prevent collisions.
- Rate limiting on file uploads (10 uploads per 15 minutes per IP).

### 7. **Password Reset Security**

- Password reset tokens are JWTs with a 15-minute expiry.
- Tokens are stored in the database and invalidated after use.

### 8. **CORS Protection**

- CORS is enabled and restricted to specific frontend origins.

### 9. **Error Handling**

- Generic error messages are returned to avoid leaking sensitive information.

### 10. **Request Size Limiting**

- The request body size is limited to 10MB.

### 11. **Rate Limiting**

- Sensitive authentication routes (login, OTP, password reset) are rate-limited to prevent brute-force attacks.

### 12. **XSS Protection**

- All user input is sanitized using `xss-clean` middleware.

### 13. **Advanced Content Security Policy (CSP)**

- Strict CSP is enforced using helmet to restrict sources of scripts, styles, images, etc.
- CSP violation reporting is enabled.

### 14. **HTTP Security Headers**

- `helmet` is used to set headers for clickjacking, MIME sniffing, and other common web vulnerabilities.

### 15. **HTTP Strict Transport Security (HSTS)**

- The backend sets the Strict-Transport-Security header (HSTS) in production.
- Forces browsers to use HTTPS for all requests, preventing protocol downgrade and cookie hijacking attacks.

### 16. **HTTP Request Logging**

- All HTTP requests are logged using `morgan` and stored with `winston` in `logs/combined.log` and `logs/error.log`.

### 17. **Environment Variable Validation**

- The app will not start if any required environment variable is missing, preventing insecure or misconfigured deployments.

### 18. **Account Lockout After Multiple Failed Logins**

- After 5 failed login attempts, the user account is locked for 15 minutes.
- Prevents brute-force attacks by making repeated login attempts ineffective.
- User is notified of lockout status and remaining lockout time.

### 19. **Audit Logging of Sensitive Actions**

- All sensitive actions (login, logout, profile update, failed login) are logged to a dedicated audit log collection in the database.
- Each log entry includes user ID, action, resource, IP address, user agent, and timestamp.
- Supports auditing, troubleshooting, and security reviews.

### 20. **Email Notifications for Security Events**

- Users receive email notifications for important security events:
  - Account lockout after multiple failed login attempts
  - Password change
- Helps users detect suspicious activity and respond quickly to potential threats.

### 21. **Logout from All Devices (Session Invalidation)**

- Users can log out from all devices/sessions with a single action.
- All existing JWTs are invalidated by incrementing a session version in the database.
- Prevents session hijacking and allows users to secure their account if a device is lost or compromised.

### 22. **Enhanced Input Sanitization with DOMPurify (Frontend)**

- All user-generated HTML content rendered in the frontend is sanitized using DOMPurify.
- Comprehensive text sanitization for all user inputs.
- Prevents XSS attacks by ensuring only safe HTML is rendered.
- Utility functions for sanitizing both HTML and plain text content.

### 23. **Google OAuth Integration**

- Secure Google OAuth 2.0 authentication flow.
- Google Identity Services integration for seamless login.
- Automatic user account creation for new Google users.
- Secure token verification on backend.

### 24. **Real-time Messaging System**

- WebSocket-based real-time messaging between users.
- Secure socket authentication and message validation.
- Message history and conversation management.
- Real-time notifications for new messages.

### 25. **Enhanced State Management**

- Zustand for lightweight state management.
- React Context API for user authentication state.
- Secure token storage in httpOnly cookies.
- Automatic token refresh and session management.

### 26. **Characters Typing CAPTCHA Integration**

- Simple character-based CAPTCHA on registration.
- Users must type a random 5-character string exactly.
- Client-side and server-side verification of CAPTCHA answers.
- Prevents automated bot registrations and credential stuffing attacks.
- User-friendly and accessible.

### 27. **Security Monitoring Dashboard** (NEW)

- **Real-time Security Metrics**: Monitor failed logins, suspicious activities, rate limit violations, and locked accounts in real-time.
- **System Health Monitoring**: Track total users, active users, and system activity rates.
- **Security Analytics**: Visualize security event trends, severity distributions, and activity patterns.
- **Suspicious IP Tracking**: Identify and monitor IP addresses with suspicious activity patterns.
- **Comprehensive Audit Logs**: Detailed activity logs with filtering and search capabilities.
- **Export Functionality**: Export security logs in CSV format for external analysis.
- **Alert System**: Visual alerts for critical security metrics with configurable thresholds.
- **Real-time Updates**: Automatic refresh every 30 seconds to ensure current data.

---

## Advanced Security Features

- Account Lockout After Multiple Failed Logins
- Audit Logging of Sensitive Actions
- Email Notifications for Security Events
- Logout from All Devices (Session Invalidation)
- HTTP Strict Transport Security (HSTS)
- Enhanced Input Sanitization with DOMPurify (Frontend)
- Strong Password Policy Enforcement
- Comprehensive Input Validation & Sanitization
- Enhanced File Upload Security with Rate Limiting
- Socket.io Authentication
- Additional Security Headers (Referrer-Policy, Permissions-Policy)
- CORS Protection with X-Requested-With Header
- Google OAuth 2.0 Integration
- Real-time Messaging with WebSocket Security
- React Context API for Secure State Management
- Characters Typing CAPTCHA Integration
- **Security Monitoring Dashboard with Real-time Analytics**

---

## Authors

- Nirajan Mahato

---

**This project demonstrates secure web development practices for my college's security assignment.**
