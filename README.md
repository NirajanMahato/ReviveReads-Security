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

### 5. **Input Validation & Sanitization**

- Frontend uses Yup for form validation (registration, login, password reset, etc.).
- Backend checks for required fields and validates password length.
- Email and phone number formats are validated.
- All MongoDB ObjectIds are validated before DB queries to prevent NoSQL injection.

### 6. **File Upload Security**

- Only image files are accepted for uploads (avatars, book images).
- File size limits are enforced (5MB for book images).
- Uploaded files are renamed with random names to prevent collisions.

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

### 15. **HTTP Request Logging**

- All HTTP requests are logged using `morgan` and stored with `winston` in `logs/combined.log` and `logs/error.log`.

### 16. **Environment Variable Validation**

- The app will not start if any required environment variable is missing, preventing insecure or misconfigured deployments.

---

## Author

- Nirajan Mahato

---

**This project demonstrates secure web development practices for my college's security assignment.**
