import React, { useState, useEffect } from 'react';
import { FiX, FiPlus, FiTrash2 } from 'react-icons/fi';

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'email', label: 'Email' },
  { value: 'number', label: 'Number' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'radio', label: 'Radio Buttons' },
  { value: 'checkbox', label: 'Checkboxes' },
  { value: 'date', label: 'Date' },
];

const NEEDS_OPTIONS = ['dropdown', 'radio', 'checkbox'];

export default function FieldEditor({ field, onSave, onClose }) {
  const [form, setForm] = useState({
    label: '', name: '', type: 'text', required: false,
    placeholder: '', options: [], active: true,
    validation: { minLength: '', maxLength: '', min: '', max: '', pattern: '', patternMessage: '' }
  });

  useEffect(() => {
    if (field) {
      setForm({
        ...field,
        validation: { minLength: '', maxLength: '', min: '', max: '', pattern: '', patternMessage: '', ...(field.validation || {}) },
        options: field.options || []
      });
    }
  }, [field]);

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (key === 'label' && !field) {
      setForm(prev => ({ ...prev, name: value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/_+$/, '') }));
    }
  };

  const handleValidationChange = (key, value) => {
    setForm(prev => ({
      ...prev,
      validation: { ...prev.validation, [key]: value }
    }));
  };

  const handleAddOption = () => {
    setForm(prev => ({ ...prev, options: [...prev.options, ''] }));
  };

  const handleOptionChange = (index, value) => {
    const opts = [...form.options];
    opts[index] = value;
    setForm(prev => ({ ...prev, options: opts }));
  };

  const handleRemoveOption = (index) => {
    setForm(prev => ({ ...prev, options: prev.options.filter((_, i) => i !== index) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleaned = { ...form };
    const val = {};
    if (cleaned.validation.minLength) val.minLength = Number(cleaned.validation.minLength);
    if (cleaned.validation.maxLength) val.maxLength = Number(cleaned.validation.maxLength);
    if (cleaned.validation.min) val.min = Number(cleaned.validation.min);
    if (cleaned.validation.max) val.max = Number(cleaned.validation.max);
    if (cleaned.validation.pattern) { val.pattern = cleaned.validation.pattern; val.patternMessage = cleaned.validation.patternMessage || ''; }
    cleaned.validation = val;
    cleaned.options = cleaned.options.filter(o => o.trim());
    onSave(cleaned);
  };

  const showOptions = NEEDS_OPTIONS.includes(form.type);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">{field ? 'Edit Field' : 'Add New Field'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><FiX className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
              <input className="input-field" value={form.label} onChange={e => handleChange('label', e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Field Name</label>
              <input className="input-field" value={form.name} onChange={e => handleChange('name', e.target.value)} required pattern="[a-z0-9_]+" title="lowercase letters, numbers, underscores" disabled={!!field} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select className="input-field" value={form.type} onChange={e => handleChange('type', e.target.value)}>
                {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Placeholder</label>
              <input className="input-field" value={form.placeholder} onChange={e => handleChange('placeholder', e.target.value)} />
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" checked={form.required} onChange={e => handleChange('required', e.target.checked)} className="w-4 h-4 rounded text-primary-600" />
              <span className="text-sm">Required</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={e => handleChange('active', e.target.checked)} className="w-4 h-4 rounded text-primary-600" />
              <span className="text-sm">Active</span>
            </label>
          </div>

          {showOptions && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
              <div className="space-y-2">
                {form.options.map((opt, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <input className="input-field" value={opt} onChange={e => handleOptionChange(i, e.target.value)} placeholder={`Option ${i + 1}`} />
                    <button type="button" onClick={() => handleRemoveOption(i)} className="text-red-500 hover:text-red-700"><FiTrash2 /></button>
                  </div>
                ))}
                <button type="button" onClick={handleAddOption} className="flex items-center text-sm text-primary-600 hover:text-primary-700">
                  <FiPlus className="mr-1" /> Add Option
                </button>
              </div>
            </div>
          )}

          {(form.type === 'text' || form.type === 'textarea') && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Length</label>
                <input type="number" className="input-field" value={form.validation.minLength} onChange={e => handleValidationChange('minLength', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Length</label>
                <input type="number" className="input-field" value={form.validation.maxLength} onChange={e => handleValidationChange('maxLength', e.target.value)} />
              </div>
            </div>
          )}

          {form.type === 'number' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Value</label>
                <input type="number" className="input-field" value={form.validation.min} onChange={e => handleValidationChange('min', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Value</label>
                <input type="number" className="input-field" value={form.validation.max} onChange={e => handleValidationChange('max', e.target.value)} />
              </div>
            </div>
          )}

          {(form.type === 'text' || form.type === 'textarea') && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Regex Pattern</label>
                <input className="input-field" value={form.validation.pattern} onChange={e => handleValidationChange('pattern', e.target.value)} placeholder="e.g. ^[A-Za-z]+$" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pattern Message</label>
                <input className="input-field" value={form.validation.patternMessage} onChange={e => handleValidationChange('patternMessage', e.target.value)} placeholder="Error message" />
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{field ? 'Update Field' : 'Add Field'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
