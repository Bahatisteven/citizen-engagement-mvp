export const validators = {
  required: (value, fieldName) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return `${fieldName} is required`;
    }
    return null;
  },

  email: (value) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
    return null;
  },

  minLength: (minLength) => (value, fieldName) => {
    if (!value) return null;
    if (value.length < minLength) {
      return `${fieldName} must be at least ${minLength} characters`;
    }
    return null;
  },

  maxLength: (maxLength) => (value, fieldName) => {
    if (!value) return null;
    if (value.length > maxLength) {
      return `${fieldName} must be no more than ${maxLength} characters`;
    }
    return null;
  },

  password: (value) => {
    if (!value) return null;
    if (value.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/(?=.*[a-z])/.test(value)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/(?=.*[A-Z])/.test(value)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/(?=.*\d)/.test(value)) {
      return 'Password must contain at least one number';
    }
    return null;
  },

  confirmPassword: (password) => (value) => {
    if (!value) return null;
    if (value !== password) {
      return 'Passwords do not match';
    }
    return null;
  }
};

export const validateForm = (formData, validationRules) => {
  const errors = {};
  let isValid = true;

  Object.keys(validationRules).forEach(fieldName => {
    const rules = validationRules[fieldName];
    const value = formData[fieldName];

    for (const rule of rules) {
      const error = rule(value, fieldName);
      if (error) {
        errors[fieldName] = error;
        isValid = false;
        break;
      }
    }
  });

  return { errors, isValid };
};

export const validateField = (value, rules, fieldName) => {
  for (const rule of rules) {
    const error = rule(value, fieldName);
    if (error) {
      return error;
    }
  }
  return null;
};