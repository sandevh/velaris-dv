export default function ScheduledComparisons() {
    return (
        <div>
            <section className="section">
                <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '16px' }}>⏰</div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '12px', color: 'var(--color-text)' }}>
                        Scheduled Comparisons
                    </h2>
                    <p style={{ fontSize: '1rem', color: 'var(--color-text-light)', marginBottom: '24px', maxWidth: '600px', margin: '0 auto' }}>
                        This feature will allow you to schedule automatic CSV comparisons at regular intervals.
                    </p>

                    <div style={{
                        background: 'var(--color-bg-hover)',
                        borderRadius: '8px',
                        padding: '24px',
                        marginTop: '32px',
                        textAlign: 'left',
                        maxWidth: '700px',
                        margin: '32px auto 0'
                    }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: 'var(--color-text)' }}>
                            🚀 Coming Soon Features:
                        </h3>
                        <ul style={{
                            listStyle: 'none',
                            padding: 0,
                            fontSize: '.9rem',
                            color: 'var(--color-text-light)',
                            lineHeight: '2'
                        }}>
                            <li>📅 Schedule comparisons (daily, weekly, monthly)</li>
                            <li>🔔 Email notifications for comparison results</li>
                            <li>📊 Historical comparison tracking</li>
                            <li>⚙️ Reusable comparison configurations</li>
                            <li>📈 Trend analysis and reporting</li>
                            <li>🔗 API integration for automated workflows</li>
                        </ul>
                    </div>

                    <div style={{ marginTop: '32px' }}>
                        <span style={{
                            display: 'inline-block',
                            padding: '8px 16px',
                            background: 'var(--color-warning)',
                            color: 'white',
                            borderRadius: '20px',
                            fontSize: '.85rem',
                            fontWeight: 600
                        }}>
                            🔨 Under Development
                        </span>
                    </div>
                </div>
            </section>
        </div>
    );
}
