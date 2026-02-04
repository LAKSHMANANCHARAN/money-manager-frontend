import React, { useState, useEffect } from 'react';
import { Plus, Wallet, ArrowRightLeft, Edit3, X } from 'lucide-react';
import API from '../services/api';
import TransferModal from '../components/TransferModal';
import { useAppContext } from '../App';

export default function Accounts() {
  const { refreshTrigger } = useAppContext();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const [newAccount, setNewAccount] = useState({ name: '', balance: '' });
  const [addingAccount, setAddingAccount] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, [refreshTrigger]);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      console.log('Fetching accounts...'); // Debug log
      const response = await API.get('/api/accounts');
      console.log('Accounts fetched:', response.data); // Debug log
      setAccounts(response.data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      // Show empty accounts when API fails
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccount = async (e) => {
    e.preventDefault();
    
    // Confirmation popup
    const confirmMessage = `Are you sure you want to add this account?\n\nAccount Name: ${newAccount.name}\nInitial Balance: ₹${newAccount.balance}`;
    if (!window.confirm(confirmMessage)) {
      return;
    }
    
    setAddingAccount(true);

    try {
      await API.post('/api/accounts', {
        name: newAccount.name,
        balance: parseFloat(newAccount.balance)
      });
      
      setNewAccount({ name: '', balance: '' });
      setIsAddAccountModalOpen(false);
      fetchAccounts();
    } catch (error) {
      console.error('Error adding account:', error);
      alert('Failed to add account. Please try again.');
    } finally {
      setAddingAccount(false);
    }
  };

  const totalBalance = accounts.reduce((sum, account) => sum + (account.balance || 0), 0);
  const positiveBalance = accounts.reduce((sum, account) => sum + Math.max(0, account.balance || 0), 0);
  const negativeBalance = accounts.reduce((sum, account) => sum + Math.min(0, account.balance || 0), 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <Wallet className="h-8 w-8 mr-3 text-blue-600" />
              Account Management
            </h1>
            <p className="text-gray-600 mt-1">Manage your accounts and transfer money</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setIsTransferModalOpen(true)}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              <ArrowRightLeft className="h-5 w-5" />
              <span>Transfer Money</span>
            </button>
            <button
              onClick={() => setIsAddAccountModalOpen(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Add Account</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm font-medium">Total Balance</h3>
          <p className={`text-2xl font-bold mt-1 ${
            totalBalance >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            ₹ {totalBalance.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm font-medium">Assets</h3>
          <p className="text-2xl font-bold text-green-600 mt-1">
            ₹ {positiveBalance.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm font-medium">Liabilities</h3>
          <p className="text-2xl font-bold text-red-600 mt-1">
            ₹ {Math.abs(negativeBalance).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Your Accounts</h2>
          <p className="text-gray-600 text-sm mt-1">Manage your financial accounts</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Name</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {accounts.length > 0 ? (
                accounts.map((account) => (
                  <tr key={account._id || account.name} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Wallet className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{account.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-semibold ${
                        (account.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ₹ {(account.balance || 0).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        (account.balance || 0) >= 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {(account.balance || 0) >= 0 ? 'Active' : 'Overdrawn'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit Account"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <Wallet className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <div className="text-lg font-medium mb-2">No accounts found</div>
                      <div className="text-sm">Create your first account to get started</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onTransferCompleted={() => {
          setIsTransferModalOpen(false);
          fetchAccounts();
        }}
      />

      {isAddAccountModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">Add New Account</h2>
              <button
                onClick={() => setIsAddAccountModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleAddAccount} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Name *
                </label>
                <input
                  type="text"
                  value={newAccount.name}
                  onChange={(e) => setNewAccount(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Cash, Bank, UPI"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Balance *
                </label>
                <input
                  type="number"
                  value={newAccount.balance}
                  onChange={(e) => setNewAccount(prev => ({ ...prev, balance: e.target.value }))}
                  placeholder="Enter initial balance"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  step="0.01"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddAccountModalOpen(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingAccount}
                  className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {addingAccount ? 'Adding...' : 'Add Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}