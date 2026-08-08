const sanitizeString = (str) => {
  if (typeof str !== "string") return str;

  // Recursively remove scripts and inline handlers to prevent executable execution
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+\s*=\s*"(?:[^"]*)"/gi, "")
    .replace(/on\w+\s*=\s*'(?:[^']*)'/gi, "")
    .replace(/on\w+\s*=\s*(?:[^\s'">]+)/gi, "")
    .replace(/href\s*=\s*"(?:javascript:[^"]*)"/gi, "")
    .replace(/href\s*=\s*'(?:javascript:[^']*)'/gi, "");
};

const sanitizeObject = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  if (obj !== null && typeof obj === "object") {
    const sanitized = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }
  return typeof obj === "string" ? sanitizeString(obj) : obj;
};

const sanitizeInPlace = (obj) => {
  if (obj && typeof obj === "object") {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        obj[key] = sanitizeObject(obj[key]);
      }
    }
  }
};

export const xssSanitizer = (req, res, next) => {
  if (req.body) {
    sanitizeInPlace(req.body);
  }
  if (req.query) {
    sanitizeInPlace(req.query);
  }
  if (req.params) {
    sanitizeInPlace(req.params);
  }
  next();
};

export default xssSanitizer;
