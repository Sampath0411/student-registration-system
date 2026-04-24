import React from 'react';

export default function DynamicField({ field, value, onChange, error }) {
  const baseClass = `input-field ${error ? 'border-red-500 focus:ring-red-500' : ''}`;

  const handleChange = (e) => {
    const val = field.type === 'checkbox'
      ? (e.target.checked
        ? [...(value || []), e.target.value]
        : (value || []).filter(v => v !== e.target.value))
      : e.target.value;
    onChange(field.name, val);
  };

  const renderField = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
      case 'date':
        return (
          <input
            type={field.type}
            className={baseClass}
            placeholder={field.placeholder || ''}
            value={value || ''}
            onChange={(e) => onChange(field.name, e.target.value)}
          />
        );
      case 'textarea':
        return (
          <textarea
            className={`${baseClass} min-h-[100px]`}
            placeholder={field.placeholder || ''}
            value={value || ''}
            onChange={(e) => onChange(field.name, e.target.value)}
            rows={4}
          />
        );
      case 'dropdown':
        return (
          <select
            className={baseClass}
            value={value || ''}
            onChange={(e) => onChange(field.name, e.target.value)}
          >
            <option value="">Select {field.label}</option>
            {(field.options || []).map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );
      case 'radio':
        return (
          <div className="space-y-2 mt-1">
            {(field.options || []).map(opt => (
              <label key={opt} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name={field.name}
                  value={opt}
                  checked={value === opt}
                  onChange={(e) => onChange(field.name, e.target.value)}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{opt}</span>
              </label>
            ))}
          </div>
        );
      case 'checkbox':
        return (
          <div className="space-y-2 mt-1">
            {(field.options || []).map(opt => (
              <label key={opt} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  value={opt}
                  checked={(value || []).includes(opt)}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{opt}</span>
              </label>
            ))}
          </div>
        );
      default:
        return <input type="text" className={baseClass} value={value || ''} onChange={(e) => onChange(field.name, e.target.value)} />;
    }
  };

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderField()}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {field.validation?.minLength && (
        <p className="text-xs text-gray-400">Min {field.validation.minLength} characters</p>
      )}
    </div>
  );
}
