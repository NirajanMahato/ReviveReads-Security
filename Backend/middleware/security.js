const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const expectCt = require("expect-ct");
const express = require("express");
const morgan = require("morgan");
const winston = require("winston");
const mongoSanitize = require("express-mongo-sanitize");

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

const morganMiddleware = morgan("combined", {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
});

// Rate limiter for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 6,
  message: "Too many attempts, please try again later.",
  keyGenerator: (req, res) => {
    // Use email for login attempts if present, otherwise fallback to IP
    if (req.body && req.body.email) {
      return req.body.email.toLowerCase();
    }
    return req.ip;
  },
});

function applySecurityMiddlewares(app) {
  app.use(morganMiddleware);

  app.use(
    helmet({
      frameguard: { action: "deny" },
      noSniff: true,
      xssFilter: true,
    })
  );
  if (process.env.NODE_ENV === "production") {
    app.use(
      helmet.hsts({
        maxAge: 31536000, // 1 year in seconds
        includeSubDomains: true,
        preload: true,
      })
    );
  }
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
        reportUri: ["/csp-violation-report-endpoint"],
      },
      reportOnly: false,
    })
  );

  // Additional security headers
  app.use(helmet.referrerPolicy({ policy: "strict-origin-when-cross-origin" }));
  app.use(helmet.permittedCrossDomainPolicies());
  app.use(expectCt({ maxAge: 86400, enforce: true }));
  app.use(xss());
  app.use(express.json({ limit: "10mb" }));
  app.use(mongoSanitize());
}

module.exports = {
  applySecurityMiddlewares,
  authLimiter,
  logger,
};
