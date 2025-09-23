const crypto = require('crypto');

// Custom CSRF protection middleware (since csurf is deprecated)
class CSRFProtection {
  constructor(options = {}) {
    this.tokenLength = options.tokenLength || 32;
    this.cookieName = options.cookieName || '_csrf';
    this.headerName = options.headerName || 'x-csrf-token';
    this.skipPaths = options.skipPaths || [];
  }

  generateToken() {
    return crypto.randomBytes(this.tokenLength).toString('hex');
  }

  middleware() {
    return (req, res, next) => {
      // Skip CSRF for excluded paths
      if (this.skipPaths.some(path => req.path.startsWith(path))) {
        return next();
      }

      // Generate token for GET requests
      if (req.method === 'GET') {
        if (!req.session.csrfToken) {
          req.session.csrfToken = this.generateToken();
        }
        req.csrfToken = () => req.session.csrfToken;
        return next();
      }

      // Verify token for state-changing requests
      if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
        const sessionToken = req.session.csrfToken;
        const providedToken = req.body._csrf ||
                            req.headers[this.headerName] ||
                            req.headers['csrf-token'];

        if (!sessionToken || !providedToken || sessionToken !== providedToken) {
          const error = new Error('Invalid CSRF token');
          error.status = 403;
          return next(error);
        }
      }

      next();
    };
  }

  // Middleware to provide CSRF token to response locals
  provideToken() {
    return (req, res, next) => {
      if (req.csrfToken) {
        res.locals.csrfToken = req.csrfToken();
      }
      next();
    };
  }
}

// Create instance with configuration
const csrfProtection = new CSRFProtection({
  skipPaths: ['/api/auth/login', '/api/auth/register', '/api/auth/forgot-password'],
  tokenLength: 32
});

module.exports = {
  csrfProtection,
  csrfMiddleware: csrfProtection.middleware(),
  csrfTokenProvider: csrfProtection.provideToken()
};