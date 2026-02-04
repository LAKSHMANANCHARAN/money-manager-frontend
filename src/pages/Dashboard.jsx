import { useEffect, useState, useCallback } from "react";
import { useAppContext } from '../App';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Calendar, Activity, Target, Clock } from 'lucide-react';

import API from '../services/api';
import TransactionList from '../components/TransactionList';
import CategoryPieChart from '../components/CategoryPieChart';

export default function Dashboard() {
  const { refreshTrigger } = useAppContext();
  const [range, setRange] = useState('monthly');
  const [summary, setSummary] = useState({ income: 0, expense: 0 });
  const [transactions, setTransactions] = useState([]);
  const [categorySummary, setCategorySummary] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const summaryResponse = await API.get(`/api/transactions/summary?range=${range}`);
      
      setSummary({
        income: summaryResponse.data.income || 0,
        expense: summaryResponse.data.expense || 0
      });

      const transactionsResponse = await API.get(`/api/transactions?range=${range}`);
      setTransactions(transactionsResponse.data);

      const categoryResponse = await API.get(`/api/transactions/categories/summary?range=${range}`);
      setCategorySummary(categoryResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Show empty data when API fails
      setSummary({ income: 0, expense: 0 });
      setTransactions([]);
      setCategorySummary([]);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchDashboardData();
  }, [refreshTrigger, fetchDashboardData]);

  const getRangeLabel = () => {
    switch(range) {
      case 'daily': return 'Today';
      case 'weekly': return 'This Week';
      case 'monthly': return 'This Month';
      case 'yearly': return 'This Year';
      default: return 'This Month';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const savingsRate = summary.income > 0 ? ((summary.income - summary.expense) / summary.income) * 100 : 0;
  const netBalance = summary.income - summary.expense;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white rounded-3xl shadow-2xl p-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-6 lg:space-y-0">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <BarChart3 className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Financial Dashboard</h1>
                <p className="text-blue-100 text-lg">{getRangeLabel()} - Complete Financial Overview</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-2xl p-3">
              <Calendar className="h-5 w-5" />
              <select
                value={range}
                onChange={(e) => setRange(e.target.value)}
                className="bg-transparent text-white border-none outline-none cursor-pointer font-medium"
              >
                <option value="daily" className="text-gray-800">Daily</option>
                <option value="weekly" className="text-gray-800">Weekly</option>
                <option value="monthly" className="text-gray-800">Monthly</option>
                <option value="yearly" className="text-gray-800">Yearly</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Income</p>
              <p className="text-3xl font-bold text-green-600 mt-2">₹{summary.income.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-2xl">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Expense</p>
              <p className="text-3xl font-bold text-red-600 mt-2">₹{summary.expense.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-2xl">
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Net Balance</p>
              <p className={`text-3xl font-bold mt-2 ${
                netBalance >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>₹{netBalance.toLocaleString()}</p>
            </div>
            <div className={`p-3 rounded-2xl ${
              netBalance >= 0 ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <DollarSign className={`h-8 w-8 ${
                netBalance >= 0 ? 'text-green-600' : 'text-red-600'
              }`} />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Savings Rate</p>
              <p className={`text-3xl font-bold mt-2 ${
                savingsRate >= 20 ? 'text-green-600' : savingsRate >= 10 ? 'text-yellow-600' : 'text-red-600'
              }`}>{savingsRate.toFixed(1)}%</p>
            </div>
            <div className={`p-3 rounded-2xl ${
              savingsRate >= 20 ? 'bg-green-100' : savingsRate >= 10 ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              <Target className={`h-8 w-8 ${
                savingsRate >= 20 ? 'text-green-600' : savingsRate >= 10 ? 'text-yellow-600' : 'text-red-600'
              }`} />
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Category Pie Chart */}
        <div className="xl:col-span-2">
          <CategoryPieChart data={categorySummary} />
        </div>
        
        {/* Quick Stats */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center mb-6">
            <Activity className="h-6 w-6 text-blue-600 mr-3" />
            <h3 className="text-2xl font-bold text-gray-800">Quick Stats</h3>
          </div>
          
          <div className="space-y-6">
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <span className="font-medium text-gray-700">Total Transactions</span>
              </div>
              <span className="text-xl font-bold text-blue-600">{transactions.length}</span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <span className="font-medium text-gray-700">Avg Transaction</span>
              </div>
              <span className="text-xl font-bold text-green-600">
                ₹{transactions.length > 0 ? Math.round((summary.income + summary.expense) / transactions.length).toLocaleString() : 0}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                </div>
                <span className="font-medium text-gray-700">Largest Expense</span>
              </div>
              <span className="text-xl font-bold text-red-600">
                ₹{Math.max(...transactions.filter(t => t.type === 'expense').map(t => t.amount), 0).toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                </div>
                <span className="font-medium text-gray-700">Largest Income</span>
              </div>
              <span className="text-xl font-bold text-purple-600">
                ₹{Math.max(...transactions.filter(t => t.type === 'income').map(t => t.amount), 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="mt-8">
        <TransactionList transactions={transactions} />
      </div>
    </div>
  );
}