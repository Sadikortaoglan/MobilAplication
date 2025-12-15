// Error handling utility - sanitize backend errors for users
export const sanitizeErrorMessage = (error: any): string => {
  // If it's a network error
  if (!error.response) {
    return 'Network error. Please check your connection and try again.';
  }

  const status = error.response?.status;
  const data = error.response?.data;

  // Handle specific error codes
  if (status === 401) {
    return 'Please sign in to continue.';
  }

  if (status === 403) {
    return 'You do not have permission to perform this action.';
  }

  if (status === 404) {
    return 'Resource not found.';
  }

  if (status === 409) {
    // Conflict - usually means already exists
    return data?.message || 'This action has already been completed.';
  }

  if (status === 422) {
    // Validation error
    return data?.message || 'Invalid data. Please check your input.';
  }

  if (status === 500) {
    return 'Server error. Please try again later.';
  }

  // Check for SQL/database errors in message
  const message = data?.message || error.message || 'An error occurred';
  
  // Hide technical errors from users
  if (
    message.includes('null value') ||
    message.includes('constraint') ||
    message.includes('SQL') ||
    message.includes('database') ||
    message.includes('column') ||
    message.includes('relation')
  ) {
    return 'Something went wrong. Please try again.';
  }

  // Return user-friendly message
  return message;
};

