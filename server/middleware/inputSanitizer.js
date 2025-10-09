const DOMPurify = require('isomorphic-dompurify');
const { JSDOM } = require('jsdom');

// Initialize DOMPurify with JSDOM
const window = new JSDOM('').window;
const purify = DOMPurify(window);

// SQL injection patterns
const SQL_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
  /(--|\/\*|\*\/|;|'|"|`)/gi,
  /(\bOR\b|\bAND\b)\s+\d+\s*=\s*\d+/gi,
  /\bUNION\b\s+(ALL\s+)?SELECT/gi
];

// XSS patterns
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe\b[^>]*>/gi,
  /<object\b[^>]*>/gi,
  /<embed\b[^>]*>/gi,
  /<form\b[^>]*>/gi
];

// Path traversal patterns
const PATH_TRAVERSAL_PATTERNS = [
  /\.\.[\/\\]/g,
  /[\/\\]\.\./g,
  /%2e%2e[\/\\]/gi,
  /\.\.[%2f%5c]/gi
];

// Command injection patterns
const COMMAND_INJECTION_PATTERNS = [
  /[;&|`$(){}[\]]/g,
  /\b(cat|ls|pwd|whoami|id|uname|ps|kill|rm|mv|cp|chmod|chown|sudo|su)\b/gi
];

// LDAP injection patterns
const LDAP_PATTERNS = [
  /[()=*!&|]/g,
  /\x00/g
];

// Sanitize string input
const sanitizeString = (input, options = {}) => {
  if (typeof input !== 'string') return input;

  let sanitized = input;

  // Remove null bytes
  sanitized = sanitized.replace(/\x00/g, '');

  // HTML sanitization
  if (options.allowHtml) {
    sanitized = purify.sanitize(sanitized, {
      ALLOWED_TAGS: options.allowedTags || ['b', 'i', 'em', 'strong', 'p', 'br'],
      ALLOWED_ATTR: options.allowedAttrs || []
    });
  } else {
    // Strip all HTML
    sanitized = sanitized.replace(/<[^>]*>/g, '');
  }

  // Remove XSS patterns
  XSS_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });

  // Remove SQL injection patterns
  if (options.preventSqlInjection !== false) {
    SQL_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });
  }

  // Remove path traversal
  if (options.preventPathTraversal !== false) {
    PATH_TRAVERSAL_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });
  }

  // Remove command injection
  if (options.preventCommandInjection !== false) {
    COMMAND_INJECTION_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });
  }

  // Remove LDAP injection
  if (options.preventLdapInjection !== false) {
    LDAP_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });
  }

  // Normalize whitespace
  if (options.normalizeWhitespace !== false) {
    sanitized = sanitized.replace(/\s+/g, ' ').trim();
  }

  // Length limit
  if (options.maxLength) {
    sanitized = sanitized.substring(0, options.maxLength);
  }

  return sanitized;
};

// Sanitize object recursively
const sanitizeObject = (obj, options = {}) => {
  if (obj === null || typeof obj !== 'object') {
    return typeof obj === 'string' ? sanitizeString(obj, options) : obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, options));
  }

  // Fields that should never be sanitized (passwords, tokens, etc.)
  const skipFields = options.skipFields || ['password', 'newPassword', 'oldPassword', 'currentPassword', 'token', 'refreshToken'];

  const sanitizedObj = {};
  for (const [key, value] of Object.entries(obj)) {
    // Skip sanitization for password fields and tokens
    if (skipFields.includes(key)) {
      sanitizedObj[key] = value;
    } else {
      // Sanitize keys as well
      const sanitizedKey = sanitizeString(key, { ...options, allowHtml: false });
      sanitizedObj[sanitizedKey] = sanitizeObject(value, options);
    }
  }

  return sanitizedObj;
};

// Middleware for input sanitization
const inputSanitizer = (options = {}) => {
  return (req, res, next) => {
    try {
      // Sanitize request body
      if (req.body && typeof req.body === 'object') {
        req.body = sanitizeObject(req.body, options.body || options);
      }

      // Sanitize query parameters
      // Skip query/params sanitization as they can be read-only in newer Express versions
      // Query parameters should be validated at the route level instead
      if (req.query && typeof req.query === 'object') {
        try {
          // Store sanitized version in separate property for route handlers to use
          req.sanitizedQuery = sanitizeObject(req.query, options.query || options);
        } catch (error) {
          // Silently fail if query sanitization causes issues
          req.sanitizedQuery = req.query;
        }
      }

      // Sanitize URL parameters
      if (req.params && typeof req.params === 'object') {
        try {
          // Store sanitized version in separate property for route handlers to use
          req.sanitizedParams = sanitizeObject(req.params, options.params || options);
        } catch (error) {
          // Silently fail if params sanitization causes issues
          req.sanitizedParams = req.params;
        }
      }

      // Sanitize headers (selective)
      if (options.sanitizeHeaders) {
        const headersToSanitize = options.sanitizeHeaders === true
          ? ['x-forwarded-for', 'user-agent', 'referer']
          : options.sanitizeHeaders;

        headersToSanitize.forEach(header => {
          if (req.headers[header]) {
            req.headers[header] = sanitizeString(req.headers[header], {
              ...options,
              allowHtml: false,
              maxLength: 500
            });
          }
        });
      }

      next();
    } catch (error) {
      const sanitizationError = new Error('Input sanitization failed');
      sanitizationError.status = 400;
      sanitizationError.originalError = error;
      next(sanitizationError);
    }
  };
};

// Predefined sanitization profiles
const profiles = {
  strict: {
    allowHtml: false,
    preventSqlInjection: true,
    preventPathTraversal: true,
    preventCommandInjection: true,
    preventLdapInjection: true,
    normalizeWhitespace: true,
    maxLength: 1000
  },

  moderate: {
    allowHtml: false,
    preventSqlInjection: true,
    preventPathTraversal: true,
    preventCommandInjection: false,
    preventLdapInjection: false,
    normalizeWhitespace: true,
    maxLength: 5000
  },

  permissive: {
    allowHtml: true,
    allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    preventSqlInjection: true,
    preventPathTraversal: true,
    preventCommandInjection: false,
    preventLdapInjection: false,
    normalizeWhitespace: false,
    maxLength: 10000
  }
};

module.exports = {
  inputSanitizer,
  sanitizeString,
  sanitizeObject,
  profiles
};