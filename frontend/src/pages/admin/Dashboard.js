import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../components/common/Layout';
import api from '../../utils/api';
import { FiLayout, FiUsers, FiSettings, FiCheckCircle, FiXCircle } from 'react-icons/fi';

export default function Dashboard() {
  const [stats, setStats] = useState({ fields: 0, submissions: 0, settings: null });

  useEffect(() => {
    const load = async () => {
      try {
        const [fieldsRes, subsRes, settingsRes] = await Promise.all([
          api.get('/form/fields/all'),
          api.get('/submissions?limit=1'),
          api.get('/settings')
        ]);
        setStats({
          fields: fieldsRes.data.length,
          submissions: subsRes.data.pagination.total,
          settings: settingsRes.data
        });
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  const cards = [
    { title: 'Form Fields', value: stats.fields, icon: FiLayout, color: 'bg-blue-500', link: '/admin/form-builder' },
    { title: 'Submissions', value: stats.submissions, icon: FiUsers, color: 'bg-green-500', link: '/admin/submissions' },
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your registration system</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {cards.map(card => (
          <Link key={card.title} to={card.link} className="card hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className={`${card.color} rounded-lg p-3 mr-4`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          </Link>
        ))}

        {stats.settings && (
          <div className="card">
            <div className="flex items-center">
              <div className="bg-purple-500 rounded-lg p-3 mr-4">
                <FiSettings className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Registration</p>
                <div className="flex items-center mt-1">
                  {stats.settings.registrationEnabled ? (
                    <><FiCheckCircle className="h-5 w-5 text-green-500 mr-1" /><span className="font-medium text-green-600">Open</span></>
                  ) : (
                    <><FiXCircle className="h-5 w-5 text-red-500 mr-1" /><span className="font-medium text-red-600">Closed</span></>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {stats.settings && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Quick Info</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-500">Form Title:</span> <span className="font-medium ml-2">{stats.settings.formTitle}</span></div>
            <div><span className="text-gray-500">Student Edits:</span> <span className={`font-medium ml-2 ${stats.settings.allowStudentEdits ? 'text-green-600' : 'text-gray-600'}`}>{stats.settings.allowStudentEdits ? 'Allowed' : 'Not Allowed'}</span></div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
