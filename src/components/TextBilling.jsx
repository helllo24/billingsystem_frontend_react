import React, { useState } from 'react';
import { API } from '../services/api';

const TextBilling = ({ onBillGenerated }) => {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const text = query.trim();
        if (!text) return;

        setIsLoading(true);
        setError('');

        try {
            const data = await API.generateBillFromText(text);
            console.log("Text billing generated successfully:", data);
            onBillGenerated(data);
        } catch (err) {
            console.error(err);
            setError("❌ Failed to parse billing statement. Check your internet connection or backend server status.");
        } finally {
            setIsLoading(false);
        }
    };

    const loadSample = (sampleText) => {
        setQuery(sampleText);
    };

    return (
        <div className="glass-card" style={{ padding: '32px', animation: 'fadeIn 0.5s ease-out' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>Generate Bill from Text</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
                Type out what items you sold, their quantities, and their prices. Our AI engine will automatically parse and save the bill.
            </p>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="billingText">Billing Statement</label>
                    <textarea
                        id="billingText"
                        rows="4"
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: 'var(--border-radius-md)',
                            color: 'white',
                            fontSize: '15px',
                            outline: 'none',
                            resize: 'none',
                            transition: 'var(--transition-smooth)'
                        }}
                        placeholder="e.g. 5 kg apple for 100 rs each, and 2 kg onion for 40 rs total..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        disabled={isLoading}
                        required
                    />
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                        💡 Try these sample prompts:
                    </span>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ width: 'auto', padding: '6px 12px', fontSize: '12px' }}
                            onClick={() => loadSample("I sold 3 kg sugar at 40 rs per kg, and 2 litres of milk for 60 rs total.")}
                        >
                            Groceries 🛒
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ width: 'auto', padding: '6px 12px', fontSize: '12px' }}
                            onClick={() => loadSample("Customer bought 5 pieces apple for 150 rs.")}
                        >
                            Fruit Stand 🍎
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ width: 'auto', padding: '6px 12px', fontSize: '12px' }}
                            onClick={() => loadSample("2 kg potato 30 rs total, 1 kg tomato 40 rs.")}
                        >
                            Vegetables 🥔
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoading || !query.trim()}
                >
                    {isLoading ? "AI Parsing Bill..." : "Create Invoice"}
                </button>
            </form>

            {error && (
                <div className="msg-alert error" style={{ marginTop: '20px' }}>
                    {error}
                </div>
            )}
        </div>
    );
};

export default TextBilling;
