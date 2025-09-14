/**
 * Production-safe logging utility
 * Only logs in development mode
 */

const isDevelopment = process.env.NODE_ENV === 'development';

const logger = {
  info: (message, ...args) => {
    if (isDevelopment) {
      console.log(message, ...args);
    }
  },
  
  warn: (message, ...args) => {
    if (isDevelopment) {
      console.warn(message, ...args);
    }
  },
  
  error: (message, ...args) => {
    // Always log errors, even in production
    console.error(message, ...args);
  },
  
  debug: (message, ...args) => {
    if (isDevelopment) {
      console.debug(message, ...args);
    }
  }
};

export default logger;
