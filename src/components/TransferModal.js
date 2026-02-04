import React, { useState, useEffect } from 'react';
import { X, ArrowRightLeft } from 'lucide-react';
import API from '../services/api';

export default function TransferModal({ isOpen, onClose, onTransferCompleted }) {
  const [accounts, setAccounts] = useState([]);
  const [formData, setFormData] = useState({
    fromAccount: '',
    toAccount: '',
    amount: ''
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
    } catch (error) {
      console.error('Error fetching accounts:', error);
      const defaultAccounts = [
        { name: 'Cash', balance: 10000 },
        { name: 'Bank', balance: 25000 },
        { name: 'UPI', balance: 5000 }
      ];
      setAccounts(defaultAccounts);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.fromAccount === formData.toAccount) {
      alert('From and To accounts cannot be the same');
      return;
    }

    const fromAccountData = accounts.find(acc => acc.name === formData.fromAccount);
    if (fromAccountData && parseFloat(formData.amount) > fromAccountData.balance) {
      alert('Insufficient balance in source account');
      return;
    }

    // Confirmation popup
    const confirmMessage = `Are you sure you want to transfer money?\n\nFrom: ${formData.fromAccount}\nTo: ${formData.toAccount}\nAmount: ₹${formData.amount}`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setLoading(true);

    try {
      // Backend expects account IDs, not names
      const fromAccount = accounts.find(acc => acc.name === formData.fromAccount);
      const toAccount = accounts.find(acc => acc.name === formData.toAccount);
      
      await API.post('/api/accounts/transfer', {
        fromAccountId: fromAccount._id,
        toAccountId: toAccount._id,
        amount: parseFloat(formData.amount)
      });
      
      setFormData({
        fromAccount: '',
        toAccount: '',
        amount: ''
      });
      
      onTransferCompleted();
    } catch (error) {
      console.error('Error transferring money:', error);
      alert('Failed to transfer money. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const fromAccountData = accounts.find(acc => acc.name === formData.fromAccount);
  const toAccountData = accounts.find(acc => acc.name === formData.toAccount);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center">
            <ArrowRightLeft className="h-5 w-5 mr-2 text-blue-600" />
            Transfer Money
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Account *
            </label>
            <select
              name="fromAccount"
              value={formData.fromAccount}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select source account</option>
              {accounts.map(account => (
                <option key={account.name} value={account.name}>
                  {account.name} (₹{account.balance?.toLocaleString() || 0})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Account *
            </label>
            <select
              name="toAccount"
              value={formData.toAccount}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select destination account</option>
              {accounts
                .filter(account => account.name !== formData.fromAccount)
                .map(account => (
                  <option key={account.name} value={account.name}>
                    {account.name} (₹{account.balance?.toLocaleString() || 0})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount *
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="Enter amount to transfer"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              min="0"
              step="0.01"
              max={fromAccountData?.balance || 0}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.fromAccount || !formData.toAccount || !formData.amount}
              className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Transferring...' : 'Transfer Money'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}