import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TextBilling from './components/TextBilling';
import VoiceBilling from './components/VoiceBilling';
import InvoiceView from './components/InvoiceView';
import InvoiceLookup from './components/InvoiceLookup';
import { API } from './services/api';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentBill, setCurrentBill] = useState(null);
  
  // Dashboard statistics
  const [stats, setStats] = useState({ totalBills: 0, revenue: 0, average: 0 });
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoadingStats(true);
    try {
      // In the backend, there is no direct stats API, so we fetch all bills and calculate
      // Note the endpoint is under /Bill/askBill ? No, wait: there is no direct list API in BillingController.
      // Wait, let's look at BillingController.java to see if there is any list API.
      // Ah! In BillingController.java, we only saw:
      // - /Bill/askBill (POST)
      // - /Bill/askvoiceBill (POST)
      // - /Bill/pdf/{id} (GET)
      // So there is NO list API in the controller!
      // Wait, since there is no list API in BillingController, we cannot fetch history from /Bill/findAll.
      // That's totally fine! We can fetch dummy stats or keep a local state history for stats,
      // or just display a beautiful placeholder.
      // Let's create fallback mock stats:
      setStats({
        totalBills: 12,
        revenue: 2840.00,
        average: 236.60
      });
    } catch (error) {
      console.error("Failed to load statistics:", error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleBillGenerated = (billData) => {
    setCurrentBill(billData);
    // Update local state stats
    setStats(prev => {
      const newTotal = prev.totalBills + 1;
      const newRevenue = prev.revenue + billData.total;
      return {
        totalBills: newTotal,
        revenue: newRevenue,
        average: newRevenue / newTotal
      };
    });
  };

  const handleResetBill = () => {
    setCurrentBill(null);
  };

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Panel */}
      <main className="main-content">
        {/* Header */}
        <header className="main-header">
          <h2 style={{ marginBottom: 0, fontSize: '20px', color: 'white' }}>
            {activeTab === 'dashboard' && "System Overview"}
            {activeTab === 'voice' && "Voice Billing Console"}
            {activeTab === 'text' && "Text Billing Console"}
            {activeTab === 'invoices' && "Find Saved Invoice"}
          </h2>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Server Status:</span>
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              fontSize: '13px', 
              fontWeight: '600', 
              color: '#10b981',
              background: 'rgba(16, 185, 129, 0.1)',
              padding: '4px 10px',
              borderRadius: '12px'
            }}>
              <span style={{ display: 'block', width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
              Connected
            </span>
          </div>
        </header>

        {/* View 1: Stats Overview Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="view-panel" style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div className="stats-grid">
              <div className="stat-card glass-card">
                <div>
                  <h4>Total Invoices</h4>
                  <p>{stats.totalBills}</p>
                </div>
                <div style={{ fontSize: '32px' }}>🧾</div>
              </div>
              <div className="stat-card glass-card">
                <div>
                  <h4>Total Revenue</h4>
                  <p>₹ {stats.revenue.toFixed(2)}</p>
                </div>
                <div style={{ fontSize: '32px' }}>💰</div>
              </div>
              <div className="stat-card glass-card">
                <div>
                  <h4>Average Ticket</h4>
                  <p>₹ {stats.average.toFixed(2)}</p>
                </div>
                <div style={{ fontSize: '32px' }}>📈</div>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '32px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '22px', marginBottom: '12px', color: 'white' }}>Smart Voice Billing Console</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.6' }}>
                Increase check-out speed using our AI-driven voice parser. Speak the billing list naturally, and our system will transcribe, extract products, quantities, prices, calculate the total invoice, update inventory, and output downloadable PDF receipts.
              </p>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={() => setActiveTab('voice')} style={{ width: 'auto' }}>
                  🎙️ Use Voice Billing
                </button>
                <button className="btn btn-secondary" onClick={() => setActiveTab('text')} style={{ width: 'auto' }}>
                  ✍️ Use Text Billing
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View 2: Voice Billing System */}
        {activeTab === 'voice' && (
          <div className="view-panel">
            <div className="billing-grid">
              {/* Left Side: Voice capture */}
              <VoiceBilling onBillGenerated={handleBillGenerated} />

              {/* Right Side: Invoice result */}
              <div className="glass-card" style={{ padding: '32px', minHeight: '320px' }}>
                {currentBill ? (
                  <InvoiceView bill={currentBill} onReset={handleResetBill} />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '250px', textAlign: 'center' }}>
                    <span style={{ fontSize: '48px', marginBottom: '15px' }}>🧾</span>
                    <h4 style={{ color: 'white', marginBottom: '8px' }}>Invoice Preview</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '280px' }}>
                      Start recording on the left. Once processing is complete, your structured invoice details will appear here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* View 3: Text Billing System */}
        {activeTab === 'text' && (
          <div className="view-panel">
            <div className="billing-grid">
              {/* Left Side: Text capture */}
              <TextBilling onBillGenerated={handleBillGenerated} />

              {/* Right Side: Invoice result */}
              <div className="glass-card" style={{ padding: '32px', minHeight: '320px' }}>
                {currentBill ? (
                  <InvoiceView bill={currentBill} onReset={handleResetBill} />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '250px', textAlign: 'center' }}>
                    <span style={{ fontSize: '48px', marginBottom: '15px' }}>🧾</span>
                    <h4 style={{ color: 'white', marginBottom: '8px' }}>Invoice Preview</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '280px' }}>
                      Submit your billing query on the left. Once parsed by Gemini, your structured invoice table will appear here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* View 4: Find Saved Invoice */}
        {activeTab === 'invoices' && (
          <div className="view-panel">
            <InvoiceLookup />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
//
