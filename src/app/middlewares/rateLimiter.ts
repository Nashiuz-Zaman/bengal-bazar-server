import rateLimit from 'express-rate-limit';

/**
 * Specifically for email-related actions.
 * Limits to 3 attempts every 15 minutes per IP.
 */
export const emailRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 requests per windowMs
  message: {
    status: 429,
    message: "Too many requests. Please wait 15 minutes before requesting another email.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});