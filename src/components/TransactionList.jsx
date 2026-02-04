import CategoryPieChart from './CategoryPieChart';
import EditTransactionModal from './EditTransactionModal';
import { useState } from 'react';
import { Edit3, Clock } from 'lucide-react';
import { useAppContext } from '../App';

export default function TransactionList({ transactions, categorySummary = [] }) {
  const { triggerRefresh } = useAppContext();
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEditClick = (transaction) => {
    setEditingTransaction(transaction);
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setEditingTransaction(null);
  };

  const handleTransactionUpdated = () => {
    triggerRefresh();
    handleEditModalClose();
  };

  const canEdit = (transaction) => {
    const transactionTime = new Date(transaction.createdAt);
    const now = new Date();
    const hoursDiff = (now - transactionTime) / (1000 * 60 * 60);
    return hoursDiff <= 12;
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Transaction History</h2>
          <p className="text-gray-600 text-sm mt-1">Recent financial activities</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Division</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.length > 0 ? (
                transactions.map((t) => {
                  const isEditable = canEdit(t);
                  return (
                    <tr key={t._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          {new Date(t.createdAt).toLocaleDateString()}
                          <div className="text-xs text-gray-500">
                            {new Date(t.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {t.description || 'No description'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                        {t.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                        {t.division}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          t.type === "income" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {t.type}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                        t.type === "income" ? "text-green-600" : "text-red-600"
                      }`}>
                        ₹ {t.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleEditClick(t)}
                          disabled={!isEditable}
                          className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                            isEditable
                              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                          title={isEditable ? 'Edit transaction' : 'Cannot edit after 12 hours'}
                        >
                          {isEditable ? (
                            <Edit3 className="h-3 w-3 mr-1" />
                          ) : (
                            <Clock className="h-3 w-3 mr-1" />
                          )}
                          {isEditable ? 'Edit' : 'Locked'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <div className="text-lg font-medium mb-2">No transactions found</div>
                      <div className="text-sm">Start by adding your first transaction</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {categorySummary.length > 0 && (
        <CategoryPieChart data={categorySummary} />
      )}

      <EditTransactionModal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        transaction={editingTransaction}
        onSuccess={handleTransactionUpdated}
      />
    </>
  );
}
