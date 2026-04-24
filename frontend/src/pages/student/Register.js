import React, { useState, useEffect } from 'react';
import { StudentLayout } from '../../components/common/Layout';
import DynamicField from '../../components/form/DynamicField';
import { validateForm } from '../../utils/validate';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiAlertCircle, FiSend, FiEdit } from 'react-icons/fi';

export default function Register() {
  const [fields, setFields] = useState([]);
  const [settings, setSettings] = useState(null);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [editToken, setEditToken] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [fieldsRes, settingsRes] = await Promise.all([
          api.get('/form/fields'),
          api.get('/settings')
        ]);
        setFields(fieldsRes.data);
        setSettings(settingsRes.data);
      } catch (err) {
        toast.error('Failed to load form');
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm(fields, formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix the errors below');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/submissions', formData);
      setSubmitted(true);
      setEditToken(res.data.editToken);
      toast.success(res.data.message);
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
        toast.error('Validation failed');
      } else {
        toast.error(err.response?.data?.message || 'Submission failed');
      }
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" />
        </div>
      </StudentLayout>
    );
  }

  if (!settings?.registrationEnabled) {
    return (
      <StudentLayout>
        <div className="card text-center py-12">
          <FiAlertCircle className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Registration Closed</h2>
          <p className="text-gray-500 mt-2">Registration is currently not accepting new submissions.</p>
        </div>
      </StudentLayout>
    );
  }

  if (submitted) {
    return (
      <StudentLayout>
        <div className="card text-center py-12">
          <FiCheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Registration Complete!</h2>
          <p className="text-gray-500 mt-2">{settings.successMessage}</p>
          {editToken && settings.allowStudentEdits && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg max-w-md mx-auto">
              <p className="text-sm text-blue-700 font-medium flex items-center justify-center">
                <FiEdit className="mr-2" /> You can edit your submission using this link:
              </p>
              <p className="text-xs text-blue-600 mt-2 break-all">
                {window.location.origin}/edit/{editToken}
              </p>
              <p className="text-xs text-gray-500 mt-2">Please save this link — it cannot be recovered.</p>
            </div>
          )}
          <button onClick={() => { setSubmitted(false); setFormData({}); setEditToken(null); }} className="btn-secondary mt-6">
            Submit Another
          </button>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="card">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">{settings.formTitle}</h1>
          {settings.formDescription && <p className="text-gray-500 mt-2">{settings.formDescription}</p>}
        </div>

        {fields.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No form fields have been configured yet.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {fields.map(field => (
              <DynamicField
                key={field._id}
                field={field}
                value={formData[field.name]}
                onChange={handleChange}
                error={errors[field.name]}
              />
            ))}
            <div className="pt-4">
              <button type="submit" disabled={submitting} className="btn-primary w-full flex items-center justify-center">
                <FiSend className="mr-2" /> {submitting ? 'Submitting...' : 'Submit Registration'}
              </button>
            </div>
          </form>
        )}
      </div>
    </StudentLayout>
  );
}
