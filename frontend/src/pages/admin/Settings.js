import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/common/Layout';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FiSave } from 'react-icons/fi';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    formTitle: '', formDescription: '', registrationEnabled: true,
    allowStudentEdits: false, successMessage: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/settings');
        setSettings(res.data);
      } catch (err) {
        toast.error('Failed to load settings');
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/settings', settings);
      setSettings(res.data);
      toast.success('Settings saved');
    } catch (err) {
      toast.error('Failed to save settings');
    }
    setSaving(false);
  };

  if (loading) return <AdminLayout><div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Form Settings</h1>
        <p className="text-gray-500 mt-1">Configure registration form behavior</p>
      </div>

      <form onSubmit={handleSave} className="max-w-2xl space-y-6">
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold">General</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Form Title</label>
            <input className="input-field" value={settings.formTitle} onChange={e => setSettings(s => ({ ...s, formTitle: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Form Description</label>
            <textarea className="input-field" rows={3} value={settings.formDescription} onChange={e => setSettings(s => ({ ...s, formDescription: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Success Message</label>
            <input className="input-field" value={settings.successMessage} onChange={e => setSettings(s => ({ ...s, successMessage: e.target.value }))} />
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="text-lg font-semibold">Access Control</h2>
          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
            <div>
              <p className="font-medium text-gray-900">Enable Registration</p>
              <p className="text-sm text-gray-500">Allow students to submit the registration form</p>
            </div>
            <div className="relative">
              <input type="checkbox" checked={settings.registrationEnabled} onChange={e => setSettings(s => ({ ...s, registrationEnabled: e.target.checked }))} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-300 peer-checked:bg-primary-600 rounded-full transition-colors"></div>
              <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow"></div>
            </div>
          </label>
          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
            <div>
              <p className="font-medium text-gray-900">Allow Student Edits</p>
              <p className="text-sm text-gray-500">Students can edit their submission after registering</p>
            </div>
            <div className="relative">
              <input type="checkbox" checked={settings.allowStudentEdits} onChange={e => setSettings(s => ({ ...s, allowStudentEdits: e.target.checked }))} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-300 peer-checked:bg-primary-600 rounded-full transition-colors"></div>
              <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow"></div>
            </div>
          </label>
        </div>

        <button type="submit" disabled={saving} className="btn-primary flex items-center">
          <FiSave className="mr-2" /> {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </AdminLayout>
  );
}
