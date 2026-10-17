import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const data = [
  { name: 'Survey', value: 400 },
  { name: 'Notification', value: 300 },
  { name: 'Valuation', value: 300 },
  { name: 'Compensation', value: 200 },
  { name: 'Possession', value: 100 },
];

const COLORS = ['#0F172A', '#059669', '#D97706', '#DC2626', '#3B82F6'];

const ExecutiveDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border border-slate-200">
          <p className="text-sm text-slate-500">Total Hectares</p>
          <p className="text-2xl font-bold text-navy-900">12,450</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-slate-200">
          <p className="text-sm text-slate-500">Budget Disbursed</p>
          <p className="text-2xl font-bold text-emerald-600">₹450 Cr</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-slate-200">
          <p className="text-sm text-slate-500">Active Disputes</p>
          <p className="text-2xl font-bold text-coral-600">85</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-slate-200">
          <p className="text-sm text-slate-500">Projects Ongoing</p>
          <p className="text-2xl font-bold text-amber-600">12</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border border-slate-200">
          <h3 className="text-lg font-semibold mb-4 text-navy-900">Acquisition Stage Progress</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#059669" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-slate-200">
          <h3 className="text-lg font-semibold mb-4 text-navy-900">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={data} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;
