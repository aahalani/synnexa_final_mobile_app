// Logger utility with environment-based logging levels
const isDevelopment = __DEV__ || process.env.NODE_ENV === 'development';
const DEBUG_ENABLED = isDevelopment || process.env.DEBUG === 'true';

// Mask sensitive data
const maskToken = (token) => {
  if (!token || typeof token !== 'string') return '[REDACTED]';
  if (token.length <= 4) return '[REDACTED]';
  return `...${token.slice(-4)}`;
};

const maskUserId = (userId) => {
  if (!userId) return '[REDACTED]';
  return String(userId).replace(/\d/g, '*').slice(0, 4) + '...';
};

const sanitizeHeaders = (headers) => {
  if (!headers) return {};
  const sanitized = { ...headers };
  if (sanitized.Authorization) {
    const token = sanitized.Authorization.replace('Bearer ', '');
    sanitized.Authorization = `Bearer ${maskToken(token)}`;
  }
  if (sanitized.LOGGED_IN_USER) {
    sanitized.LOGGED_IN_USER = maskUserId(sanitized.LOGGED_IN_USER);
  }
  return sanitized;
};

const logger = {
  debug: (...args) => {
    if (DEBUG_ENABLED) {
      console.log('[DEBUG]', ...args);
    }
  },
  info: (...args) => {
    if (isDevelopment) {
      console.log('[INFO]', ...args);
    }
  },
  warn: (...args) => {
    console.warn('[WARN]', ...args);
  },
  error: (...args) => {
    console.error('[ERROR]', ...args);
  },
  // Safe logging for API requests - masks sensitive data
  apiRequest: (endpoint, method, headers) => {
    if (isDevelopment) {
      const sanitizedHeaders = sanitizeHeaders(headers);
      logger.info('API Request', { endpoint, method, headers: sanitizedHeaders });
    }
  },
  // Safe logging for API responses - only logs summary in production
  apiResponse: (endpoint, status, statusText) => {
    if (isDevelopment) {
      logger.info('API Response', { endpoint, status, statusText });
    } else {
      // In production, only log errors
      if (status >= 400) {
        logger.error('API Error Response', { endpoint, status, statusText });
      }
    }
  },
};

export default logger;

