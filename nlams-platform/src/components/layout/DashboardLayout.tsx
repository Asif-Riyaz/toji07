import React, { useState } from 'react';
import App from './App.tsx';
import RegistryPage from './app/RegistryPage.tsx';
import CompensationPage from './app/CompensationPage.tsx';

interface LayoutProps {
  children?: React.ReactNode;
}

const DashboardLayout: React.FC<LayoutProps> = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'registry':
        return <RegistryPage />;
      case 'compensation':
        return <CompensationPage />;
      default:
        return <App />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-navy-900 text-white p-4">
        <h1 className="text-xl font-bold mb-8">NLAMS</h1>
        <nav>
          <ul className="space-y-4">
            <li
              className={`cursor-pointer ${currentPage === 'dashboard' ? 'text-emerald-400 font-bold' : 'hover:text-emerald-400'}`}
              onClick={() => setCurrentPage('dashboard')}
            >
              Dashboard
            </li>
            <li
              className={`cursor-pointer ${currentPage === 'registry' ? 'text-emerald-400 font-bold' : 'hover:text-emerald-400'}`}
              onClick={() => setCurrentPage('registry')}
            >
              Registry
            </li>
            <li
              className={`cursor-pointer ${currentPage === 'compensation' ? 'text-emerald-400 font-bold' : 'hover:text-emerald-400'}`}
              onClick={() => setCurrentPage('compensation')}
            >
              Compensation
            </li>
            <li className="cursor-pointer text-gray-500">Legal/Grievances</li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        <header className="bg-white shadow-sm p-4">
          <h2 className="text-lg font-semibold text-navy-900">National Land Acquisition & Management System</h2>
        </header>
        <main className="p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
