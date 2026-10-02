import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.jsx';
import { TransferWidget } from './components/TransferWidget.jsx';
import { TransactionTracker } from './components/TransactionTracker.jsx';
import { TransactionHistory } from './components/TransactionHistory.jsx';
import { AdminAnalytics } from './components/AdminAnalytics.jsx';
import { LandingGate } from './components/LandingGate.jsx';
import { AuthModal } from './components/AuthModal.jsx';

export default function App() {
  const [activeTab, setActiveTab] = useState('create');
  const [activeOrder, setActiveOrder] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedEmail = localStorage.getItem('miloosh_user_email');
    if (savedEmail) {
      setUser({ email: savedEmail });
    }
  }, []);

  const handleOrderCreated = (newOrder) => {
    setActiveOrder(newOrder);
    setActiveTab('tracker');
  };

  const handleSelectOrderFromHistory = (order) => {
    setActiveOrder(order);
    setActiveTab('tracker');
  };

  const handleLogout = () => {
    localStorage.removeItem('miloosh_auth_token');
    localStorage.removeItem('miloosh_user_email');
    setUser(null);
    setActiveTab('create');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-vazir selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Persian Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onOpenAuthModal={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Container: Gate enforcement */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
        {!user ? (
          /* Unauthenticated Access Gate: Shows Hero & Login/Register Form */
          <LandingGate onAuthSuccess={(u) => setUser(u)} />
        ) : (
          /* Authenticated User Dashboard */
          <>
            {activeTab === 'create' && (
              <TransferWidget onOrderCreated={handleOrderCreated} />
            )}

            {activeTab === 'tracker' && (
              <TransactionTracker
                activeOrder={activeOrder}
                onNewOrderClick={() => setActiveTab('create')}
              />
            )}

            {activeTab === 'history' && (
              <TransactionHistory
                onSelectOrder={handleSelectOrderFromHistory}
                onNewOrderClick={() => setActiveTab('create')}
              />
            )}

            {activeTab === 'admin' && (
              <AdminAnalytics />
            )}
          </>
        )}
      </main>

      {/* Auth Modal Popup */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(u) => setUser(u)}
      />

      {/* Footer */}
      <footer className="border-t border-white/[0.08] py-5 bg-slate-950 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© ۲۰۲۶ میلوش کلین‌پِی (Miloosh Clean Pay) - تمامی حقوق محفوظ است.</p>
          <div className="flex items-center gap-3 text-slate-400 font-medium">
            <span>PancakeSwap DEX</span>
            <span>•</span>
            <span>BSC EVM Network</span>
            <span>•</span>
            <span className="text-emerald-400 font-bold">ALTCHA PoW & Rate-Limited Protected</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
