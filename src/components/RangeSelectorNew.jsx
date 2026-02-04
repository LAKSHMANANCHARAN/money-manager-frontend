import React from 'react';
import { Calendar } from 'lucide-react';

export default function RangeSelector({ range, setRange }) {
  const ranges = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  return (
    <div className="flex items-center space-x-2">
      <Calendar className="h-5 w-5 text-gray-500" />
      <select
        value={range}
        onChange={(e) => setRange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        {ranges.map(r => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
    </div>
  );
}