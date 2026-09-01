import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import TextBilling from './components/TextBilling';
import VoiceBilling from './components/VoiceBilling';
import InvoiceView from './components/InvoiceView';
import InvoiceLookup from './components/InvoiceLookup';
import DemoTutorial from './components/DemoTutorial';
import { API } from './services/api';
import './index.css';

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

  useEffect(() => {
    if (activeTab === 'overview' || activeTab === 'dashboard') {
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
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0d14', color: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Sidebar Component */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setCurrentBill(null);
        }} 
      />

      {/* Main Page Area */}
      <main style={{ flex: 1, padding: '32px 40px', overflowY: 'auto', maxWidth: '1400px' }}>
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '700', margin: 0, color: '#fff' }}>
            {activeTab === 'overview' || activeTab === 'dashboard' ? 'System Overview' : ''}
            {activeTab === 'voice' && 'Voice Billing'}
            {activeTab === 'text' && 'Text Billing'}
            {activeTab === 'lookup' && 'Search & Lookup Invoices'}
            {activeTab === 'demo' && 'Demo & Guide'}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#111726', padding: '6px 14px', borderRadius: '20px', border: '1px solid #1e293b', fontSize: '13px' }}>
            <span style={{ color: '#94a3b8' }}>Server Status:</span>
            <span style={{ color: serverStatus === 'Connected' ? '#10b981' : '#ef4444', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
              ● {serverStatus}
            </span>
          </div>
        </div>

        {/* Dashboard Overview */}
        {(activeTab === 'overview' || activeTab === 'dashboard') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Metric Cards Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {/* Total Invoices */}
              <div style={{ background: '#111726', border: '1px solid #1e293b', borderRadius: '14px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', letterSpacing: '0.05em', marginBottom: '8px' }}>TOTAL INVOICES</div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#fff' }}>{isLoadingStats ? '...' : stats.totalBills}</div>
                </div>
                <div style={{ fontSize: '32px' }}>📄</div>
              </div>

              {/* Total Revenue */}
              <div style={{ background: '#111726', border: '1px solid #1e293b', borderRadius: '14px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', letterSpacing: '0.05em', marginBottom: '8px' }}>TOTAL REVENUE</div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#fff' }}>{isLoadingStats ? '...' : `₹ ${stats.revenue.toFixed(2)}`}</div>
                </div>
                <div style={{ fontSize: '32px' }}>💰</div>
              </div>

              {/* Average Ticket */}
              <div style={{ background: '#111726', border: '1px solid #1e293b', borderRadius: '14px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', letterSpacing: '0.05em', marginBottom: '8px' }}>AVERAGE TICKET</div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#fff' }}>{isLoadingStats ? '...' : `₹ ${stats.average.toFixed(2)}`}</div>
                </div>
                <div style={{ fontSize: '32px' }}>📈</div>
              </div>
            </div>

            {/* Smart Voice Billing Console Action Box */}
            <div style={{ background: '#111726', border: '1px solid #1e293b', borderRadius: '14px', padding: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#fff', marginBottom: '12px' }}>
                Smart Voice Billing Console
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px', maxWidth: '900px' }}>
                Increase check-out speed using our AI-driven voice parser. Speak the billing list naturally, 
                and our system will transcribe, extract products, quantities, prices, calculate the total invoice, 
                update inventory, and output downloadable PDF receipts.
              </p>
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => setActiveTab('voice')}
                  style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  🎙️ Use Voice Billing
                </button>
                <button 
                  onClick={() => setActiveTab('text')}
                  style={{ background: '#1e293b', color: '#fff', border: '1px solid #334155', padding: '12px 24px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  ✍️ Use Text Billing
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Voice Billing View */}
        {activeTab === 'voice' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
            <div style={{ background: '#111726', border: '1px solid #1e293b', borderRadius: '14px', padding: '24px' }}>
              <VoiceBilling onBillGenerated={handleBillCreated} />
            </div>
            <div style={{ background: '#111726', border: '1px solid #1e293b', borderRadius: '14px', padding: '24px' }}>
              {currentBill ? (
                <InvoiceView bill={currentBill} onReset={handleResetBill} />
              ) : (
                <div style={{ textAlign: 'center', padding: '48px 20px', color: '#94a3b8' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>📄</div>
                  <h3 style={{ color: '#fff', marginBottom: '8px', fontSize: '18px' }}>Invoice Preview</h3>
                  <p style={{ fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
                    Start recording on the left. Once processing is complete, your structured invoice details will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Text Billing View */}
        {activeTab === 'text' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
            <div style={{ background: '#111726', border: '1px solid #1e293b', borderRadius: '14px', padding: '24px' }}>
              <TextBilling onBillGenerated={handleBillCreated} />
            </div>
            <div style={{ background: '#111726', border: '1px solid #1e293b', borderRadius: '14px', padding: '24px' }}>
              {currentBill ? (
                <InvoiceView bill={currentBill} onReset={handleResetBill} />
              ) : (
                <div style={{ textAlign: 'center', padding: '48px 20px', color: '#94a3b8' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>📄</div>
                  <h3 style={{ color: '#fff', marginBottom: '8px', fontSize: '18px' }}>Invoice Preview</h3>
                  <p style={{ fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
                    Type your billing prompt on the left. Once processed, your structured invoice details will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Lookup View */}
        {activeTab === 'lookup' && (
          <div style={{ background: '#111726', border: '1px solid #1e293b', borderRadius: '14px', padding: '24px' }}>
            <InvoiceLookup />
          </div>
        )}

        {/* Demo View */}
        {activeTab === 'demo' && (
          <div style={{ background: '#111726', border: '1px solid #1e293b', borderRadius: '14px', padding: '24px' }}>
            <DemoTutorial />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;