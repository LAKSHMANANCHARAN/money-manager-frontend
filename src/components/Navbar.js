import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus, Home, BarChart3, Wallet, ArrowRightLeft, PieChart } from 'lucide-react';

export default function Navbar({ onAddTransaction, onTransferMoney }) {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-40 animate-slideDown">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 transform hover:scale-105 transition-transform duration-200">
            <Wallet className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Money Manager</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                isActive('/') 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <Home className="h-5 w-5" />
              <span className="font-medium">Home</span>
            </Link>

            <Link
              to="/dashboard"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                isActive('/dashboard') 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/accounts"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                isActive('/accounts') 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
              }`}
            >
              <Wallet className="h-5 w-5" />
              <span>Accounts</span>
            </Link>

            <Link
              to="/budget"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                isActive('/budget') 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
              }`}
            >
              <PieChart className="h-5 w-5" />
              <span>Budget</span>
            </Link>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={onTransferMoney}
                className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-200"
              >
                <ArrowRightLeft className="h-4 w-4" />
                <span className="hidden lg:inline font-medium">Transfer</span>
              </button>
              
              <button
                onClick={onAddTransaction}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-2 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-200"
              >
                <Plus className="h-5 w-5" />
                <span className="font-medium">Add</span>
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={onAddTransaction}
              className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}