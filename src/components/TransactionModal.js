import React, { useState, useEffect } from 'react';
import { X, DollarSign, Minus } from 'lucide-react';
import API from '../services/api';

const CATEGORIES = {
  income: ['Salary', 'Business', 'Investment', 'Freelance', 'Other'],
  expense: ['Food', 'Fuel', 'Movie', 'Medical', 'Loan', 'Shopping', 'Travel', 'Utilities', 'Other']
};

export default function TransactionModal({ isOpen, onClose, onTransactionAdded }) {
  const [activeTab, setActiveTab] = useState('expense');
  const [accounts, setAccounts] = useState([]);
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '',
    division: 'personal',
    description: '',
    account: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAccounts();
    }
  }, [isOpen]);

  const fetchAccounts = async () => {
    try {
      const response = await API.get('/api/accounts');
      setAccounts(response.data);
      if (response.data.length > 0) {
        setFormData(prev => ({ ...prev, account: response.data[0].name }));
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
      const defaultAccounts = [
        { name: 'Cash', balance: 0 },
        { name: 'Bank', balance: 0 },
        { name: 'UPI', balance: 0 }
      ];
      setAccounts(defaultAccounts);
      setFormData(prev => ({ ...prev, account: 'Cash' }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFormData(prev => ({
      ...prev,
      type: tab,
      category: '',
      amount: '',
      description: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Confirmation popup
    const confirmMessage = `Are you sure you want to add this ${activeTab}?\n\nAmount: ₹${formData.amount}\nCategory: ${formData.category}\nAccount: ${formData.account}`;
    if (!window.confirm(confirmMessage)) {
      return;
    }
    
    setLoading(true);

    try {
      if (activeTab === 'expense') {
        const selectedAccount = accounts.find(acc => acc.name === formData.account);
        if (selectedAccount && parseFloat(formData.amount) > selectedAccount.balance) {
          alert('Insufficient balance in selected account');
          setLoading(false);
          return;
        }
      }

      console.log('Adding transaction:', formData); // Debug log
      const response = await API.post('/api/transactions', {
        ...formData,
        amount: parseFloat(formData.amount)
      });
      console.log('Transaction added successfully:', response.data); // Debug log
      
      setFormData({
        type: 'expense',
        amount: '',
        category: '',
        division: 'personal',
        description: '',
        account: accounts.length > 0 ? accounts[0].name : '',
        date: new Date().toISOString().split('T')[0]
      });
      
      console.log('Calling onTransactionAdded...'); // Debug log
      onTransactionAdded();
      onClose();
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Failed to add transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto shadow-2xl transform animate-slideUp">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Add Transaction</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex border-b border-gray-100">
          <button
            onClick={() => handleTabChange('expense')}
            className={`flex-1 py-4 px-4 text-center font-medium transition-all duration-300 ${
              activeTab === 'expense'
                ? 'border-b-2 border-red-500 text-red-600 bg-gradient-to-t from-red-50 to-transparent'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Minus className="h-5 w-5 inline mr-2" />
            Expense
          </button>
          <button
            onClick={() => handleTabChange('income')}
            className={`flex-1 py-4 px-4 text-center font-medium transition-all duration-300 ${
              activeTab === 'income'
                ? 'border-b-2 border-green-500 text-green-600 bg-gradient-to-t from-green-50 to-transparent'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <DollarSign className="h-5 w-5 inline mr-2" />
            Income
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="transform transition-all duration-200 hover:scale-[1.02]">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Amount *
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="Enter amount"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Account *
            </label>
            <select
              name="account"
              value={formData.account}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
              required
            >
              <option value="">Select account</option>
              {accounts.map(account => (
                <option key={account.name} value={account.name}>
                  {account.name} (₹{account.balance?.toLocaleString() || 0})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
              required
            >
              <option value="">Select category</option>
              {CATEGORIES[activeTab].map(category => (
                <option key={category} value={category.toLowerCase()}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Division *
            </label>
            <select
              name="division"
              value={formData.division}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
              required
            >
              <option value="personal">Personal</option>
              <option value="office">Office</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter description"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
              required
            />
          </div>

          <div className="flex space-x-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-6 py-3 text-white rounded-xl transition-all duration-200 font-medium transform hover:scale-105 disabled:hover:scale-100 ${
                activeTab === 'income'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-green-200'
                  : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-red-200'
              } ${loading ? 'opacity-50 cursor-not-allowed' : 'shadow-lg'}`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Adding...
                </div>
              ) : (
                `Add ${activeTab === 'income' ? 'Income' : 'Expense'}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}