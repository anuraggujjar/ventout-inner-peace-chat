// Privacy and input sanitization utilities

export const sanitizeInput = (input: string): string => {
  // Remove potentially harmful content
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .substring(0, 1000); // Limit length
};

export const validateMessage = (message: string): boolean => {
  if (!message || message.trim().length === 0) {
    return false;
  }
  
  if (message.length > 1000) {
    return false;
  }
  
  // Check for spam patterns
  const spamPatterns = [
    /(.)\1{10,}/, // Repeated characters
    /https?:\/\/[^\s]+/gi, // URLs (optional - remove if you want to allow URLs)
  ];
  
  return !spamPatterns.some(pattern => pattern.test(message));
};

export const maskPersonalInfo = (message: string): string => {
  // Basic patterns for common personal info
  return message
    .replace(/\b\d{3}-\d{3}-\d{4}\b/g, '[PHONE]') // Phone numbers
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]') // Email addresses
    .replace(/\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/g, '[CARD]') // Credit card numbers
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]'); // SSN
};

export const generateAnonymousId = (): string => {
  return 'anon_' + Math.random().toString(36).substr(2, 9);
};

export const clearSensitiveData = (data: any): any => {
  if (typeof data === 'string') {
    return maskPersonalInfo(data);
  }
  
  if (Array.isArray(data)) {
    return data.map(clearSensitiveData);
  }
  
  if (typeof data === 'object' && data !== null) {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(data)) {
      // Skip sensitive fields
      if (['password', 'token', 'secret', 'key'].includes(key.toLowerCase())) {
        continue;
      }
      cleaned[key] = clearSensitiveData(value);
    }
    return cleaned;
  }
  
  return data;
};

export const validateTopicSelection = (topic: string): boolean => {
  if (!topic || topic.trim().length === 0) {
    return false;
  }
  
  if (topic.length > 100) {
    return false;
  }
  
  // Check for inappropriate content
  const inappropriatePatterns = [
    /\b(violence|illegal|drugs|self-harm)\b/gi,
  ];
  
  return !inappropriatePatterns.some(pattern => pattern.test(topic));
};