# ReviveReads

A secure book marketplace web application.

## Project Overview

ReviveReads is a full-stack web application for buying, selling, and exchanging books. The project is designed with a strong focus on modern web security best practices, making it an ideal submission for a security-focused assignment.

---

## Tools & Technologies Used

### Backend

- **Node.js** (JavaScript runtime)
- **Express.js** (Web framework)
- **MongoDB** (Database)
- **Mongoose** (MongoDB ODM)
- **bcryptjs** (Password hashing)
- **jsonwebtoken** (JWT authentication)
- **nodemailer** (Email sending)
- **multer** (File uploads)
- **dotenv** (Environment variable management)
- **socket.io** (Real-time communication)
- **helmet** (Security HTTP headers, CSP)
- **xss-clean** (XSS protection)
- **express-rate-limit** (Rate limiting)
- **morgan** (HTTP request logging)
- **winston** (Advanced logging)
- **Modular security middleware** (All security logic in `middleware/security.js`)

### Frontend

- **React.js** (UI library)
- **Vite** (Build tool)
- **Redux Toolkit** (State management)
- **React Router** (Routing)
- **Yup & React Hook Form** (Form validation)
- **Axios** (HTTP requests)
- **Tailwind CSS** (Styling)
- **Playwright** (End-to-end testing)
- **React Hot Toast** (Notifications)
- **DOMPurify** (Strict input sanitization)

---

## Setup Instructions

### Backend

1. `cd Backend`
2. Install dependencies: `npm install`
3. Create a `.env` file with the following variables:
   - `MONGO_DB_URI=your_mongodb_uri`
   - `JWT_SECRET=your_jwt_secret`
   - `EMAIL_USER=your_email@gmail.com`
   - `EMAIL_PASS=your_email_password`
   - `FRONTEND_URL=http://localhost:5173` (or your frontend URL)
4. **Create a `logs/` directory** in `Backend` for logging if it does not exist: `mkdir logs`
5. Start the server: `npm run dev`

### Frontend

1. `cd Frontend`
2. Install dependencies: `npm install`
3. Start the frontend: `npm run dev`

---

## Security Features Implemented

### 1. **JWT Authentication**

- All protected routes require a valid JWT token.
- Tokens are signed with a secret and have a 3-day expiry.

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
- Additional Security Headers (Referrer-Policy, Permissions-Policy, Expect-CT)
- CORS Protection with X-Requested-With Header

---

## Authors

- Nirajan Mahato

---

**This project demonstrates secure web development practices for my college's security assignment.**
