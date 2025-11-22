export default function MappingBuilder({ externalFields, velarisFields, mappings, setMappings, keyFields, setKeyFields }) {
    const addMapping = () => {
        setMappings([...mappings, { external: "", velaris: "", rule: "equals", transform: [] }]);
    };

    const updateMapping = (index, field, value) => {
        const newMappings = [...mappings];
        newMappings[index][field] = value;
        setMappings(newMappings);
    };

    const removeMapping = (index) => {
        const newMappings = mappings.filter((_, i) => i !== index);
        setMappings(newMappings);
    };

    return (
        <div className="mb-4 p-4 border rounded bg-white">
            <h2 className="font-bold mb-2">Key Fields</h2>
            <div className="flex gap-4 mb-4">
                <div>
                    <label>External Key</label>
                    <select
                        value={keyFields.external}
                        onChange={(e) => setKeyFields({ ...keyFields, external: e.target.value })}
                        className="border rounded p-1"
                    >
                        <option value="">Select</option>
                        {externalFields.map((f) => (<option key={f}>{f}</option>))}
                    </select>
                </div>
                <div>
                    <label>Velaris Key</label>
                    <select
                        value={keyFields.velaris}
                        onChange={(e) => setKeyFields({ ...keyFields, velaris: e.target.value })}
                        className="border rounded p-1"
                    >
                        <option value="">Select</option>
                        {velarisFields.map((f) => (<option key={f}>{f}</option>))}
                    </select>
                </div>
            </div>

            <h2 className="font-bold mb-2">Field Mappings</h2>
            {mappings.map((m, idx) => (
                <div key={idx} className="flex gap-2 mb-2 items-center">
                    <select value={m.external} onChange={(e) => updateMapping(idx, "external", e.target.value)} className="border rounded p-1">
                        <option value="">External Field</option>
                        {externalFields.map((f) => (<option key={f}>{f}</option>))}
                    </select>
                    <select value={m.velaris} onChange={(e) => updateMapping(idx, "velaris", e.target.value)} className="border rounded p-1">
                        <option value="">Velaris Field</option>
                        {velarisFields.map((f) => (<option key={f}>{f}</option>))}
                    </select>
                    <select value={m.rule} onChange={(e) => updateMapping(idx, "rule", e.target.value)} className="border rounded p-1">
                        <option value="equals">Equals</option>
                        <option value="case_insensitive_equals">Case Insensitive</option>
                        <option value="contains">Contains</option>
                    </select>
                    <button className="text-red-500" onClick={() => removeMapping(idx)}>Remove</button>
                </div>
            ))}

            <button onClick={addMapping} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 mt-2">Add Mapping</button>
        </div>
    );
}
