import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import RegistryPage from './RegistryPage';
import CompensationPage from './CompensationPage';
import GrievancePage from './GrievancePage';
import ExecutiveDashboard from './components/modules/dashboard/ExecutiveDashboard';

// Simple Router implementation for layout demo
const App: React.FC = () => {
  const [activePage, setActivePage] = React.useState('dashboard');

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <ExecutiveDashboard />;
      case 'registry': return <RegistryPage />;
      case 'compensation': return <CompensationPage />;
      case 'grievance': return <GrievancePage />;
      default: return <ExecutiveDashboard />;
    }
  };

  const navItemClass = (page: string) =>
    `cursor-pointer hover:text-emerald-600 ${activePage === page ? 'text-emerald-500 font-bold' : ''}`;

  return (
    <DashboardLayout>
      {/* Navigation for demo purposes */}
      <div className="mb-6 flex space-x-4 border-b pb-4">
        <button onClick={() => setActivePage('dashboard')} className={navItemClass('dashboard')}>Dashboard</button>
        <button onClick={() => setActivePage('registry')} className={navItemClass('registry')}>Registry</button>
        <button onClick={() => setActivePage('compensation')} className={navItemClass('compensation')}>Compensation</button>
        <button onClick={() => setActivePage('grievance')} className={navItemClass('grievance')}>Grievance</button>
      </div>
      {renderPage()}
    </DashboardLayout>
  );
};

export default App;
