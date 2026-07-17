import React, { useState, useEffect } from 'react';
import { API } from '../services/api';
import InvoiceView from './InvoiceView';

const InvoiceLookup = () => {
    const [billId, setBillId] = useState('');
    const [billData, setBillData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // List of all invoices
    const [invoicesList, setInvoicesList] = useState([]);
    const [isLoadingList, setIsLoadingList] = useState(false);

    useEffect(() => {
        fetchAllInvoices();
    }, []);

    const fetchAllInvoices = async () => {
        setIsLoadingList(true);
        try {
            const data = await API.getAllInvoices();
            // Sort by billno descending so newest shows first
            const sorted = data.sort((a, b) => b.billno - a.billno);
            setInvoicesList(sorted);
        } catch (err) {
            console.error("Failed to fetch invoices list:", err);
        } finally {
            setIsLoadingList(false);
        }
    };

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        const id = billId.trim();
        if (!id) return;

        setIsLoading(true);
        setError('');
        setBillData(null);

        try {
            const data = await API.getBillById(id);
            console.log("Invoice lookup success:", data);
            
            // Inject the billno into the DTO so the InvoiceView knows the ID
            data.billno = parseInt(id);
            setBillData(data);
        } catch (err) {
            console.error("Lookup failed:", err);
            setError(`❌ Invoice #${id} not found or server error.`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectInvoice = async (id) => {
        setBillId(id.toString());
        setIsLoading(true);
        setError('');
        setBillData(null);

        try {
            const data = await API.getBillById(id);
            data.billno = id;
            setBillData(data);
        } catch (err) {
            console.error("Lookup failed for selection:", err);
            setError(`❌ Failed to retrieve invoice #${id}.`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setBillData(null);
        setBillId('');
        setError('');
        fetchAllInvoices(); // Refresh the list
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div className="billing-grid">
                {/* Left Side: Search & Invoices List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    {/* Search Panel */}
                    <div className="glass-card" style={{ padding: '32px' }}>
                        <h3 style={{ fontSize: '20px', marginBottom: '10px', color: 'white' }}>Find Invoice</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
                            Enter the transaction ID to retrieve the invoice details.
                        </p>

                        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
                            <div className="form-group" style={{ flexGrow: 1, marginBottom: 0 }}>
                                <label htmlFor="searchInvoiceId">Invoice Number</label>
                                <input
                                    type="text"
                                    id="searchInvoiceId"
                                    placeholder="e.g. 1, 2, 15..."
                                    style={{ margin: 0 }}
                                    value={billId}
                                    onChange={(e) => setBillId(e.target.value.replace(/[^0-9]/g, ''))}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ width: 'auto', padding: '12px 30px' }}
                                disabled={isLoading || !billId}
                            >
                                {isLoading ? "Searching..." : "Search"}
                            </button>
                        </form>

                        {error && (
                            <div className="msg-alert error" style={{ marginTop: '20px' }}>
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Database Invoices List */}
                    <div className="glass-card" style={{ padding: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '18px', color: 'white', margin: 0 }}>Saved Invoices Directory</h3>
                            <button 
                                onClick={fetchAllInvoices} 
                                className="btn btn-secondary" 
                                style={{ width: 'auto', padding: '6px 12px', fontSize: '12px' }}
                                disabled={isLoadingList}
                            >
                                🔄 Refresh List
                            </button>
                        </div>

                        {isLoadingList ? (
                            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                                Loading invoices from database...
                            </div>
                        ) : invoicesList.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                                No invoices saved in database yet.
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto', maxHeight: '350px' }}>
                                <table className="invoice-table" style={{ width: '100%', fontSize: '13px' }}>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Speech / Text Preview</th>
                                            <th style={{ textAlign: 'right' }}>Total</th>
                                            <th style={{ textAlign: 'center' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoicesList.map((inv) => (
                                            <tr 
                                                key={inv.billno} 
                                                style={{ 
                                                    cursor: 'pointer', 
                                                    background: billData?.billno === inv.billno ? 'rgba(139, 92, 246, 0.1)' : 'transparent'
                                                }}
                                                onClick={() => handleSelectInvoice(inv.billno)}
                                            >
                                                <td style={{ color: 'white', fontWeight: '700' }}>#{inv.billno}</td>
                                                <td style={{ 
                                                    maxWidth: '180px', 
                                                    whiteSpace: 'nowrap', 
                                                    overflow: 'hidden', 
                                                    textOverflow: 'ellipsis',
                                                    color: 'var(--text-secondary)'
                                                }}>
                                                    {inv.rawtext || "Voice input"}
                                                </td>
                                                <td style={{ textAlign: 'right', color: 'white', fontWeight: '600' }}>₹{inv.total.toFixed(2)}</td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <span style={{ color: 'var(--primary)', fontWeight: '600' }}>View ➡️</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Invoice preview */}
                <div className="glass-card" style={{ padding: '32px', minHeight: '450px' }}>
                    {billData ? (
                        <InvoiceView bill={billData} onReset={handleReset} />
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '350px', textAlign: 'center' }}>
                            <span style={{ fontSize: '48px', marginBottom: '15px' }}>🔍</span>
                            <h4 style={{ color: 'white', marginBottom: '8px' }}>Invoice Preview</h4>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '280px' }}>
                                Select an invoice from the directory on the left or search by ID to view full retail details.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InvoiceLookup;
