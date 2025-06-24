# ReviveReads

A secure book marketplace web application.

## Project Overview

ReviveReads is a full-stack web application for buying, selling, and exchanging books. The project is designed with a strong focus on modern web security best practices, making it an ideal submission for a security-focused assignment.

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
4. Start the server: `npm run dev`

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

### 6. **File Upload Security**

- Only image files are accepted for uploads (avatars, book images).
- File size limits are enforced (5MB for book images).
- Uploaded files are renamed with random names to prevent collisions.

### 7. **Password Reset Security**

- Password reset tokens are JWTs with a 15-minute expiry.
- Tokens are stored in the database and invalidated after use.

### 8. **CORS Protection**

- CORS is enabled and can be restricted to specific frontend origins.

### 9. **Error Handling**

- Generic error messages are returned to avoid leaking sensitive information.

---

## Authors

- Nirajan Mahato

---

**This project demonstrates secure web development practices for my college's security assignment.**
