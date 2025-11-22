import { useState } from "react";
import GeminiAssistant from "./GeminiAssistant";

// Function templates for quick start
const FUNCTION_TEMPLATES = {
    basic: `// Basic transformation
value.toString().trim().toLowerCase()`,

    prefix: `// Add prefix
"user_" + value`,

    extract: `// Extract numbers only
value.toString().replace(/[^0-9]/g, '')`,

    parse: `// Parse and format
const id = parseInt(value);
return "user_" + id;`,

    conditional: `// Conditional logic
if (value === "1") return "active";
if (value === "0") return "inactive";
return value;`,

    complex: `// Complex transformation
const str = value.toString().trim();
const parts = str.split('-');
return parts[0].toUpperCase();`
};

export default function TransformationBuilder({ label, value, onChange, onTest, fieldName, csvType, sampleValues }) {
    const [testInput, setTestInput] = useState("");
    const [testOutput, setTestOutput] = useState(null);
    const [testError, setTestError] = useState(null);
    const [showTemplates, setShowTemplates] = useState(false);
    const [showGemini, setShowGemini] = useState(false);

    const runTest = () => {
        setTestError(null);
        setTestOutput(null);

        if (!value.trim()) {
            setTestError("Please write a transformation function first");
            return;
        }

        if (!testInput.trim()) {
            setTestError("Please enter a test value");
            return;
        }

        try {
            let code = value.trim();

            // If the code doesn't contain 'return' and is a single expression, wrap it with return
            const hasReturn = code.includes('return');
            const hasMultipleStatements = code.includes(';') || code.includes('\n');

            if (!hasReturn && !hasMultipleStatements) {
                // Single expression without return - auto-add return
                code = `return ${code}`;
            }

            // Create a function from the user's code
            // eslint-disable-next-line no-new-func
            const transformFn = new Function('value', code);
            const result = transformFn(testInput);
            setTestOutput(result);
        } catch (error) {
            setTestError(error.message);
        }
    };

    const useTemplate = (template) => {
        onChange(template);
        setShowTemplates(false);
    };

    const clearFunction = () => {
        onChange("");
        setTestOutput(null);
        setTestError(null);
    };

    return (
        <div>
            <label style={{ fontWeight: 600, marginBottom: 8, display: 'block' }}>
                {label} Custom Transformation
            </label>

            {/* Function Editor */}
            <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '.75rem', color: 'var(--color-text-light)' }}>
                        Write JavaScript to transform each value:
                    </span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                            type="button"
                            onClick={() => setShowGemini(true)}
                            className="btn btn-primary"
                            style={{ fontSize: '.7rem', padding: '4px 10px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
                            title="Get AI assistance"
                        >
                            ✨ AI Help
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowTemplates(!showTemplates)}
                            className="btn btn-ghost"
                            style={{ fontSize: '.7rem', padding: '4px 10px' }}
                        >
                            📋 Templates
                        </button>
                        {value && (
                            <button
                                type="button"
                                onClick={clearFunction}
                                className="btn btn-danger btn-ghost"
                                style={{ fontSize: '.7rem', padding: '4px 10px', background: 'red' }}
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Templates Dropdown */}
                {showTemplates && (
                    <div style={{
                        background: 'var(--color-bg-hover)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '6px',
                        padding: '12px',
                        marginBottom: '12px',
                        maxHeight: '300px',
                        overflowY: 'auto'
                    }}>
                        <div style={{ fontSize: '.8rem', fontWeight: 600, marginBottom: '8px' }}>
                            Click a template to use it:
                        </div>
                        {Object.entries(FUNCTION_TEMPLATES).map(([key, template]) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => useTemplate(template)}
                                className="btn btn-ghost"
                                style={{
                                    width: '100%',
                                    textAlign: 'left',
                                    padding: '8px',
                                    marginBottom: '6px',
                                    fontSize: '.7rem',
                                    fontFamily: 'monospace',
                                    whiteSpace: 'pre-wrap',
                                    background: 'var(--color-bg)'
                                }}
                            >
                                {template}
                            </button>
                        ))}
                    </div>
                )}

                <textarea
                    rows={6}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="// Transform the 'value' variable and return the result&#10;// Example:&#10;return value.toString().trim().toLowerCase();"
                    style={{
                        width: '100%',
                        fontSize: '.8rem',
                        fontFamily: 'monospace',
                        padding: '10px',
                        background: 'var(--color-bg)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '4px',
                        resize: 'vertical'
                    }}
                />
                <div style={{ fontSize: '.65rem', color: 'var(--color-text-light)', marginTop: '4px' }}>
                    💡 Use <code style={{ background: 'var(--color-bg-hover)', padding: '2px 4px', borderRadius: '3px' }}>value</code> to access the field value. Return the transformed result.
                </div>
            </div>

            {/* Test Section */}
            <details open style={{
                background: 'var(--color-bg-hover)',
                padding: '12px',
                borderRadius: '6px',
                marginBottom: '12px'
            }}>
                <summary style={{ cursor: 'pointer', fontSize: '.8rem', fontWeight: 600, marginBottom: '12px' }}>
                    🧪 Test Your Function
                </summary>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '.75rem', display: 'block', marginBottom: '4px' }}>
                            Test Input:
                        </label>
                        <input
                            type="text"
                            value={testInput}
                            onChange={(e) => setTestInput(e.target.value)}
                            placeholder="e.g., user_123"
                            style={{ width: '100%', fontSize: '.8rem', padding: '8px' }}
                            onKeyPress={(e) => e.key === 'Enter' && runTest()}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '.75rem', display: 'block', marginBottom: '4px' }}>
                            Output:
                        </label>
                        <div style={{
                            background: testError ? '#fee' : testOutput !== null ? '#efe' : 'var(--color-bg)',
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid var(--color-border)',
                            fontSize: '.8rem',
                            fontFamily: 'monospace',
                            minHeight: '38px',
                            display: 'flex',
                            alignItems: 'center',
                            color: testError ? '#c33' : testOutput !== null ? '#2a2' : 'var(--color-text-light)'
                        }}>
                            {testError ? `❌ Error: ${testError}` :
                                testOutput !== null ? `✅ ${JSON.stringify(testOutput)}` :
                                    '(run test to see output)'}
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={runTest}
                    className="btn btn-primary"
                    style={{ fontSize: '.75rem', padding: '6px 14px' }}
                >
                    ▶ Run Test
                </button>
            </details>

            {/* Help Text */}
            <div style={{
                fontSize: '.7rem',
                color: 'var(--color-text-light)',
                background: 'var(--color-bg-hover)',
                padding: '8px',
                borderRadius: '4px'
            }}>
                <strong>Quick Reference:</strong>
                <div style={{ marginTop: '4px', lineHeight: '1.6' }}>
                    • <code style={{ background: 'var(--color-bg)', padding: '1px 4px' }}>value.toString()</code> - Convert to string<br />
                    • <code style={{ background: 'var(--color-bg)', padding: '1px 4px' }}>value.trim()</code> - Remove spaces<br />
                    • <code style={{ background: 'var(--color-bg)', padding: '1px 4px' }}>value.toLowerCase()</code> - Lowercase<br />
                    • <code style={{ background: 'var(--color-bg)', padding: '1px 4px' }}>value.replace(old, new)</code> - Replace text<br />
                    • <code style={{ background: 'var(--color-bg)', padding: '1px 4px' }}>parseInt(value)</code> - Parse as number<br />
                    • <code style={{ background: 'var(--color-bg)', padding: '1px 4px' }}>"prefix_" + value</code> - Add prefix
                </div>
            </div>

            {/* Gemini AI Assistant Modal */}
            <GeminiAssistant
                isOpen={showGemini}
                onClose={() => setShowGemini(false)}
                onApplyCode={(code) => onChange(code)}
                fieldName={fieldName || "Field"}
                csvType={csvType || label}
                sampleValues={sampleValues || []}
            />
        </div>
    );
}
