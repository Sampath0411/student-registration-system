import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiHome, FiSettings, FiList, FiLayout, FiLogOut, FiUser } from 'react-icons/fi';

export function AdminLayout({ children }) {
  const { admin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: FiHome },
    { path: '/admin/form-builder', label: 'Form Builder', icon: FiLayout },
    { path: '/admin/submissions', label: 'Submissions', icon: FiList },
    { path: '/admin/settings', label: 'Settings', icon: FiSettings },
  ];

  const handleLogout = () => { logout(); navigate('/admin/login'); };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 fixed w-full z-30 top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/admin/dashboard" className="text-xl font-bold text-primary-600">
                StudentReg
              </Link>
              <div className="hidden md:flex ml-10 space-x-1">
                {navItems.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === item.path
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="mr-1.5 h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 hidden sm:block">
                <FiUser className="inline mr-1" />{admin?.name || admin?.email}
              </span>
              <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 transition-colors" title="Logout">
                <FiLogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        {/* Mobile nav */}
        <div className="md:hidden border-t border-gray-200 px-2 py-2 flex space-x-1 overflow-x-auto">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                location.pathname === item.path
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600'
              }`}
            >
              <item.icon className="mr-1 h-3.5 w-3.5" />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
      <main className="pt-24 md:pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}

export function StudentLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50">
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-primary-600">StudentReg</Link>
          <Link to="/admin/login" className="text-sm text-gray-500 hover:text-primary-600">Admin</Link>
        </div>
      </nav>
      <main className="max-w-3xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
