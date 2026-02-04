import React, { useState, useEffect } from 'react';
import { useAppContext } from '../App';
import { Calendar, Filter, TrendingUp, TrendingDown, DollarSign, Search } from 'lucide-react';
import API from '../services/api';
import SummaryCard from '../components/SummaryCard';
import TransactionList from '../components/TransactionList';

export default function Home() {
  const { refreshTrigger } = useAppContext();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
  const [categorySummary, setCategorySummary] = useState([]);
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    division: 'all',
    account: 'all',
    dateFrom: '',
    dateTo: '',
    search: ''
  });
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  useEffect(() => {
    applyFilters();
  }, [transactions, filters, accounts]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all transactions
      const transactionsResponse = await API.get('/api/transactions');
      setTransactions(transactionsResponse.data);

      // Fetch accounts for filter
      const accountsResponse = await API.get('/api/accounts');
      setAccounts(accountsResponse.data);

      // Fetch category summary
      const categoryResponse = await API.get('/api/transactions/categories/summary');
      setCategorySummary(categoryResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Show empty data when API fails
      setTransactions([]);
      setAccounts([]);
      setCategorySummary([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(t => t.type === filters.type);
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(t => t.category === filters.category);
    }

    // Division filter
    if (filters.division !== 'all') {
      filtered = filtered.filter(t => t.division === filters.division);
    }

    // Account filter
    if (filters.account !== 'all') {
      filtered = filtered.filter(t => t.account === filters.account);
    }

    // Date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter(t => 
        new Date(t.createdAt) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(t => 
        new Date(t.createdAt) <= new Date(filters.dateTo + 'T23:59:59')
      );
    }

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(t => 
        t.description?.toLowerCase().includes(searchTerm) ||
        t.category.toLowerCase().includes(searchTerm) ||
        t.account?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredTransactions(filtered);
    calculateSummary(filtered);
  };

  const calculateSummary = (data) => {
    const transactionIncome = data
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const transactionExpense = data
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Total account balance (available money)
    const totalAccountBalance = accounts.reduce((sum, account) => sum + (account.balance || 0), 0);

    setSummary({
      income: transactionIncome, // Show actual income transactions
      expense: transactionExpense,
      balance: transactionIncome - transactionExpense // Net profit/loss from transactions
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      type: 'all',
      category: 'all',
      division: 'all',
      account: 'all',
      dateFrom: '',
      dateTo: '',
      search: ''
    });
  };

  const getUniqueCategories = () => {
    const categories = [...new Set(transactions.map(t => t.category))];
    return categories.sort();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-2">Welcome to Money Manager</h1>
        <p className="text-green-100">Track your income and expenses efficiently with advanced filtering and analytics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Income"
          amount={summary.income}
          color="text-green-600"
          icon={<TrendingUp className="h-6 w-6 text-green-600" />}
        />
        <SummaryCard
          title="Total Expense"
          amount={summary.expense}
          color="text-red-600"
          icon={<TrendingDown className="h-6 w-6 text-red-600" />}
        />
        <SummaryCard
          title="Net Balance"
          amount={summary.balance}
          color={summary.balance >= 0 ? "text-green-600" : "text-red-600"}
          icon={<DollarSign className="h-6 w-6" />}
        />
        <SummaryCard
          title="Account Balance"
          amount={accounts.reduce((sum, account) => sum + (account.balance || 0), 0)}
          color="text-blue-600"
          icon={<DollarSign className="h-6 w-6 text-blue-600" />}
        />
      </div>

      {/* Advanced Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Advanced Filters
          </h2>
          <button
            onClick={clearFilters}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {getUniqueCategories().map(category => (
              <option key={category} value={category} className="capitalize">
                {category}
              </option>
            ))}
          </select>

          {/* Division Filter */}
          <select
            value={filters.division}
            onChange={(e) => handleFilterChange('division', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Divisions</option>
            <option value="personal">Personal</option>
            <option value="office">Office</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Account Filter */}
          <select
            value={filters.account}
            onChange={(e) => handleFilterChange('account', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Accounts</option>
            {accounts.map(account => (
              <option key={account.name} value={account.name}>
                {account.name}
              </option>
            ))}
          </select>

          {/* Date From */}
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="From Date"
          />

          {/* Date To */}
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="To Date"
          />
        </div>

        {/* Results Count */}
        <div className="mt-4 flex items-center text-sm text-gray-600">
          <Calendar className="h-4 w-4 mr-1" />
          Showing {filteredTransactions.length} of {transactions.length} transactions
        </div>
      </div>

      {/* Transaction List */}
      <TransactionList 
        transactions={filteredTransactions} 
        categorySummary={categorySummary}
      />
    </div>
  );
}