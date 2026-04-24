import React, { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '../../components/common/Layout';
import FieldEditor from '../../components/admin/FieldEditor';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiChevronUp, FiChevronDown, FiEye, FiEyeOff } from 'react-icons/fi';

const TYPE_BADGES = {
  text: 'bg-blue-100 text-blue-700',
  email: 'bg-green-100 text-green-700',
  number: 'bg-yellow-100 text-yellow-700',
  textarea: 'bg-indigo-100 text-indigo-700',
  dropdown: 'bg-purple-100 text-purple-700',
  radio: 'bg-pink-100 text-pink-700',
  checkbox: 'bg-orange-100 text-orange-700',
  date: 'bg-teal-100 text-teal-700',
};

export default function FormBuilder() {
  const [fields, setFields] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadFields = useCallback(async () => {
    try {
      const res = await api.get('/form/fields/all');
      setFields(res.data);
    } catch (err) {
      toast.error('Failed to load fields');
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadFields(); }, [loadFields]);

  const handleSave = async (data) => {
    try {
      if (editing) {
        await api.put(`/form/fields/${editing._id}`, data);
        toast.success('Field updated');
      } else {
        await api.post('/form/fields', data);
        toast.success('Field created');
      }
      setShowEditor(false);
      setEditing(null);
      loadFields();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving field');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this field? This cannot be undone.')) return;
    try {
      await api.delete(`/form/fields/${id}`);
      toast.success('Field deleted');
      loadFields();
    } catch (err) {
      toast.error('Failed to delete field');
    }
  };

  const handleReorder = async (index, direction) => {
    const sorted = [...fields].sort((a, b) => a.order - b.order);
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= sorted.length) return;
    const temp = sorted[index].order;
    sorted[index].order = sorted[newIndex].order;
    sorted[newIndex].order = temp;

    const fieldOrders = sorted.map(f => ({ id: f._id, order: f.order }));
    try {
      const res = await api.put('/form/fields/reorder', { fieldOrders });
      setFields(res.data);
    } catch (err) {
      toast.error('Failed to reorder');
    }
  };

  const handleToggleActive = async (field) => {
    try {
      await api.put(`/form/fields/${field._id}`, { active: !field.active });
      loadFields();
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  if (loading) return <AdminLayout><div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div></AdminLayout>;

  const sorted = [...fields].sort((a, b) => a.order - b.order);

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Form Builder</h1>
          <p className="text-gray-500 mt-1">Manage registration form fields</p>
        </div>
        <button onClick={() => { setEditing(null); setShowEditor(true); }} className="btn-primary flex items-center">
          <FiPlus className="mr-2" /> Add Field
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="card text-center py-12">
          <FiLayout className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No fields yet</h3>
          <p className="text-gray-500 mt-1">Start building your form by adding fields</p>
          <button onClick={() => { setEditing(null); setShowEditor(true); }} className="btn-primary mt-4">
            <FiPlus className="inline mr-2" /> Add First Field
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((field, index) => (
            <div key={field._id} className={`card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${!field.active ? 'opacity-60' : ''}`}>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex flex-col">
                  <button onClick={() => handleReorder(index, -1)} disabled={index === 0} className="text-gray-400 hover:text-gray-600 disabled:opacity-30"><FiChevronUp className="h-4 w-4" /></button>
                  <button onClick={() => handleReorder(index, 1)} disabled={index === sorted.length - 1} className="text-gray-400 hover:text-gray-600 disabled:opacity-30"><FiChevronDown className="h-4 w-4" /></button>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-900">{field.label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_BADGES[field.type] || 'bg-gray-100 text-gray-700'}`}>{field.type}</span>
                    {field.required && <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">required</span>}
                    {!field.active && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">inactive</span>}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">name: {field.name}{field.options?.length > 0 ? ` · options: ${field.options.join(', ')}` : ''}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={() => handleToggleActive(field)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100" title={field.active ? 'Deactivate' : 'Activate'}>
                  {field.active ? <FiEye className="h-4 w-4" /> : <FiEyeOff className="h-4 w-4" />}
                </button>
                <button onClick={() => { setEditing(field); setShowEditor(true); }} className="p-2 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-primary-50" title="Edit">
                  <FiEdit2 className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(field._id)} className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50" title="Delete">
                  <FiTrash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showEditor && (
        <FieldEditor
          field={editing}
          onSave={handleSave}
          onClose={() => { setShowEditor(false); setEditing(null); }}
        />
      )}
    </AdminLayout>
  );
}
