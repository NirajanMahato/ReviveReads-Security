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

## Project Structure

```
Frontend/
├── src/
│   ├── components/          # Reusable UI components
│   ├── context/            # React Context providers
│   ├── core/               # Main application pages
│   │   ├── private/        # Admin-only pages
│   │   │   ├── dashboard/  # Admin dashboard
│   │   │   ├── security/   # Security monitoring dashboard (NEW)
│   │   │   ├── users/      # User management
│   │   │   └── settings/   # System settings
│   │   └── public/         # Public pages
│   ├── hooks/              # Custom React hooks
│   │   ├── useSecurityMonitoring.js  # Security monitoring hook (NEW)
│   │   └── useSecurityMetrics.js     # Real-time metrics hook (NEW)
│   ├── shared/             # Shared components and utilities
│   └── store/              # State management
├── public/                 # Static assets
└── tests/                  # Test files
```

## Security Monitoring Dashboard Features

### Real-time Security Metrics

- Monitor failed login attempts, suspicious activities, and rate limit violations
- Track system health metrics including user counts and activity rates
- Visual alerts for critical security events

### Security Analytics

- Interactive charts showing activity trends and security event patterns
- Severity distribution analysis
- Top user actions and security incidents

### Monitoring Tools

- Suspicious IP address tracking and monitoring
- Comprehensive activity logs with advanced filtering
- Export functionality for security analysis and compliance

### Alert System

- Real-time visual alerts for critical metrics
- Configurable thresholds for different security events
- Automatic data refresh every 30 seconds

## Development

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Setup

1. Install dependencies: `npm install`
2. Create `.env` file with required environment variables
3. Start development server: `npm run dev`

### Environment Variables

- `VITE_API_URL` - Backend API URL
- `VITE_GOOGLE_CLIENT_ID` - Google OAuth client ID

## Testing

The project includes comprehensive testing with Playwright:

- End-to-end tests for all major user flows
- Security testing for authentication and authorization
- Performance and accessibility testing

Run tests with: `npm run test`

## Security Best Practices

- All user inputs are sanitized and validated
- JWT tokens stored securely in httpOnly cookies
- Role-based access control implemented
- Real-time security monitoring and alerting
- Comprehensive audit logging
- Rate limiting and DDoS protection
- XSS and CSRF protection
- Secure file upload handling

## Contributing

1. Follow security best practices
2. Write comprehensive tests
3. Document all security features
4. Review and audit code changes

## License

This project is for educational purposes and demonstrates secure web development practices.
