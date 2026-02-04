import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { PieChart as PieChartIcon, TrendingDown } from 'lucide-react';

const COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Yellow
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#F97316", // Orange
  "#06B6D4", // Cyan
  "#84CC16", // Lime
  "#EC4899", // Pink
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-xl border border-gray-200">
        <p className="font-semibold text-gray-800 capitalize">{`${payload[0].name}`}</p>
        <p className="text-blue-600 font-bold">
          {`Amount: ₹${payload[0].value.toLocaleString()}`}
        </p>
        <p className="text-gray-600 text-sm">
          {`${((payload[0].value / payload[0].payload.total) * 100).toFixed(1)}% of total`}
        </p>
      </div>
    );
  }
  return null;
};

const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null; // Hide labels for slices less than 5%
  
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      className="font-bold text-sm drop-shadow-lg"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function CategoryPieChart({ data }) {
  const [activeIndex, setActiveIndex] = useState(-1);
  
  if (!data || data.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
        <div className="text-center">
          <PieChartIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <div className="text-lg font-medium text-gray-500 mb-2">No Data Available</div>
          <div className="text-sm text-gray-400">Add some transactions to see the breakdown</div>
        </div>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.totalAmount, 0);
  const chartData = data.map(item => ({
    ...item,
    total,
    name: item._id,
    value: item.totalAmount
  }));

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(-1);
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 animate-slideUp">
      <div className="flex items-center mb-6">
        <TrendingDown className="h-6 w-6 text-red-600 mr-3" />
        <h2 className="text-2xl font-bold text-gray-800">
          Category Breakdown
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <div className="relative">
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                labelLine={false}
                label={CustomLabel}
                outerRadius={120}
                innerRadius={40}
                paddingAngle={2}
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
                animationBegin={0}
                animationDuration={800}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    stroke={activeIndex === index ? "#fff" : "none"}
                    strokeWidth={activeIndex === index ? 3 : 0}
                    style={{
                      filter: activeIndex === index ? 'brightness(1.1)' : 'none',
                      transform: activeIndex === index ? 'scale(1.05)' : 'scale(1)',
                      transformOrigin: 'center',
                      transition: 'all 0.2s ease-in-out'
                    }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Center Total */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">₹{total.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Total Spent</div>
            </div>
          </div>
        </div>

        {/* Legend & Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Category Details</h3>
          {chartData.map((entry, index) => {
            const percentage = ((entry.value / total) * 100).toFixed(1);
            return (
              <div 
                key={entry.name}
                className={`flex items-center justify-between p-4 rounded-xl transition-all duration-200 cursor-pointer ${
                  activeIndex === index 
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md transform scale-105' 
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(-1)}
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full shadow-sm"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="font-medium text-gray-800 capitalize">{entry.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-800">₹{entry.value.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">{percentage}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
