import React from 'react';

const Sidebar = ({ activeTab, setActiveTab }) => {
    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <span style={{ fontSize: '24px' }}>🎙️</span>
                <span>Voice Billing System</span>
            </div>
            <ul className="sidebar-menu">
                <li className={activeTab === 'dashboard' ? 'active' : ''}>
                    <button onClick={() => setActiveTab('dashboard')}>
                        <span>📊</span> Overview
                    </button>
                </li>
                <li className={activeTab === 'voice' ? 'active' : ''}>
                    <button onClick={() => setActiveTab('voice')}>
                        <span>🎙️</span> Voice Input
                    </button>
                </li>
                <li className={activeTab === 'text' ? 'active' : ''}>
                    <button onClick={() => setActiveTab('text')}>
                        <span>✍️</span> Text Input
                    </button>
                </li>
                <li className={activeTab === 'invoices' ? 'active' : ''}>
                    <button onClick={() => setActiveTab('invoices')}>
                        <span>🧾</span> Find Invoice
                    </button>
                </li>
            </ul>
            <div style={{ marginTop: 'auto', padding: '10px 16px', fontSize: '11px', color: 'var(--text-muted)' }}>
                Powered by AssemblyAI & Gemini
            </div>
        </aside>
    );
};

export default Sidebar;
