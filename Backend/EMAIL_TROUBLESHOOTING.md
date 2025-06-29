# Email/OTP Troubleshooting Guide

## Common Issues and Solutions

### 1. Gmail SMTP Configuration

**Problem**: Gmail blocks login attempts or requires app passwords.

**Solution**:

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password in your `EMAIL_PASS` environment variable

### 2. Environment Variables

**Required Variables**:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
JWT_SECRET=your-jwt-secret
MONGO_DB_URI=your-mongodb-connection-string
FRONTEND_URL=http://localhost:4000
```

### 3. Testing Email Configuration

Use the test endpoint to verify email setup:

```bash
POST /api/user/test-email
Content-Type: application/json

{
  "email": "test@example.com"
}
```

### 4. Common Error Messages

- **"Invalid Credentials"**: Email or password is incorrect
- **"OTP not found"**: User needs to login again to get a new OTP
- **"OTP expired"**: OTP has expired (5 minutes), user needs to login again
- **"Email service unavailable"**: Email configuration issue

### 5. Debugging Steps

1. Check server logs for email errors
2. Verify environment variables are loaded
3. Test email configuration with the test endpoint
4. Check if Gmail account has 2FA enabled
5. Verify app password is correct

### 6. Alternative Email Services

If Gmail continues to cause issues, consider:

- SendGrid
- Mailgun
- AWS SES
- Nodemailer with other SMTP providers

### 7. Frontend Integration

Make sure your frontend handles these responses:

- `twoFactorRequired: true` - Show OTP input
- Email error responses - Show appropriate error messages
- OTP verification success - Redirect to dashboard
