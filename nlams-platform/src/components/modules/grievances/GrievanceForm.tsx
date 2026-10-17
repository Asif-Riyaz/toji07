import React, { useState } from 'react';

const GrievanceForm: React.FC = () => {
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting grievance:", description);
    // In real app, call a Server Action to save to db
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
      <h2 className="text-xl font-bold mb-4 text-navy-900">Submit New Grievance</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          placeholder="Describe your issue..."
          rows={4}
        />
        <button type="submit" className="bg-coral-600 text-white px-4 py-2 rounded hover:bg-coral-700">Submit</button>
      </form>
    </div>
  );
};

export default GrievanceForm;
