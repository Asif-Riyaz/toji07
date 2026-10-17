import React from 'react';
import ParcelMapCanvas from '../modules/registry/ParcelMapCanvas';

const RegistryPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Digital Cadastral Registry</h1>
      <ParcelMapCanvas />
    </div>
  );
};

export default RegistryPage;
