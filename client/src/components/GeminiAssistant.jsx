import { useState } from "react";

export default function GeminiAssistant({
    isOpen,
    onClose,
    onApplyCode,
    fieldName,
    csvType,
    sampleValues = []
}) {
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async () => {
        if (!prompt.trim()) {
            setError("Please enter a prompt");
            return;
        }

        setLoading(true);
        setError(null);
        setResponse(null);

        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

            if (!apiKey) {
                throw new Error("Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file");
            }

            const contextPrompt = `
You are a JavaScript transformation function generator for a CSV comparison tool.

Context:
- Field: "${fieldName}" (${csvType})
- Sample values: ${sampleValues.length > 0 ? sampleValues.slice(0, 5).join(", ") : "No samples available"}

User Request: ${prompt}

Generate a JavaScript function that transforms the 'value' variable.
Rules:
- Use simple JavaScript (no ES6+ features like arrow functions)
- Access the input as 'value' variable
- Return the transformed result
- Keep it simple and efficient
- Add comments to explain the logic

Respond ONLY with the JavaScript code, no explanations before or after.
`;

            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: contextPrompt }]
                    }]
                })
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(`API Error: ${res.status} - ${errorData.error?.message || res.statusText}`);
            }

            const data = await res.json();
            const generatedCode = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!generatedCode) {
                throw new Error("No code generated from Gemini");
            }

            // Clean up the code (remove markdown code blocks if present)
            let cleanCode = generatedCode.trim();
            cleanCode = cleanCode.replace(/```javascript\n?/g, '').replace(/```\n?/g, '');

            setResponse(cleanCode);
        } catch (err) {
            console.error("Gemini API error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = () => {
        if (response) {
            onApplyCode(response);
            onClose();
        }
    };

    const handleReset = () => {
        setPrompt("");
        setResponse(null);
        setError(null);
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
        }}>
            <div style={{
                background: 'var(--color-bg)',
                borderRadius: '12px',
                padding: '24px',
                maxWidth: '700px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.5rem' }}>✨</span>
                        Gemini AI Assistant
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-ghost"
                        style={{ fontSize: '1.2rem', padding: '4px 8px' }}
                    >
                        ×
                    </button>
                </div>

                {/* Context Info */}
                <div style={{
                    background: 'var(--color-bg-hover)',
                    padding: '12px',
                    borderRadius: '6px',
                    marginBottom: '16px',
                    fontSize: '.85rem'
                }}>
                    <div><strong>Field:</strong> {fieldName} ({csvType})</div>
                    {sampleValues.length > 0 && (
                        <div style={{ marginTop: '4px' }}>
                            <strong>Sample values:</strong> {sampleValues.slice(0, 3).join(", ")}
                            {sampleValues.length > 3 && "..."}
                        </div>
                    )}
                </div>

                {/* Prompt Input */}
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '.9rem' }}>
                        Describe the transformation you need:
                    </label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Example: Extract only numbers from the value and convert to integer"
                        rows={4}
                        style={{
                            width: '100%',
                            padding: '10px',
                            fontSize: '.85rem',
                            borderRadius: '6px',
                            border: '1px solid var(--color-border)',
                            resize: 'vertical'
                        }}
                        disabled={loading}
                    />
                </div>

                {/* Generate Button */}
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading || !prompt.trim()}
                    className="btn btn-primary"
                    style={{ marginBottom: '16px', width: '100%' }}
                >
                    {loading ? '🤔 Thinking...' : '✨ Generate Code'}
                </button>

                {/* Error Display */}
                {error && (
                    <div style={{
                        background: '#fee',
                        color: '#c33',
                        padding: '12px',
                        borderRadius: '6px',
                        marginBottom: '16px',
                        fontSize: '.85rem'
                    }}>
                        <strong>Error:</strong> {error}
                    </div>
                )}

                {/* Response Display */}
                {response && (
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '.9rem' }}>
                            Generated Code:
                        </label>
                        <pre style={{
                            background: 'var(--color-bg-hover)',
                            padding: '12px',
                            borderRadius: '6px',
                            fontSize: '.8rem',
                            fontFamily: 'monospace',
                            overflow: 'auto',
                            maxHeight: '300px',
                            border: '1px solid var(--color-border)'
                        }}>
                            {response}
                        </pre>
                    </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    {response && (
                        <>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="btn btn-secondary"
                            >
                                Try Again
                            </button>
                            <button
                                type="button"
                                onClick={handleApply}
                                className="btn btn-primary"
                            >
                                ✓ Apply Code
                            </button>
                        </>
                    )}
                    {!response && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-secondary"
                        >
                            Cancel
                        </button>
                    )}
                </div>

                {/* Help Text */}
                <div style={{
                    marginTop: '16px',
                    fontSize: '.75rem',
                    color: 'var(--color-text-light)',
                    borderTop: '1px solid var(--color-border)',
                    paddingTop: '12px'
                }}>
                    <strong>💡 Tips:</strong>
                    <ul style={{ margin: '8px 0', paddingLeft: '20px', lineHeight: '1.6' }}>
                        <li>Be specific about what you want to transform</li>
                        <li>Mention the input format if relevant</li>
                        <li>Example: "Remove 'user_' prefix and convert to number"</li>
                        <li>Example: "Convert date from DD/MM/YYYY to YYYY-MM-DD"</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
