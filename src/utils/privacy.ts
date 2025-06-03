
// Privacy and data protection utilities
export const sanitizeInput = (input: string): string => {
  // Remove potentially harmful characters and limit length
  return input
    .replace(/[<>]/g, '') // Remove potential XSS characters
    .trim()
    .substring(0, 1000); // Limit input length
};

export const generateAnonymousId = (): string => {
  // Generate a random anonymous ID for session tracking
  return 'anon_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

export const clearSensitiveData = (): void => {
  // Clear any sensitive data from localStorage on logout/session end
  const keysToRemove = ['chatHistory', 'userPreferences', 'sessionData'];
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });
};

export const validateTopicSelection = (topic: string): boolean => {
  const validTopics = [
    'general',
    'relationships',
    'work-stress',
    'family',
    'married-life',
    'lgbtq',
    'loneliness'
  ];
  return validTopics.includes(topic);
};
