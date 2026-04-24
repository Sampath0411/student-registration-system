export function validateField(field, value) {
  const rules = field.validation || {};

  if (field.required && (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0))) {
    return `${field.label} is required`;
  }

  if (value === undefined || value === null || value === '') return null;

  switch (field.type) {
    case 'email': {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return 'Invalid email address';
      break;
    }
    case 'number': {
      const num = Number(value);
      if (isNaN(num)) return `${field.label} must be a number`;
      if (rules.min !== undefined && num < rules.min) return `Must be at least ${rules.min}`;
      if (rules.max !== undefined && num > rules.max) return `Must be at most ${rules.max}`;
      break;
    }
    case 'text':
    case 'textarea': {
      if (typeof value === 'string') {
        if (rules.minLength && value.length < rules.minLength) return `Must be at least ${rules.minLength} characters`;
        if (rules.maxLength && value.length > rules.maxLength) return `Must be at most ${rules.maxLength} characters`;
        if (rules.pattern) {
          const regex = new RegExp(rules.pattern);
          if (!regex.test(value)) return rules.patternMessage || 'Invalid format';
        }
      }
      break;
    }
    case 'dropdown':
    case 'radio': {
      if (field.options && field.options.length > 0 && !field.options.includes(value)) {
        return 'Invalid option selected';
      }
      break;
    }
    case 'date': {
      if (isNaN(Date.parse(value))) return 'Invalid date';
      break;
    }
    default:
      break;
  }
  return null;
}

export function validateForm(fields, data) {
  const errors = {};
  for (const field of fields) {
    const error = validateField(field, data[field.name]);
    if (error) errors[field.name] = error;
  }
  return errors;
}
