import React, { useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import Budget from './pages/Budget';
import TransactionModal from './components/TransactionModal';
import TransferModal from './components/TransferModal';
import './App.css';

// Global state context
const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => {
    console.log('Triggering refresh...', refreshTrigger + 1); // Debug log
    setRefreshTrigger(prev => prev + 1);
  };

  const handleTransactionAdded = () => {
    console.log('Transaction added, triggering refresh...'); // Debug log
    triggerRefresh();
    setIsModalOpen(false);
  };

  const handleTransferCompleted = () => {
    triggerRefresh();
    setIsTransferModalOpen(false);
  };

  const contextValue = {
    refreshTrigger,
    triggerRefresh
  };

  return (
    <AppContext.Provider value={contextValue}>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
          <Navbar 
            onAddTransaction={() => setIsModalOpen(true)}
            onTransferMoney={() => setIsTransferModalOpen(true)}
          />
          
          <main className="container mx-auto px-6 py-8 animate-fadeIn">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/accounts" element={<Accounts />} />
              <Route path="/budget" element={<Budget />} />
            </Routes>
          </main>

          <TransactionModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onTransactionAdded={handleTransactionAdded}
          />

          <TransferModal
            isOpen={isTransferModalOpen}
            onClose={() => setIsTransferModalOpen(false)}
            onTransferCompleted={handleTransferCompleted}
          />
        </div>
      </Router>
    </AppContext.Provider>
  );
}

export default App;