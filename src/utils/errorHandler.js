export const parseBackendError = (error) => {
  if (!error.response) {
    return 'Network error. Please check your internet connection.';
  }

  const { data } = error.response;

  if (data?.error) {
    const { error: errorInfo } = data;

    if (errorInfo.type === 'ValidationError' && errorInfo.details) {
      const validationErrors = errorInfo.details.map((detail) => detail.message).join('\n');
      return validationErrors;
    }

    if (errorInfo.message) {
      return errorInfo.message;
    }
  }

  if (data?.message) {
    return data.message;
  }

  return 'An unexpected error occurred. Please try again.';
};

export const parseValidationErrors = (error) => {
  const fieldErrors = {};

  if (error.response?.data?.error?.type === 'ValidationError' && error.response.data.error.details) {
    error.response.data.error.details.forEach((detail) => {
      const fieldName = detail.path.join('.');
      fieldErrors[fieldName] = detail.message;
    });
  }

  return fieldErrors;
};
