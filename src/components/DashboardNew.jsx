import { useEffect, useState } from "react";
import API from "../services/api";
import RangeSelector from "./RangeSelector";
import SummaryCard from "./SummaryCard";
import TransactionList from "./TransactionList";
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';

export default function Dashboard({ refreshTrigger }) {
  const [range, setRange] = useState("monthly");
  const [categorySummary, setCategorySummary] = useState([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0 });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [range, refreshTrigger]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch income & expense summary
      const summaryResponse = await API.get(`/api/transactions/summary?range=${range}`);
      setSummary(summaryResponse.data);

      // Fetch category summary
      const categoryResponse = await API.get("/api/transactions/category-summary");
      setCategorySummary(categoryResponse.data);

      // Fetch all transactions
      const transactionsResponse = await API.get("/api/transactions");
      setTransactions(transactionsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Mock data for demo
      setSummary({ income: 25000, expense: 18000 });
      setTransactions([
        {
          _id: '1',
          type: 'expense',
          amount: 500,
          category: 'food',
          division: 'personal',
          description: 'Lunch at restaurant',
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          type: 'income',
          amount: 5000,
          category: 'salary',
          division: 'personal',
          description: 'Monthly salary',
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
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
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <BarChart3 className="h-8 w-8 mr-3 text-blue-600" />
              Financial Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Overview of your financial activities</p>
          </div>
          <RangeSelector range={range} setRange={setRange} />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SummaryCard
          title="Total Income"
          amount={summary.income}
          color="text-green-600"
          icon={<TrendingUp className="h-8 w-8 text-green-600" />}
        />
        <SummaryCard
          title="Total Expense"
          amount={summary.expense}
          color="text-red-600"
          icon={<TrendingDown className="h-8 w-8 text-red-600" />}
        />
        <SummaryCard
          title="Net Balance"
          amount={summary.income - summary.expense}
          color={summary.income - summary.expense >= 0 ? "text-green-600" : "text-red-600"}
          icon={<DollarSign className="h-8 w-8" />}
        />
        <SummaryCard
          title="Savings Rate"
          amount={summary.income > 0 ? `${Math.round(((summary.income - summary.expense) / summary.income) * 100)}%` : '0%'}
          color="text-blue-600"
          showCurrency={false}
        />
      </div>

      {/* Transaction History */}
      <TransactionList transactions={transactions} categorySummary={categorySummary} />
    </div>
  );
}