import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import TextBilling from './components/TextBilling';
import VoiceBilling from './components/VoiceBilling';
import InvoiceView from './components/InvoiceView';
import InvoiceLookup from './components/InvoiceLookup';
import DemoTutorial from './components/DemoTutorial';
import { API } from './services/api';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentBill, setCurrentBill] = useState(null);

  // Dynamic Dashboard Statistics
  const [stats, setStats] = useState({ totalBills: 0, revenue: 0, average: 0 });
  const [isLoadingStats, setIsLoadingStats] = useState(false);

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
      } else {
        setStats({ totalBills: 0, revenue: 0, average: 0 });
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'dashboard' || activeTab === 'overview') {
      fetchDashboardStats();
    }
  }, [activeTab, fetchDashboardStats]);

  const handleBillCreated = (billData) => {
    setCurrentBill(billData);
    fetchDashboardStats();
  };

  const handleResetBill = () => {
    setCurrentBill(null);
  };

  return (
    <div className="layout">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setCurrentBill(null);
        }} 
      />

      {/* Main Content Area */}
      <main className="main">
        {/* Top Header */}
        <div className="dashboard-header">
          <div>
            <h1>
              {activeTab === 'dashboard' && 'System Overview'}
              {activeTab === 'voice' && 'Voice Billing'}
              {activeTab === 'text' && 'Text Billing'}
              {activeTab === 'lookup' && 'Search & Lookup Invoices'}
              {activeTab === 'demo' && 'Guide & Tutorial'}
            </h1>
          </div>
          <div className="server-status">
            <span>Server Status:</span>
            <span className="badge-connected">● Connected</span>
          </div>
        </div>

        {/* Dashboard Overview Tab */}
        {activeTab === 'dashboard' && (
          <div>
            {/* 3 Metric Cards */}
            <div className="stats-row">
              <div className="metric-card">
                <div>
                  <div className="metric-label">TOTAL INVOICES</div>
                  <div className="metric-value">
                    {isLoadingStats ? '...' : stats.totalBills}
                  </div>
                </div>
                <div className="metric-icon">📄</div>
              </div>

              <div className="metric-card">
                <div>
                  <div className="metric-label">TOTAL REVENUE</div>
                  <div className="metric-value">
                    {isLoadingStats ? '...' : `₹ ${stats.revenue.toFixed(2)}`}
                  </div>
                </div>
                <div className="metric-icon">💰</div>
              </div>

              <div className="metric-card">
                <div>
                  <div className="metric-label">AVERAGE TICKET</div>
                  <div className="metric-value">
                    {isLoadingStats ? '...' : `₹ ${stats.average.toFixed(2)}`}
                  </div>
                </div>
                <div className="metric-icon">📈</div>
              </div>
            </div>

            {/* Smart Console Quick Action Box */}
            <div className="card-box" style={{ marginTop: '24px' }}>
              <h2 style={{ fontSize: '20px', marginBottom: '12px', color: 'white' }}>
                Smart Voice Billing Console
              </h2>
              <p style={{ color: 'var(--text-secondary, #94a3b8)', lineHeight: '1.6', marginBottom: '24px', fontSize: '14px' }}>
                Increase check-out speed using our AI-driven voice parser. Speak the billing list naturally, 
                and our system will transcribe, extract products, quantities, prices, calculate the total invoice, 
                update inventory, and output downloadable PDF receipts.
              </p>
              <div style={{ display: 'flex', gap: '14px' }}>
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

        {/* Voice Billing View */}
        {activeTab === 'voice' && (
          <div className="two-col-grid">
            <div className="card-box">
              <VoiceBilling onBillGenerated={handleBillCreated} />
            </div>
            <div className="card-box">
              {currentBill ? (
                <InvoiceView bill={currentBill} onReset={handleResetBill} />
              ) : (
                <div className="empty-state">
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>📄</div>
                  <h3 style={{ color: 'white', marginBottom: '8px' }}>Invoice Preview</h3>
                  <p style={{ color: 'var(--text-secondary, #94a3b8)', fontSize: '14px' }}>
                    Start recording on the left. Once processing is complete, 
                    your structured invoice details will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Text Billing View */}
        {activeTab === 'text' && (
          <div className="two-col-grid">
            <div className="card-box">
              <TextBilling onBillGenerated={handleBillCreated} />
            </div>
            <div className="card-box">
              {currentBill ? (
                <InvoiceView bill={currentBill} onReset={handleResetBill} />
              ) : (
                <div className="empty-state">
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>📄</div>
                  <h3 style={{ color: 'white', marginBottom: '8px' }}>Invoice Preview</h3>
                  <p style={{ color: 'var(--text-secondary, #94a3b8)', fontSize: '14px' }}>
                    Type your billing prompt on the left. Once processed, 
                    your structured invoice details will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Invoice Lookup View */}
        {activeTab === 'lookup' && (
          <div className="card-box">
            <InvoiceLookup />
          </div>
        )}

        {/* Tutorial View */}
        {activeTab === 'demo' && (
          <div className="card-box">
            <DemoTutorial />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;