import { useState } from "react";

export default function Dashboard({ children, activeTab, onTabChange }) {
    const tabs = [
        { id: "manual", label: "Manual CSV Comparison", icon: "📊" },
        { id: "scheduled", label: "Scheduled Comparisons", icon: "⏰" }
    ];

    return (
        <div>
            <div className="app-container">
                <header className="app-header">
                    <h1>VELARIS DV TOOL</h1>
                    <p>Data Validation & Comparison Platform</p>
                </header>

                {/* Navigation Tabs */}
                <nav style={{
                    background: 'var(--color-bg)',
                    borderRadius: '8px',
                    padding: '8px',
                    marginBottom: '24px',
                    display: 'flex',
                    gap: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={activeTab === tab.id ? "btn btn-primary" : "btn btn-secondary"}
                            style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                padding: '12px 16px',
                                fontSize: '0.95rem',
                                fontWeight: activeTab === tab.id ? 600 : 500,
                                transition: 'all 0.2s ease',
                                border: activeTab === tab.id ? '2px solid var(--color-primary)' : '2px solid transparent'
                            }}
                        >
                            <span style={{ fontSize: '1.2rem' }}>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </nav>

                {/* Page Content */}
                <div className="fade-in">
                    {children}
                </div>
            </div>
        </div>
    );
}
