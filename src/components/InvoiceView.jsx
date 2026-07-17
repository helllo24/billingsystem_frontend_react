import React, { useState } from 'react';
import { API } from '../services/api';

const InvoiceView = ({ bill, onReset }) => {
    const [isDownloading, setIsDownloading] = useState(false);
    const [error, setError] = useState('');

    if (!bill) return null;

    const handleDownloadPdf = async () => {
        if (!bill.billno) {
            setError("⚠️ Backend did not return a Bill ID. PDF download requires a saved database entry.");
            return;
        }

        setIsDownloading(true);
        setError('');

        try {
            await API.downloadBillPdf(bill.billno, `invoice_${bill.billno}.pdf`);
        } catch (err) {
            console.error("PDF Download failed:", err);
            setError("❌ Failed to download PDF. Please verify your backend server PDF API.");
        } finally {
            setIsDownloading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    // Current Date formatted
    const dateStr = new Date().toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div style={{ animation: 'fadeIn 0.6s ease-out' }}>
            <div className="invoice-card">
                <div className="invoice-header">
                    <div>
                        <h2 style={{ textAlign: 'left', fontSize: '24px', marginBottom: '4px', background: 'none', WebkitTextFillColor: 'initial', color: 'white' }}>
                            INVOICE
                        </h2>
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                            Date: {dateStr}
                        </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <span style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)' }}>Invoice No.</span>
                        <strong style={{ fontSize: '18px', color: 'var(--primary)' }}>
                            #{bill.billno || "DRAFT"}
                        </strong>
                    </div>
                </div>

                <table className="invoice-table">
                    <thead>
                        <tr>
                            <th>Item Name</th>
                            <th style={{ textAlign: 'center' }}>Qty</th>
                            <th style={{ textAlign: 'right' }}>Price (Per Unit)</th>
                            <th style={{ textAlign: 'right' }}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bill.items && bill.items.map((item, index) => (
                            <tr key={index}>
                                <td style={{ color: 'white', fontWeight: '500' }}>
                                    {item.name}
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    {item.qty} <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{item.unit}</span>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    ₹ {item.price.toFixed(2)}
                                </td>
                                <td style={{ textAlign: 'right', color: 'white', fontWeight: '600' }}>
                                    ₹ {item.totalprice.toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="invoice-total-row">
                    <span style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>Total Amount</span>
                    <strong style={{ fontSize: '26px', color: 'white', background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        ₹ {bill.total.toFixed(2)}
                    </strong>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="btn-group" style={{ marginTop: '24px' }}>
                <button 
                    onClick={handleDownloadPdf} 
                    className="btn btn-primary" 
                    disabled={isDownloading || !bill.billno}
                >
                    {isDownloading ? "Downloading PDF..." : "📥 Download PDF"}
                </button>
                <button 
                    onClick={handlePrint} 
                    className="btn btn-secondary"
                >
                    🖨️ Print Invoice
                </button>
                <button 
                    onClick={onReset} 
                    className="btn btn-accent"
                >
                    ➕ New Bill
                </button>
            </div>

            {error && (
                <div className="msg-alert error" style={{ marginTop: '15px' }}>
                    {error}
                </div>
            )}
        </div>
    );
};

export default InvoiceView;
