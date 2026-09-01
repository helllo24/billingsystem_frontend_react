import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import TextBilling from './components/TextBilling';
import VoiceBilling from './components/VoiceBilling';
import InvoiceView from './components/InvoiceView';
import InvoiceLookup from './components/InvoiceLookup';
import DemoTutorial from './components/DemoTutorial';
import { API } from './services/api';

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentBill, setCurrentBill] = useState(null);

  // Dynamic Dashboard Statistics
  const [stats, setStats] = useState({ totalBills: 0, revenue: 0, average: 0 });
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [serverStatus, setServerStatus] = useState('Connected');

  // Fetch live metrics from backend database
  const fetchDashboardStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const invoices = await API.getAllInvoices();
      if (Array.isArray(invoices) && invoices.length > 0) {
        const count = invoices.length;
        const totalRevenue = invoices.reduce((acc, curr) => {
          const amount = Number(curr.total || curr.totalAmount || curr.totalprice || 0);
          return acc + amount;
        }, 0);
        const avgTicket = count > 0 ? totalRevenue / count : 0;

        setStats({
          totalBills: count,
          revenue: totalRevenue,
          average: avgTicket
        });
        setServerStatus('Connected');
      } else {
        setStats({ totalBills: 0, revenue: 0, average: 0 });
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
      setServerStatus('Offline');
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  // Fetch when dashboard tab becomes active
  useEffect(() => {
    if (activeTab === 'overview' || activeTab === 'dashboard') {
      fetchDashboardStats();
    }
  }, [activeTab, fetchDashboardStats]);

  // Handler when a bill is successfully generated
  const handleBillCreated = (billData) => {
    setCurrentBill(billData);
    fetchDashboardStats(); // Update stats immediately
  };

  const handleResetBill = () => {
    setCurrentBill(null);
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setCurrentBill(null); // Clear active bill on route change
        }} 
      />

      {/* Main Content Area */}
      <main className="main-content">
        {/* Top Header Bar */}
        <header className="top-header">
          <div className="header-title">
            <h2>
              {activeTab === 'overview' && 'System Overview'}
              {activeTab === 'voice' && 'Smart Voice Billing'}
              {activeTab === 'text' && 'Fast Text Billing'}
              {activeTab === 'lookup' && 'Search & Lookup Invoices'}
              {activeTab === 'demo' && 'Interactive Guide & Tutorial'}
            </h2>
          </div>
          <div className="server-badge">
            <span>Server Status:</span>
            <span className={`status-indicator ${serverStatus === 'Connected' ? 'online' : 'offline'}`}>
              ● {serverStatus}
            </span>
          </div>
        </header>

        {/* Overview / Dashboard Tab */}
        {activeTab === 'overview' && (
          <div className="dashboard-content">
            {/* Stat Cards Grid */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-info">
                  <span className="stat-label">TOTAL INVOICES</span>
                  <h3 className="stat-value">
                    {isLoadingStats ? '...' : stats.totalBills}
                  </h3>
                </div>
                <div className="stat-icon">📄</div>
              </div>

              <div className="stat-card">
                <div className="stat-info">
                  <span className="stat-label">TOTAL REVENUE</span>
                  <h3 className="stat-value">
                    {isLoadingStats ? '...' : `₹ ${stats.revenue.toFixed(2)}`}
                  </h3>
                </div>
                <div className="stat-icon">💰</div>
              </div>

              <div className="stat-card">
                <div className="stat-info">
                  <span className="stat-label">AVERAGE TICKET</span>
                  <h3 className="stat-value">
                    {isLoadingStats ? '...' : `₹ ${stats.average.toFixed(2)}`}
                  </h3>
                </div>
                <div className="stat-icon">📈</div>
              </div>
            </div>

            {/* Smart Console Quick Action Banner */}
            <div className="quick-action-card">
              <h3>Smart Voice Billing Console</h3>
              <p>
                Increase check-out speed using our AI-driven voice parser. Speak the billing list naturally, 
                and our system will transcribe, extract products, quantities, prices, calculate the total invoice, 
                update inventory, and output downloadable PDF receipts.
              </p>
              <div className="quick-buttons">
                <button 
                  className="btn btn-primary" 
                  onClick={() => setActiveTab('voice')}
                >
                  🎙️ Use Voice Billing
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setActiveTab('text')}
                >
                  ✍️ Use Text Billing
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Voice Billing Tab */}
        {activeTab === 'voice' && (
          <div className="billing-split-view">
            <div className="input-panel">
              <VoiceBilling onBillGenerated={handleBillCreated} />
            </div>
            <div className="preview-panel">
              {currentBill ? (
                <InvoiceView bill={currentBill} onReset={handleResetBill} />
              ) : (
                <div className="empty-preview">
                  <div className="empty-icon">📄</div>
                  <h3>Invoice Preview</h3>
                  <p>
                    Start recording on the left. Once processing is complete, 
                    your structured invoice details will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Text Billing Tab */}
        {activeTab === 'text' && (
          <div className="billing-split-view">
            <div className="input-panel">
              <TextBilling onBillGenerated={handleBillCreated} />
            </div>
            <div className="preview-panel">
              {currentBill ? (
                <InvoiceView bill={currentBill} onReset={handleResetBill} />
              ) : (
                <div className="empty-preview">
                  <div className="empty-icon">📄</div>
                  <h3>Invoice Preview</h3>
                  <p>
                    Type your billing prompt on the left. Once processed, 
                    your structured invoice details will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Invoice Lookup Tab */}
        {activeTab === 'lookup' && (
          <div className="lookup-container">
            <InvoiceLookup />
          </div>
        )}

        {/* Tutorial Guide Tab */}
        {activeTab === 'demo' && (
          <div className="tutorial-container">
            <DemoTutorial />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;