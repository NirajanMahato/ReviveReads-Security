const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const express = require("express");
const morgan = require("morgan");
const winston = require("winston");

// Winston logger setup
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

// Morgan middleware to log HTTP requests using winston
const morganMiddleware = morgan("combined", {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
});

// Rate limiter for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: "Too many attempts, please try again later.",
});

// Function to apply all global security middlewares
function applySecurityMiddlewares(app) {
  // Logging
  app.use(morganMiddleware);

  app.use(
    helmet({
      frameguard: { action: "deny" },
      noSniff: true,
      xssFilter: true,
    })
  );
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", process.env.FRONTEND_URL],
        fontSrc: ["'self'", "https:", "data:"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
        reportUri: ["/csp-violation-report-endpoint"], // CSP violation reporting
      },
      reportOnly: false,
    })
  );
  app.use(xss());
  app.use(express.json({ limit: "10mb" }));
}

module.exports = {
  applySecurityMiddlewares,
  authLimiter,
  logger,
};

// Usage:
// In index.js: applySecurityMiddlewares(app);
// For rate limiting: use authLimiter on sensitive routes
// Logs are written to logs/error.log and logs/combined.log
