import React, { useState } from 'react';

const CompensationCalculator: React.FC = () => {
  const [marketRate, setMarketRate] = useState(1000);
  const [area, setArea] = useState(100);
  const [result, setResult] = useState<{ baseValue: number; solatium: number; total: number } | null>(null);

  const handleCalculate = async () => {
    // In real app, call the Server Action
    const baseValue = marketRate * area;
    const solatium = baseValue * 0.20;
    setResult({ baseValue, solatium, total: baseValue + solatium });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
      <h2 className="text-xl font-bold mb-4 text-navy-900">Compensation Calculator</h2>
      <div className="grid grid-cols-2 gap-4">
        <input type="number" placeholder="Market Rate" value={marketRate} onChange={(e) => setMarketRate(Number(e.target.value))} className="p-2 border rounded" />
        <input type="number" placeholder="Area (sqm)" value={area} onChange={(e) => setArea(Number(e.target.value))} className="p-2 border rounded" />
      </div>
      <button onClick={handleCalculate} className="mt-4 bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700">Calculate</button>

      {result && (
        <div className="mt-4 p-4 bg-slate-50 rounded text-navy-900">
          <p>Base Value: {result.baseValue}</p>
          <p>Solatium: {result.solatium}</p>
          <p className="font-bold">Total: {result.total}</p>
        </div>
      )}
    </div>
  );
};

export default CompensationCalculator;
