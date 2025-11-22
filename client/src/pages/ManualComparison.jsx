import { useState } from "react";
import CSVUploader from "../components/CSVUploader";
import FilterBuilder from "../components/FilterBuilder";
import MappingBuilder from "../components/MappingBuilder";
import ResultsViewer from "../components/ResultsViewer";
import axios from "axios";

// Dynamic configuration - change these to customize the app
const APP_CONFIG = {
    apiUrl: import.meta.env.VITE_API_URL || "http://localhost:8000",
    apiEndpoint: "/compare/external-velaris",
    csvLabels: {
        first: import.meta.env.VITE_CSV1_LABEL || "External CSV",
        second: import.meta.env.VITE_CSV2_LABEL || "Velaris CSV"
    },
    transformOptions: (import.meta.env.VITE_TRANSFORM_OPTIONS || "trim,lower,upper").split(","),
    comparisonRules: JSON.parse(import.meta.env.VITE_COMPARISON_RULES || JSON.stringify([
        { value: "equals", label: "Equals" },
        { value: "case_insensitive_equals", label: "Case Insensitive" },
        { value: "contains", label: "Contains" }
    ]))
};

export default function ManualComparison() {
    const [externalCSV, setExternalCSV] = useState(null);
    const [velarisCSV, setVelarisCSV] = useState(null);
    const [externalFields, setExternalFields] = useState([]);
    const [velarisFields, setVelarisFields] = useState([]);
    const [mappings, setMappings] = useState([]);
    const [externalFilter, setExternalFilter] = useState({ logic: 'AND', conditions: [] });
    const [velarisFilter, setVelarisFilter] = useState({ logic: 'AND', conditions: [] });
    const [keyFields, setKeyFields] = useState({
        external_field: "",
        velaris_field: "",
        external_custom: "",
        velaris_custom: ""
    });
    const [compareOnlyMapped, setCompareOnlyMapped] = useState(true);
    const [result, setResult] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Filter out empty mappings and merge value maps into pipelines
    const getValidMappings = () => {
        return mappings
            .filter(m => m.external_field.trim() !== "" && m.velaris_field.trim() !== "")
            .map(m => {
                const processed = { ...m };

                // Merge external value map into custom pipeline
                if (m.external_value_map && Object.keys(m.external_value_map).length > 0) {
                    const mapStr = `map(${JSON.stringify(m.external_value_map)})`;
                    processed.external_custom = m.external_custom
                        ? `${m.external_custom}|${mapStr}`
                        : mapStr;
                }

                // Merge velaris value map into custom pipeline
                if (m.velaris_value_map && Object.keys(m.velaris_value_map).length > 0) {
                    const mapStr = `map(${JSON.stringify(m.velaris_value_map)})`;
                    processed.velaris_custom = m.velaris_custom
                        ? `${m.velaris_custom}|${mapStr}`
                        : mapStr;
                }

                // Remove the value_map properties before sending to backend
                delete processed.external_value_map;
                delete processed.velaris_value_map;

                return processed;
            });
    };

    const sanitizeFilter = (filter) => {
        if (!filter || !filter.conditions) return null;
        const cleaned = filter.conditions.filter(c => c.field && (c.operator === 'not_null' || (c.value !== undefined && String(c.value).trim() !== '')));
        if (!cleaned.length) return null;
        return { logic: filter.logic || 'AND', conditions: cleaned };
    };

    const handleSubmit = async () => {
        if (!externalCSV || !velarisCSV || !keyFields.external_field || !keyFields.velaris_field) {
            setError("Please upload both CSV files and select key fields");
            return;
        }

        const validMappings = getValidMappings();
        if (validMappings.length === 0) {
            setError("Please add at least one valid field mapping");
            return;
        }

        setLoading(true);
        setError(null);
        const formData = new FormData();
        formData.append("external_csv", externalCSV);
        formData.append("velaris_csv", velarisCSV);
        const sanitizedExternal = sanitizeFilter(externalFilter);
        const sanitizedVelaris = sanitizeFilter(velarisFilter);
        formData.append("mapping_config", JSON.stringify({
            key_fields: keyFields,
            mappings: validMappings,
            compare_only_mapped: compareOnlyMapped,
            filters: {
                external: sanitizedExternal,
                velaris: sanitizedVelaris
            }
        }));

        try {
            const res = await axios.post(`${APP_CONFIG.apiUrl}${APP_CONFIG.apiEndpoint}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setResult(res.data);
            setShowPreview(false);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || "Error comparing CSVs. Please check your configuration and try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setExternalCSV(null);
        setVelarisCSV(null);
        setExternalFields([]);
        setVelarisFields([]);
        setMappings([]);
        setExternalFilter({ logic: 'AND', conditions: [] });
        setVelarisFilter({ logic: 'AND', conditions: [] });
        setKeyFields({
            external_field: "",
            velaris_field: "",
            external_custom: "",
            velaris_custom: ""
        });
        setResult(null);
        setShowPreview(false);
        setError(null);
    };

    // Additional front-end sanitization so components downstream never see invalid structures
    const sanitizeStringArray = (val) => {
        if (!val || val === JSON) return [];
        if (!Array.isArray(val)) return [];
        return val.filter(v => typeof v === 'string');
    };
    const sanitizeRuleArray = (val) => {
        if (!val || val === JSON) return [];
        if (!Array.isArray(val)) return [];
        return val.filter(r => r && typeof r === 'object' && typeof r.value === 'string' && typeof r.label === 'string');
    };

    const safeExternalFields = sanitizeStringArray(externalFields);
    const safeVelarisFields = sanitizeStringArray(velarisFields);
    const safeTransformOptions = sanitizeStringArray(APP_CONFIG.transformOptions);
    const safeComparisonRules = sanitizeRuleArray(APP_CONFIG.comparisonRules);

    return (
        <div>
            {error && (
                <div className="alert alert-error mb-lg" role="alert">
                    <div style={{ flex: 1 }}>
                        <strong style={{ display: 'block', marginBottom: 4 }}>Error</strong>
                        <span>{error}</span>
                    </div>
                    <button aria-label="Dismiss error" className="btn btn-danger btn-ghost" onClick={() => setError(null)}>×</button>
                </div>
            )}

            <section className="section">
                <h2 className="section-title">Upload CSV Files</h2>
                <div className="grid-2">
                    <CSVUploader
                        label={APP_CONFIG.csvLabels.first}
                        setFile={setExternalCSV}
                        setFields={setExternalFields}
                        fileName={externalCSV?.name}
                    />
                    <CSVUploader
                        label={APP_CONFIG.csvLabels.second}
                        setFile={setVelarisCSV}
                        setFields={setVelarisFields}
                        fileName={velarisCSV?.name}
                    />
                </div>
            </section>

            {safeExternalFields.length > 0 && safeVelarisFields.length > 0 && (
                <section className="section fade-in">
                    <h2 className="section-title">Optional Row Filters</h2>
                    <div className="grid-2">
                        <FilterBuilder
                            label={APP_CONFIG.csvLabels.first}
                            fields={safeExternalFields}
                            value={externalFilter}
                            onChange={setExternalFilter}
                        />
                        <FilterBuilder
                            label={APP_CONFIG.csvLabels.second}
                            fields={safeVelarisFields}
                            value={velarisFilter}
                            onChange={setVelarisFilter}
                        />
                    </div>
                </section>
            )}

            {safeExternalFields.length > 0 && safeVelarisFields.length > 0 && (
                <section className="section fade-in">
                    <h2 className="section-title">Configure Mapping</h2>
                    <MappingBuilder
                        externalFields={safeExternalFields}
                        velarisFields={safeVelarisFields}
                        mappings={mappings}
                        setMappings={setMappings}
                        keyFields={keyFields}
                        setKeyFields={setKeyFields}
                        transformOptions={safeTransformOptions}
                        comparisonRules={safeComparisonRules}
                        csvLabels={APP_CONFIG.csvLabels}
                    />
                </section>
            )}

            {safeExternalFields.length > 0 && safeVelarisFields.length > 0 && keyFields.external_field && keyFields.velaris_field && (
                <section className="section fade-in">
                    <div style={{ marginBottom: '16px' }}>
                        <label className="checkbox-pill" style={{ display: 'inline-flex', alignItems: 'center', padding: '8px 16px', fontSize: '0.9rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={compareOnlyMapped}
                                onChange={(e) => setCompareOnlyMapped(e.target.checked)}
                                style={{ marginRight: '8px' }}
                            />
                            <span>Compare only mapped fields (ignore unmapped columns)</span>
                        </label>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: '4px', marginLeft: '28px' }}>
                            {compareOnlyMapped ? '✓ Will compare only the fields you added in mappings below' : '⚠ Will compare ALL columns in both CSVs (may show many differences)'}
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-md items-center">
                        <button
                            className="btn btn-primary"
                            onClick={handleSubmit}
                            disabled={loading || getValidMappings().length === 0}
                        >
                            {loading ? 'Comparing…' : 'Compare CSVs'}
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={() => setShowPreview(!showPreview)}
                            disabled={getValidMappings().length === 0}
                        >
                            {showPreview ? 'Hide Config' : 'Show Config'}
                        </button>
                        <button
                            className="btn btn-danger"
                            onClick={handleReset}
                        >
                            Reset All
                        </button>
                    </div>
                    {getValidMappings().length === 0 && mappings.length > 0 && (
                        <div className="alert" role="note" style={{ marginTop: '12px', fontSize: '.85rem' }}>
                            <strong>Note:</strong> Complete at least one field mapping to enable comparison.
                        </div>
                    )}
                </section>
            )}

            {showPreview && (
                <section className="section fade-in">
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Configuration Preview</h3>
                        </div>
                        <pre className="pre-block" aria-label="Configuration JSON">
                            {JSON.stringify({
                                key_fields: keyFields,
                                mappings: getValidMappings(),
                                compare_only_mapped: compareOnlyMapped,
                                filters: {
                                    external: sanitizeFilter(externalFilter),
                                    velaris: sanitizeFilter(velarisFilter)
                                }
                            }, null, 2)}
                        </pre>
                    </div>
                </section>
            )}

            {result && (
                <section className="section fade-in">
                    <ResultsViewer result={result} onReset={handleReset} />
                </section>
            )}
        </div>
    );
}
