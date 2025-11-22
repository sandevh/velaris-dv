import React, { useState } from "react";
import TransformationBuilder from "./TransformationBuilder";

// Sub-component for value mapping editor
function ValueMappingEditor({ label, valueMap, onAdd, onRemove }) {
    const [fromValue, setFromValue] = useState("");
    const [toValue, setToValue] = useState("");

    const handleAdd = () => {
        if (fromValue.trim() && toValue.trim()) {
            onAdd(fromValue.trim(), toValue.trim());
            setFromValue("");
            setToValue("");
        }
    };

    return (
        <div>
            <label style={{ fontWeight: 600, marginBottom: 8, display: 'block' }}>{label} Value Map</label>

            {/* Add new mapping */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <input
                    type="text"
                    placeholder="From value"
                    value={fromValue}
                    onChange={(e) => setFromValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                    style={{ flex: 1, fontSize: '.75rem', padding: '6px 8px' }}
                />
                <span style={{ alignSelf: 'center', color: 'var(--color-text-light)' }}>→</span>
                <input
                    type="text"
                    placeholder="To value"
                    value={toValue}
                    onChange={(e) => setToValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                    style={{ flex: 1, fontSize: '.75rem', padding: '6px 8px' }}
                />
                <button
                    type="button"
                    onClick={handleAdd}
                    className="btn btn-primary"
                    style={{ fontSize: '.7rem', padding: '6px 12px' }}
                >
                    Add
                </button>
            </div>

            {/* Display existing mappings */}
            {Object.keys(valueMap).length > 0 && (
                <div style={{
                    background: 'var(--color-bg-hover)',
                    padding: '8px',
                    borderRadius: '4px',
                    maxHeight: '150px',
                    overflowY: 'auto'
                }}>
                    {Object.entries(valueMap).map(([from, to]) => (
                        <div key={from} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '4px 8px',
                            marginBottom: '4px',
                            background: 'var(--color-bg)',
                            borderRadius: '3px',
                            fontSize: '.7rem'
                        }}>
                            <span>
                                <code style={{ background: 'var(--color-bg-hover)', padding: '2px 6px', borderRadius: '3px' }}>
                                    {from}
                                </code>
                                <span style={{ margin: '0 8px', color: 'var(--color-text-light)' }}>→</span>
                                <code style={{ background: 'var(--color-bg-hover)', padding: '2px 6px', borderRadius: '3px' }}>
                                    {to}
                                </code>
                            </span>
                            <button
                                type="button"
                                onClick={() => onRemove(from)}
                                className="btn btn-danger btn-ghost"
                                style={{ fontSize: '.7rem', padding: '2px 8px', marginLeft: '8px', color: '#e53e3e' }}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}
            {Object.keys(valueMap).length === 0 && (
                <div style={{
                    fontSize: '.65rem',
                    color: 'var(--color-text-light)',
                    fontStyle: 'italic',
                    padding: '8px'
                }}>
                    No value mappings defined
                </div>
            )}
        </div>
    );
}

export default function MappingBuilder({
    externalFields,
    velarisFields,
    mappings,
    setMappings,
    keyFields,
    setKeyFields,
    transformOptions = ["trim", "lower", "upper"],
    comparisonRules = [
        { value: "equals", label: "Equals" },
        { value: "case_insensitive_equals", label: "Case Insensitive" },
        { value: "contains", label: "Contains" }
    ],
    csvLabels = { first: "External", second: "Velaris" }
}) {
    // Helper to detect global JSON object
    const isGlobalJSONObject = (val) => val === JSON;

    // Ensure we always return arrays of strings or objects for rules
    const sanitizeStringArray = (val) => {
        if (!val || isGlobalJSONObject(val)) return [];
        if (!Array.isArray(val)) return [];
        return val.filter(v => typeof v === 'string');
    };

    const sanitizeRuleArray = (val) => {
        if (!val || isGlobalJSONObject(val)) return [];
        if (!Array.isArray(val)) return [];
        return val.filter(r => r && typeof r === 'object' && typeof r.value === 'string' && typeof r.label === 'string');
    };

    const safeExternalFields = sanitizeStringArray(externalFields);
    const safeVelarisFields = sanitizeStringArray(velarisFields);
    const safeTransformOptions = Array.isArray(transformOptions)
        ? transformOptions.filter(t => typeof t === 'string')
        : [];
    const safeComparisonRules = sanitizeRuleArray(comparisonRules);

    // Ensure all mappings have value_map properties
    React.useEffect(() => {
        const needsUpdate = mappings.some(m =>
            m.external_value_map === undefined || m.velaris_value_map === undefined
        );
        if (needsUpdate) {
            setMappings(mappings.map(m => ({
                ...m,
                external_value_map: m.external_value_map || {},
                velaris_value_map: m.velaris_value_map || {}
            })));
        }
    }, []);

    // Dev diagnostics
    if (import.meta?.env?.MODE !== 'production') {
        if (!window.__mappingBuilderLogged) {
            window.__mappingBuilderLogged = true;
            console.debug('[MappingBuilder] Prop types', {
                externalFieldsType: typeof externalFields,
                velarisFieldsType: typeof velarisFields,
                transformOptionsType: typeof transformOptions,
                comparisonRulesType: typeof comparisonRules,
                externalFieldsSample: Array.isArray(externalFields) ? externalFields.slice(0, 5) : externalFields,
                velarisFieldsSample: Array.isArray(velarisFields) ? velarisFields.slice(0, 5) : velarisFields,
                transformOptionsSample: Array.isArray(transformOptions) ? transformOptions.slice(0, 5) : transformOptions,
                comparisonRulesSample: Array.isArray(comparisonRules) ? comparisonRules.slice(0, 5) : comparisonRules
            });
        }
    }

    if (safeTransformOptions.length !== transformOptions.length || safeComparisonRules.length !== comparisonRules.length) {
        const invalidTransforms = (transformOptions || []).filter(t => typeof t !== 'string');
        const invalidRules = (comparisonRules || []).filter(r => !r || typeof r.value !== 'string' || typeof r.label !== 'string');
        if (invalidTransforms.length || invalidRules.length) {
            console.warn('MappingBuilder sanitized invalid items', { invalidTransforms, invalidRules });
        }
    }

    // Helper to force string values
    const safeString = (val) => {
        if (typeof val === "string" || typeof val === "number") return val;
        return "";
    };

    const addMapping = () => {
        setMappings([
            ...mappings,
            {
                external_field: "",
                velaris_field: "",
                rule: "equals",
                external_transforms: [],
                velaris_transforms: [],
                external_custom: "",
                velaris_custom: "",
                external_value_map: {},
                velaris_value_map: {}
            }
        ]);
    };

    const updateMapping = (index, field, value) => {
        const newMappings = [...mappings];
        newMappings[index][field] = value;
        setMappings(newMappings);
    };

    const toggleTransform = (index, fieldGroup, transform) => {
        const newMappings = [...mappings];
        const arr = newMappings[index][fieldGroup];
        if (arr.includes(transform)) {
            newMappings[index][fieldGroup] = arr.filter(t => t !== transform);
        } else {
            newMappings[index][fieldGroup] = [...arr, transform];
        }
        setMappings(newMappings);
    };

    const removeMapping = (index) => {
        const newMappings = mappings.filter((_, i) => i !== index);
        setMappings(newMappings);
    };

    const addValueMapping = (mappingIdx, fieldGroup, fromValue, toValue) => {
        const newMappings = [...mappings];
        const valueMapKey = `${fieldGroup}_value_map`;
        if (!newMappings[mappingIdx][valueMapKey]) {
            newMappings[mappingIdx][valueMapKey] = {};
        }
        newMappings[mappingIdx][valueMapKey][fromValue] = toValue;
        setMappings(newMappings);
    };

    const removeValueMapping = (mappingIdx, fieldGroup, fromValue) => {
        const newMappings = [...mappings];
        const valueMapKey = `${fieldGroup}_value_map`;
        if (newMappings[mappingIdx][valueMapKey]) {
            delete newMappings[mappingIdx][valueMapKey][fromValue];
            setMappings(newMappings);
        }
    };

    const getEffectivePipeline = (mapping, fieldGroup) => {
        const customKey = `${fieldGroup}_custom`;
        const valueMapKey = `${fieldGroup}_value_map`;
        let pipeline = mapping[customKey] || "";

        // If there's a value map, append it to the pipeline
        const valueMap = mapping[valueMapKey];
        if (valueMap && Object.keys(valueMap).length > 0) {
            const mapStr = `map(${JSON.stringify(valueMap)})`;
            pipeline = pipeline ? `${pipeline}|${mapStr}` : mapStr;
        }

        return pipeline;
    };

    return (
        <div className="card">
            {/* Key Fields */}
            <div className="card-header">
                <h3 className="card-title">Key Fields</h3>
            </div>
            <div className="grid-2 mb-lg">
                <div>
                    <label>{csvLabels.first} Key Field</label>
                    <select
                        value={safeString(keyFields.external_field)}
                        onChange={(e) => setKeyFields({ ...keyFields, external_field: e.target.value })}
                    >
                        <option value="">Select a key field...</option>
                        {safeExternalFields.map((f) => (<option key={f} value={f}>{f}</option>))}
                    </select>
                </div>
                <div>
                    <label>{csvLabels.second} Key Field</label>
                    <select
                        value={safeString(keyFields.velaris_field)}
                        onChange={(e) => setKeyFields({ ...keyFields, velaris_field: e.target.value })}
                    >
                        <option value="">Select a key field...</option>
                        {safeVelarisFields.map((f) => (<option key={f} value={f}>{f}</option>))}
                    </select>
                </div>
            </div>

            <div className="alert mb-lg" role="note">
                <div><strong>Note:</strong> Key fields identify rows; do not remap them below.</div>
            </div>

            {/* Field Mappings */}
            <h4 className="section-title" style={{ marginBottom: '8px' }}>Field Mappings</h4>
            {mappings.map((m, idx) => (
                <div key={idx} className="card mb-md" style={{ padding: '16px' }}>
                    <div className="card-header" style={{ marginBottom: '12px' }}>
                        <h5 className="card-title" style={{ fontSize: '1rem' }}>Mapping #{idx + 1}</h5>
                        <button
                            type="button"
                            aria-label={`Remove mapping ${idx + 1}`}
                            className="btn btn-danger"
                            onClick={() => removeMapping(idx)}
                        >Remove</button>
                    </div>
                    <div className="grid-2" style={{ gap: '12px' }}>
                        <div>
                            <label>{csvLabels.first} Field</label>
                            <select
                                value={safeString(m.external_field)}
                                onChange={(e) => updateMapping(idx, "external_field", e.target.value)}
                            >
                                <option value="">Select field...</option>
                                {safeExternalFields.filter(f => f !== keyFields.external_field).map((f) => (<option key={f} value={f}>{f}</option>))}
                            </select>
                        </div>
                        <div>
                            <label>{csvLabels.second} Field</label>
                            <select
                                value={safeString(m.velaris_field)}
                                onChange={(e) => updateMapping(idx, "velaris_field", e.target.value)}
                            >
                                <option value="">Select field...</option>
                                {safeVelarisFields.filter(f => f !== keyFields.velaris_field).map((f) => (<option key={f} value={f}>{f}</option>))}
                            </select>
                        </div>
                        <div>
                            <label>Comparison Rule</label>
                            <select
                                value={safeString(m.rule)}
                                onChange={(e) => updateMapping(idx, "rule", e.target.value)}
                            >
                                {safeComparisonRules.map(rule => (
                                    <option key={rule.value} value={rule.value}>{rule.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Transforms */}
                    <div className="grid-2 mt-md" style={{ gap: '16px' }}>
                        <div>
                            <label>{csvLabels.first} Transforms</label>
                            <div className="flex flex-wrap gap-sm">
                                {safeTransformOptions.map(t => (
                                    <label key={t} className="checkbox-pill">
                                        <input
                                            type="checkbox"
                                            checked={m.external_transforms.includes(t)}
                                            onChange={() => toggleTransform(idx, "external_transforms", t)}
                                        />
                                        {t}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label>{csvLabels.second} Transforms</label>
                            <div className="flex flex-wrap gap-sm">
                                {safeTransformOptions.map(t => (
                                    <label key={t} className="checkbox-pill">
                                        <input
                                            type="checkbox"
                                            checked={m.velaris_transforms.includes(t)}
                                            onChange={() => toggleTransform(idx, "velaris_transforms", t)}
                                        />
                                        {t}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Advanced Transformations */}
                    <details style={{ marginTop: '16px' }}>
                        <summary style={{ cursor: 'pointer', fontSize: '.8rem', fontWeight: 600 }}>⚙️ Advanced Transformations (Optional)</summary>
                        <div style={{ fontSize: '.7rem', color: 'var(--color-text-light)', marginTop: 8, marginBottom: 12 }}>
                            Transform field values before comparison using custom pipelines
                        </div>
                        <div className="grid-2" style={{ gap: '16px', marginTop: '12px' }}>
                            <TransformationBuilder
                                label={csvLabels.first}
                                value={m.external_custom || ""}
                                onChange={(val) => updateMapping(idx, 'external_custom', val)}
                                fieldName={m.external_field}
                                csvType={csvLabels.first}
                                sampleValues={[]}
                            />
                            <TransformationBuilder
                                label={csvLabels.second}
                                value={m.velaris_custom || ""}
                                onChange={(val) => updateMapping(idx, 'velaris_custom', val)}
                                fieldName={m.velaris_field}
                                csvType={csvLabels.second}
                                sampleValues={[]}
                            />
                        </div>
                    </details>

                    {/* Value Mapping */}
                    <details style={{ marginTop: '12px' }}>
                        <summary style={{ cursor: 'pointer', fontSize: '.8rem', fontWeight: 600 }}>🔗 Value Mapping (Optional)</summary>
                        <div style={{ fontSize: '.7rem', color: 'var(--color-text-light)', marginTop: 8, marginBottom: 12 }}>
                            Map specific values from one format to another (e.g., 1 → user_1, 2 → user_2)
                        </div>
                        <div className="grid-2" style={{ gap: '16px', marginTop: '12px' }}>
                            <ValueMappingEditor
                                label={csvLabels.first}
                                valueMap={m.external_value_map || {}}
                                onAdd={(from, to) => addValueMapping(idx, 'external', from, to)}
                                onRemove={(from) => removeValueMapping(idx, 'external', from)}
                            />
                            <ValueMappingEditor
                                label={csvLabels.second}
                                valueMap={m.velaris_value_map || {}}
                                onAdd={(from, to) => addValueMapping(idx, 'velaris', from, to)}
                                onRemove={(from) => removeValueMapping(idx, 'velaris', from)}
                            />
                        </div>
                    </details>
                </div>
            ))}

            {/* Warnings if global JSON object is passed */}
            {safeExternalFields.length === 0 && isGlobalJSONObject(externalFields) && (
                <div className="alert alert-error mt-md" role="alert" style={{ fontSize: '.7rem' }}>
                    <strong>Invalid externalFields value detected.</strong> A global JSON object was provided instead of an array of field names.
                </div>
            )}
            {safeVelarisFields.length === 0 && isGlobalJSONObject(velarisFields) && (
                <div className="alert alert-error mt-md" role="alert" style={{ fontSize: '.7rem' }}>
                    <strong>Invalid velarisFields value detected.</strong> A global JSON object was provided instead of an array of field names.
                </div>
            )}

            <button type="button" onClick={addMapping} className="btn btn-primary btn-block">Add New Mapping</button>
        </div>
    );
}
