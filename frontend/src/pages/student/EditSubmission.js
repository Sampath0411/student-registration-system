import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { StudentLayout } from '../../components/common/Layout';
import DynamicField from '../../components/form/DynamicField';
import { validateForm } from '../../utils/validate';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiAlertCircle, FiSave } from 'react-icons/fi';

export default function EditSubmission() {
  const { token } = useParams();
  const [fields, setFields] = useState([]);
  const [settings, setSettings] = useState(null);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [fieldsRes, settingsRes, subRes] = await Promise.all([
          api.get('/form/fields'),
          api.get('/settings'),
          api.get(`/submissions/mine/${token}`)
        ]);
        setFields(fieldsRes.data);
        setSettings(settingsRes.data);
        setFormData(subRes.data.data || {});
      } catch (err) {
        if (err.response?.status === 404) setNotFound(true);
        else toast.error('Failed to load submission');
      }
      setLoading(false);
    };
    load();
  }, [token]);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
    }
    setSaved(false);
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
      await api.put(`/submissions/mine/${token}`, formData);
      setSaved(true);
      toast.success('Submission updated!');
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        toast.error(err.response?.data?.message || 'Update failed');
      }
    }
    setSubmitting(false);
  };

  if (loading) return <StudentLayout><div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div></StudentLayout>;

  if (notFound) {
    return (
      <StudentLayout>
        <div className="card text-center py-12">
          <FiAlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Submission Not Found</h2>
          <p className="text-gray-500 mt-2">This edit link is invalid or has expired.</p>
        </div>
      </StudentLayout>
    );
  }

  if (!settings?.allowStudentEdits) {
    return (
      <StudentLayout>
        <div className="card text-center py-12">
          <FiAlertCircle className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Editing Disabled</h2>
          <p className="text-gray-500 mt-2">The administrator has disabled submission editing.</p>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="card">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Edit Your Submission</h1>
          <p className="text-gray-500 mt-2">Update your registration details below</p>
        </div>

        {saved && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
            <FiCheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
            <p className="text-green-700 text-sm">Your changes have been saved successfully!</p>
          </div>
        )}

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
              <FiSave className="mr-2" /> {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </StudentLayout>
  );
}
