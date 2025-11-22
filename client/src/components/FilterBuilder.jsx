import { useState, useEffect } from 'react';

const OPERATORS = [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
    { value: 'contains', label: 'Contains' },
    { value: 'not_null', label: 'Not Null' },
    { value: 'regex', label: 'Regex' }
];

const DATA_TYPES = [
    { value: 'string', label: 'String' },
    { value: 'number', label: 'Number' },
    { value: 'date', label: 'Date' },
    { value: 'boolean', label: 'Boolean' }
];

export default function FilterBuilder({
    label,
    fields,
    value,
    onChange
}) {
    const [local, setLocal] = useState(value || { logic: 'AND', conditions: [] });
    const [incompleteCount, setIncompleteCount] = useState(0);

    useEffect(() => {
        const count = local.conditions.filter(c => !c.field || (c.operator !== 'not_null' && (c.value === undefined || (typeof c.value === 'string' && c.value.trim() === '')))).length;
        setIncompleteCount(count);
    }, [local]);

    const update = (next) => {
        setLocal(next);
        onChange(next);
    };

    const addCondition = () => {
        update({
            ...local,
            conditions: [
                ...local.conditions,
                { field: '', operator: 'equals', data_type: 'string', value: '' }
            ]
        });
    };

    const updateCondition = (idx, patch) => {
        const copy = [...local.conditions];
        copy[idx] = { ...copy[idx], ...patch };
        update({ ...local, conditions: copy });
    };

    const removeCondition = (idx) => {
        const copy = local.conditions.filter((_, i) => i !== idx);
        update({ ...local, conditions: copy });
    };

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">{label} Filters</h3>
                <select
                    aria-label="Group logic"
                    value={local.logic}
                    onChange={(e) => update({ ...local, logic: e.target.value })}
                    style={{ maxWidth: 140 }}
                >
                    <option value="AND">AND group</option>
                    <option value="OR">OR group</option>
                </select>
            </div>
            {incompleteCount > 0 && (
                <div className="alert alert-error mb-md" role="alert" style={{ fontSize: '.7rem' }}>
                    <span><strong>{incompleteCount}</strong> incomplete condition{incompleteCount > 1 ? 's' : ''} will be ignored.</span>
                </div>
            )}
            {local.conditions.length === 0 && (
                <p className="text-muted" style={{ fontSize: '.8rem' }}>No conditions. All rows will be kept.</p>
            )}
            {local.conditions.map((c, idx) => (
                <div key={idx} className={`card mb-md ${(!c.field || (c.operator !== 'not_null' && (c.value === undefined || (typeof c.value === 'string' && c.value.trim() === '')))) ? 'cond-invalid' : ''}`} style={{ padding: '12px' }}>
                    <div className="flex justify-between items-center mb-sm">
                        <strong style={{ fontSize: '.75rem', letterSpacing: '.05em' }}>Condition #{idx + 1}</strong>
                        <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() => removeCondition(idx)}
                            aria-label={`Remove condition ${idx + 1}`}
                        >Remove</button>
                    </div>
                    <div className="grid-2" style={{ gap: '12px' }}>
                        <div>
                            <label>Field</label>
                            <select value={c.field} onChange={(e) => updateCondition(idx, { field: e.target.value })}>
                                <option value="">Select field...</option>
                                {fields.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </div>
                        <div>
                            <label>Operator</label>
                            <select value={c.operator} onChange={(e) => updateCondition(idx, { operator: e.target.value })}>
                                {OPERATORS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label>Data Type</label>
                            <select value={c.data_type} onChange={(e) => updateCondition(idx, { data_type: e.target.value })}>
                                {DATA_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                        </div>
                        {c.operator !== 'not_null' && (
                            <div>
                                <label>Value</label>
                                <input
                                    className="input"
                                    value={c.value ?? ''}
                                    onChange={(e) => updateCondition(idx, { value: e.target.value })}
                                    placeholder="Enter value"
                                />
                            </div>
                        )}
                    </div>
                </div>
            ))}
            <button type="button" className="btn btn-primary btn-block" onClick={addCondition}>Add Condition</button>
        </div>
    );
}
