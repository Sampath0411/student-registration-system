function validateSubmission(fields, data) {
  const errors = {};

  for (const field of fields) {
    if (!field.active) continue;
    const value = data[field.name];
    const rules = field.validation || {};

    if (field.required && (value === undefined || value === null || value === '')) {
      errors[field.name] = `${field.label} is required`;
      continue;
    }

    if (value === undefined || value === null || value === '') continue;

    switch (field.type) {
      case 'email': {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors[field.name] = 'Invalid email address';
        }
        break;
      }
      case 'number': {
        const num = Number(value);
        if (isNaN(num)) {
          errors[field.name] = `${field.label} must be a number`;
        } else {
          if (rules.min !== undefined && num < rules.min) {
            errors[field.name] = `${field.label} must be at least ${rules.min}`;
          }
          if (rules.max !== undefined && num > rules.max) {
            errors[field.name] = `${field.label} must be at most ${rules.max}`;
          }
        }
        break;
      }
      case 'text':
      case 'textarea': {
        if (typeof value === 'string') {
          if (rules.minLength && value.length < rules.minLength) {
            errors[field.name] = `${field.label} must be at least ${rules.minLength} characters`;
          }
          if (rules.maxLength && value.length > rules.maxLength) {
            errors[field.name] = `${field.label} must be at most ${rules.maxLength} characters`;
          }
          if (rules.pattern) {
            const regex = new RegExp(rules.pattern);
            if (!regex.test(value)) {
              errors[field.name] = rules.patternMessage || `${field.label} format is invalid`;
            }
          }
        }
        break;
      }
      case 'dropdown':
      case 'radio': {
        if (field.options && field.options.length > 0 && !field.options.includes(value)) {
          errors[field.name] = `Invalid option for ${field.label}`;
        }
        break;
      }
      case 'date': {
        if (isNaN(Date.parse(value))) {
          errors[field.name] = `${field.label} must be a valid date`;
        }
        break;
      }
    }
  }

  return errors;
}

module.exports = { validateSubmission };
