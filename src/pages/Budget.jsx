import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../App';
import { Target, Plus, TrendingUp, AlertTriangle, X, Trash2, Bell } from 'lucide-react';
import API from '../services/api';

export default function Budget() {
  const { refreshTrigger } = useAppContext();
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isAddBudgetModalOpen, setIsAddBudgetModalOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [newBudget, setNewBudget] = useState({
    category: '',
    amount: '',
    period: 'monthly'
  });
  const [loading, setLoading] = useState(true);

  const CATEGORIES = ['food', 'fuel', 'movie', 'medical', 'loan', 'shopping', 'travel', 'utilities', 'other'];

  const calculateSpent = useCallback((category, period, transactionData = transactions) => {
    const now = new Date();
    let startDate = new Date();
    
    if (period === 'monthly') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'weekly') {
      startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    }

    return transactionData
      .filter(t => {
        const transactionDate = new Date(t.createdAt);
        return t.type === 'expense' && 
               t.category === category &&
               transactionDate >= startDate &&
               transactionDate <= now;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const transactionsResponse = await API.get('/api/transactions');
      setTransactions(transactionsResponse.data);
      
      const budgetsResponse = await API.get('/api/budgets');
      setBudgets(budgetsResponse.data);
      
      setAlerts([]);
    } catch (error) {
      console.error('Error fetching data:', error);
      setTransactions([]);
      setBudgets([]);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [refreshTrigger, fetchData]);

  const getBudgetStatus = useCallback((budget) => {
    const spent = calculateSpent(budget.category, budget.period);
    const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
    
    if (percentage >= 100) return { status: 'exceeded', color: 'red' };
    if (percentage >= 80) return { status: 'warning', color: 'yellow' };
    return { status: 'good', color: 'green' };
  }, [calculateSpent]);

  const handleAddBudget = async (e) => {
    e.preventDefault();
    
    const confirmMessage = `Are you sure you want to add this budget?\n\nCategory: ${newBudget.category}\nAmount: ₹${newBudget.amount}\nPeriod: ${newBudget.period}`;
    if (!window.confirm(confirmMessage)) {
      return;
    }
    
    try {
      await API.post('/api/budgets', {
        category: newBudget.category,
        amount: parseFloat(newBudget.amount),
        period: newBudget.period
      });
      
      setNewBudget({ category: '', amount: '', period: 'monthly' });
      setIsAddBudgetModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error adding budget:', error);
      alert('Failed to add budget. Please try again.');
    }
  };

  const handleDeleteBudget = async (budgetId, budgetCategory) => {
    const confirmMessage = `Are you sure you want to delete the budget for "${budgetCategory}"?\n\nThis action cannot be undone.`;
    if (window.confirm(confirmMessage)) {
      try {
        await API.delete(`/api/budgets/${budgetId}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting budget:', error);
        alert('Failed to delete budget. Please try again.');
      }
    }
  };

  const dismissAlert = (alertId) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + calculateSpent(budget.category, budget.period), 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 space-y-6">
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 text-white rounded-2xl shadow-xl p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Target className="h-10 w-10 mr-4" />
              Budget Planning
            </h1>
            <p className="text-purple-100 mt-2 text-lg">Track your spending against planned budgets</p>
          </div>
          <button
            onClick={() => setIsAddBudgetModalOpen(true)}
            className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-white/30 transition-all duration-200 shadow-lg"
          >
            <Plus className="h-5 w-5" />
            <span className="font-medium">Add Budget</span>
          </button>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center mb-4">
            <Bell className="h-6 w-6 text-red-600 mr-3" />
            <h3 className="text-lg font-bold text-red-800">Budget Alerts</h3>
          </div>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between bg-white/60 backdrop-blur-sm p-4 rounded-xl">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <span className="text-red-800 font-medium">{alert.message}</span>
                </div>
                <button
                  onClick={() => dismissAlert(alert.id)}
                  className="text-red-400 hover:text-red-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/20">
          <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wide">Total Budget</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            ₹ {totalBudget.toLocaleString()}
          </p>
        </div>
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/20">
          <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wide">Total Spent</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">
            ₹ {totalSpent.toLocaleString()}
          </p>
        </div>
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/20">
          <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wide">Remaining</h3>
          <p className={`text-3xl font-bold mt-2 ${
            totalBudget - totalSpent >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            ₹ {(totalBudget - totalSpent).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
        <div className="p-8 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Budget Categories</h2>
          <p className="text-gray-600 text-lg mt-1">Monitor your spending by category</p>
        </div>
        <div className="p-8">
          {budgets.length > 0 ? (
            <div className="space-y-4">
              {budgets.map((budget) => {
                const spent = calculateSpent(budget.category, budget.period);
                const percentage = budget.amount > 0 ? Math.min((spent / budget.amount) * 100, 100) : 0;
                const status = getBudgetStatus(budget);

                return (
                  <div key={budget._id} className="bg-gradient-to-r from-white via-gray-50 to-white border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className={`w-4 h-4 rounded-full shadow-sm ${
                          status.status === 'exceeded' ? 'bg-red-500' :
                          status.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}></div>
                        <h3 className="font-bold text-xl text-gray-800 capitalize">{budget.category}</h3>
                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">{budget.period}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-600 font-medium">
                            ₹{spent.toLocaleString()} / ₹{budget.amount.toLocaleString()}
                          </p>
                          <p className={`text-lg font-bold ${
                            status.status === 'exceeded' ? 'text-red-600' :
                            status.status === 'warning' ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {percentage.toFixed(1)}% used
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteBudget(budget._id, budget.category)}
                          className="text-red-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-all"
                          title="Delete Budget"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ease-out shadow-sm ${
                          status.status === 'exceeded' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                          status.status === 'warning' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 'bg-gradient-to-r from-green-500 to-green-600'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                    {percentage > 100 && (
                      <div className="mt-2 text-sm text-red-600 font-bold bg-red-50 px-3 py-1 rounded-full inline-block">
                        Over budget by ₹{(spent - budget.amount).toLocaleString()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <div className="text-lg font-medium text-gray-500 mb-2">No budgets set</div>
              <div className="text-sm text-gray-400">Create your first budget to start tracking</div>
            </div>
          )}
        </div>
      </div>

      {isAddBudgetModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">Add New Budget</h2>
              <button
                onClick={() => setIsAddBudgetModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleAddBudget} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={newBudget.category}
                  onChange={(e) => setNewBudget(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map(category => (
                    <option key={category} value={category} className="capitalize">
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget Amount *
                </label>
                <input
                  type="number"
                  value={newBudget.amount}
                  onChange={(e) => setNewBudget(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="Enter budget amount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Period *
                </label>
                <select
                  value={newBudget.period}
                  onChange={(e) => setNewBudget(prev => ({ ...prev, period: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddBudgetModalOpen(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors"
                >
                  Add Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}