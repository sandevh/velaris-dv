export default function ResultsViewer({ result, onReset }) {
    const total = result.matched.length + result.mismatched.length + result.missing_in_velaris.length + result.missing_in_external.length;
    const matchPercentage = total > 0 ? ((result.matched.length / total) * 100).toFixed(1) : 0;

    // Safely render any value that might accidentally be an object/array
    const renderValue = (val) => {
        if (val === null || val === undefined || val === '') return '(empty)';
        if (typeof val === 'object') {
            try {
                return JSON.stringify(val);
            } catch (_) {
                return '[object]';
            }
        }
        return String(val);
    };

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">Comparison Results</h3>
                <button type="button" className="btn btn-danger" onClick={onReset}>Reset All</button>
            </div>
            <div className="stats-grid mb-lg">
                <div className="stat-card" aria-label="Matched rows">
                    <h4>Matched</h4>
                    <div className="stat-value" style={{ color: 'var(--color-success)' }}>{result.matched.length}</div>
                </div>
                <div className="stat-card" aria-label="Mismatched rows">
                    <h4>Mismatched</h4>
                    <div className="stat-value" style={{ color: 'var(--color-danger)' }}>{result.mismatched.length}</div>
                </div>
                <div className="stat-card" aria-label="Missing in Velaris">
                    <h4>Missing in Velaris</h4>
                    <div className="stat-value" style={{ color: 'var(--color-warning)' }}>{result.missing_in_velaris.length}</div>
                </div>
                <div className="stat-card" aria-label="Missing in External">
                    <h4>Missing in External</h4>
                    <div className="stat-value" style={{ color: 'var(--color-secondary)' }}>{result.missing_in_external.length}</div>
                </div>
                {result.filter_stats && (
                    <div className="stat-card" aria-label="External rows kept">
                        <h4>External Kept</h4>
                        <div className="stat-value" style={{ color: 'var(--color-primary)' }}>
                            {result.filter_stats.external.kept}/{result.filter_stats.external.original}
                        </div>
                    </div>
                )}
                {result.filter_stats && (
                    <div className="stat-card" aria-label="Velaris rows kept">
                        <h4>Velaris Kept</h4>
                        <div className="stat-value" style={{ color: 'var(--color-secondary)' }}>
                            {result.filter_stats.velaris.kept}/{result.filter_stats.velaris.original}
                        </div>
                    </div>
                )}
            </div>
            <div className="mb-lg" aria-label="Match rate">
                <div className="flex justify-between items-center mb-sm">
                    <strong>Match Rate</strong>
                    <span style={{ fontSize: '1.15rem' }}>{matchPercentage}%</span>
                </div>
                <div className="progress" role="progressbar" aria-valuenow={matchPercentage} aria-valuemin={0} aria-valuemax={100}>
                    <div className="progress-bar" style={{ width: `${matchPercentage}%` }} />
                </div>
            </div>
            {result.filter_stats && (
                <div className="mb-md" style={{ fontSize: '.7rem' }}>
                    <strong>Filtering Summary:</strong> External dropped {result.filter_stats.external.dropped}; Velaris dropped {result.filter_stats.velaris.dropped}.
                </div>
            )}
            {result.mismatched.length > 0 && (
                <div className="mb-md">
                    <h4 className="section-title" style={{ marginBottom: '8px' }}>Mismatch Details</h4>
                    <div className="table-wrapper">
                        <table className="table" aria-label="Mismatched field differences">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Differences</th>
                                </tr>
                            </thead>
                            <tbody>
                                {result.mismatched.map((m, idx) => (
                                    <tr key={idx}>
                                        <td>{m.id}</td>
                                        <td>
                                            {Object.entries(m.differences).map(([field, val]) => (
                                                <div key={field} style={{ marginBottom: '6px', padding: '6px 8px', background: '#fff', border: '1px solid var(--color-border)', borderRadius: '6px' }}>
                                                    <strong style={{ display: 'block', fontSize: '.75rem', letterSpacing: '.05em' }}>{field}</strong>
                                                    <div style={{ fontSize: '.7rem' }}>
                                                        <span style={{ display: 'inline-block', marginRight: '8px' }}>
                                                            External: <strong>{renderValue(val.external)}</strong>
                                                        </span>
                                                        <span style={{ display: 'inline-block' }}>
                                                            Velaris: <strong>{renderValue(val.velaris)}</strong>
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
