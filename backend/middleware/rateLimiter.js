const rateLimitMap = {};

// Clean up memory leaks: prune expired IP records every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const ip in rateLimitMap) {
    if (Object.prototype.hasOwnProperty.call(rateLimitMap, ip)) {
      rateLimitMap[ip] = rateLimitMap[ip].filter((record) => now - record.timestamp < record.windowMs);
      if (rateLimitMap[ip].length === 0) {
        delete rateLimitMap[ip];
      }
    }
  }
}, 10 * 60 * 1000);

export const rateLimiter = (options = {}) => {
  const windowMs = options.windowMs || 15 * 60 * 1000; // default 15 mins
  const max = options.max || 100; // default 100 requests
  const message = options.message || "Too many requests from this IP, please try again later.";

  return (req, res, next) => {
    if (process.env.NODE_ENV === "test") {
      return next();
    }
    // Extract true client IP safely behind proxy/load-balancers
    const forwardedHeader = req.headers["x-forwarded-for"];
    const clientIp = forwardedHeader 
      ? forwardedHeader.split(",")[0].trim() 
      : req.ip || req.socket.remoteAddress || "127.0.0.1";
      
    const now = Date.now();

    if (!rateLimitMap[clientIp]) {
      rateLimitMap[clientIp] = [];
    }

    // Filter out timestamps outside the active window
    rateLimitMap[clientIp] = rateLimitMap[clientIp].filter(
      (record) => now - record.timestamp < windowMs
    );

    if (rateLimitMap[clientIp].length >= max) {
      return res.status(429).json({
        success: false,
        message,
      });
    }

    // Add current request timestamp
    rateLimitMap[clientIp].push({ timestamp: now, windowMs });
    next();
  };
};

// Rate limiter for authentication attempts
export const authRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many authentication attempts. Please try again after 15 minutes."
});

// Rate limiter for sensitive password recovery actions
export const resetRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  message: "Too many password recovery requests. Please try again after 15 minutes."
});
