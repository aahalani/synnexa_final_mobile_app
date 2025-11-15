const isDevelopment = __DEV__ || process.env.NODE_ENV === 'development';
const DEBUG_ENABLED = isDevelopment || process.env.DEBUG === 'true';

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
  },
  info: (...args) => {
  },
  warn: (...args) => {
  },
  error: (...args) => {
  },
  apiRequest: (endpoint, method, headers) => {
    if (isDevelopment) {
      const sanitizedHeaders = sanitizeHeaders(headers);
      logger.info('API Request', { endpoint, method, headers: sanitizedHeaders });
    }
  },
  apiResponse: (endpoint, status, statusText) => {
    if (isDevelopment) {
      logger.info('API Response', { endpoint, status, statusText });
    } else {
      if (status >= 400) {
        logger.error('API Error Response', { endpoint, status, statusText });
      }
    }
  },
};

export default logger;

