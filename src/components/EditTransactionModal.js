import React, { useState, useEffect } from 'react';
import { X, Edit3, Clock } from 'lucide-react';
import API from '../services/api';

const CATEGORIES = {
  income: ['Salary', 'Business', 'Investment', 'Freelance', 'Other'],
  expense: ['Food', 'Fuel', 'Movie', 'Medical', 'Loan', 'Shopping', 'Travel', 'Utilities', 'Other']
};

export default function EditTransactionModal({ isOpen, onClose, transaction, onSuccess }) {
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '',
    division: 'personal',
    description: '',
    date: ''
  });
  const [loading, setLoading] = useState(false);
  const [canEdit, setCanEdit] = useState(true);

  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type,
        amount: transaction.amount.toString(),
        category: transaction.category,
        division: transaction.division,
        description: transaction.description || '',
        date: new Date(transaction.createdAt).toISOString().split('T')[0]
      });

      // Check if transaction can be edited (within 12 hours)
      const transactionTime = new Date(transaction.createdAt);
      const now = new Date();
      const hoursDiff = (now - transactionTime) / (1000 * 60 * 60);
      setCanEdit(hoursDiff <= 12);
    }
  }, [transaction]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Confirmation popup
    const confirmMessage = `Are you sure you want to update this transaction?\n\nAmount: ₹${formData.amount}\nCategory: ${formData.category}`;
    if (!window.confirm(confirmMessage)) {
      return;
    }
    
    setLoading(true);

    try {
      await API.put(`/api/transactions/${transaction._id}`, {
        ...formData,
        amount: parseFloat(formData.amount)
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating transaction:', error);
      alert('Failed to update transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !transaction) return null;

  const hoursLeft = canEdit ? Math.max(0, 12 - Math.floor((new Date() - new Date(transaction.createdAt)) / (1000 * 60 * 60))) : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center">
            <Edit3 className="h-5 w-5 mr-2" />
            Edit Transaction
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Edit Time Warning */}
        {!canEdit ? (
          <div className="p-4 bg-red-50 border-l-4 border-red-400">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-red-700 text-sm">
                This transaction cannot be edited as it's older than 12 hours.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-yellow-400 mr-2" />
              <p className="text-yellow-700 text-sm">
                You have {hoursLeft} hours left to edit this transaction.
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount *
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              required
              min="0"
              step="0.01"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              required
            >
              <option value="">Select category</option>
              {CATEGORIES[formData.type].map(category => (
                <option key={category} value={category.toLowerCase()}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Division */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Division *
            </label>
            <select
              name="division"
              value={formData.division}
              onChange={handleInputChange}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              required
            >
              <option value="personal">Personal</option>
              <option value="office">Office</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            {canEdit && (
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}