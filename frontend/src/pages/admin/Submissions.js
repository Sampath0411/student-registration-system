import React, { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '../../components/common/Layout';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FiSearch, FiDownload, FiTrash2, FiEdit2, FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';

export default function Submissions() {
  const [submissions, setSubmissions] = useState([]);
  const [fields, setFields] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingSub, setEditingSub] = useState(null);
  const [editData, setEditData] = useState({});

  const loadData = useCallback(async (page = 1, searchQuery = '') => {
    setLoading(true);
    try {
      const [subsRes, fieldsRes] = await Promise.all([
        api.get(`/submissions?page=${page}&limit=15&search=${searchQuery}`),
        api.get('/form/fields/all')
      ]);
      setSubmissions(subsRes.data.submissions);
      setPagination(subsRes.data.pagination);
      setFields(fieldsRes.data.sort((a, b) => a.order - b.order));
    } catch (err) {
      toast.error('Failed to load data');
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadData(1, search);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this submission?')) return;
    try {
      await api.delete(`/submissions/${id}`);
      toast.success('Submission deleted');
      loadData(pagination.page, search);
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleEdit = (sub) => {
    setEditingSub(sub);
    setEditData({ ...sub.data });
  };

  const handleSaveEdit = async () => {
    try {
      await api.put(`/submissions/${editingSub._id}`, { data: editData });
      toast.success('Submission updated');
      setEditingSub(null);
      loadData(pagination.page, search);
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  const handleExport = async (format) => {
    try {
      const res = await api.get(`/submissions/export/${format}`, { responseType: 'blob' });
      const ext = format === 'csv' ? 'csv' : 'xlsx';
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `submissions.${ext}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (err) {
      toast.error('Export failed');
    }
  };

  const activeFields = fields.filter(f => f.active);

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Submissions</h1>
          <p className="text-gray-500 mt-1">{pagination.total} total submissions</p>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={() => handleExport('csv')} className="btn-secondary flex items-center text-sm">
            <FiDownload className="mr-1" /> CSV
          </button>
          <button onClick={() => handleExport('excel')} className="btn-secondary flex items-center text-sm">
            <FiDownload className="mr-1" /> Excel
          </button>
        </div>
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input className="input-field pl-10 pr-20" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search submissions..." />
          <button type="submit" className="absolute right-2 top-1.5 btn-primary text-sm py-1 px-3">Search</button>
        </div>
      </form>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>
      ) : submissions.length === 0 ? (
        <div className="card text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">No submissions found</h3>
          <p className="text-gray-500 mt-1">Submissions will appear here once students register</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto card p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">#</th>
                  {activeFields.slice(0, 6).map(f => (
                    <th key={f._id} className="text-left py-3 px-4 font-medium text-gray-600">{f.label}</th>
                  ))}
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub, i) => (
                  <tr key={sub._id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-gray-500">{(pagination.page - 1) * 15 + i + 1}</td>
                    {activeFields.slice(0, 6).map(f => (
                      <td key={f._id} className="py-3 px-4 max-w-[200px] truncate">
                        {Array.isArray(sub.data[f.name]) ? sub.data[f.name].join(', ') : (sub.data[f.name] || '—')}
                      </td>
                    ))}
                    <td className="py-3 px-4 text-gray-500 whitespace-nowrap">{new Date(sub.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end space-x-1">
                        <button onClick={() => handleEdit(sub)} className="p-1.5 text-gray-400 hover:text-primary-600 rounded hover:bg-primary-50"><FiEdit2 className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(sub._id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"><FiTrash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.pages > 1 && (
            <div className="flex justify-center items-center mt-6 space-x-4">
              <button onClick={() => loadData(pagination.page - 1, search)} disabled={pagination.page <= 1} className="btn-secondary disabled:opacity-50">
                <FiChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm text-gray-600">Page {pagination.page} of {pagination.pages}</span>
              <button onClick={() => loadData(pagination.page + 1, search)} disabled={pagination.page >= pagination.pages} className="btn-secondary disabled:opacity-50">
                <FiChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}

      {editingSub && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">Edit Submission</h2>
              <button onClick={() => setEditingSub(null)} className="text-gray-400 hover:text-gray-600"><FiX className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              {activeFields.map(f => (
                <div key={f._id}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                  {f.type === 'dropdown' ? (
                    <select className="input-field" value={editData[f.name] || ''} onChange={e => setEditData(prev => ({ ...prev, [f.name]: e.target.value }))}>
                      <option value="">Select...</option>
                      {(f.options || []).map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input
                      type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : f.type === 'email' ? 'email' : 'text'}
                      className="input-field"
                      value={editData[f.name] || ''}
                      onChange={e => setEditData(prev => ({ ...prev, [f.name]: e.target.value }))}
                    />
                  )}
                </div>
              ))}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button onClick={() => setEditingSub(null)} className="btn-secondary">Cancel</button>
                <button onClick={handleSaveEdit} className="btn-primary">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
