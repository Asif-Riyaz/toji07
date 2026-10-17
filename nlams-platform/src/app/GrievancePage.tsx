import React from 'react';
import GrievanceForm from '../modules/grievances/GrievanceForm';

const GrievancePage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-navy-900">Grievance Redressal & Legal Tracking</h1>
      <GrievanceForm />
    </div>
  );
};

export default GrievancePage;
