import React from 'react';
import CompensationCalculator from '../modules/calculator/CompensationCalculator';

const CompensationPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-navy-900">Compensation & Disbursement</h1>
      <CompensationCalculator />
    </div>
  );
};

export default CompensationPage;
