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
    const addMapping = () => {
        setMappings([
            ...mappings,
            {
                external_field: "",
                velaris_field: "",
                rule: "equals",
                external_transforms: [],
                velaris_transforms: []
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

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-gray-200">
            <h2 className="font-bold text-2xl mb-4 text-gray-800 flex items-center gap-2">
                <span className="text-3xl">🔑</span>
                Key Fields
            </h2>
            <div className="grid md:grid-cols-2 gap-4 mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                <div>
                    <label className="block mb-2 font-semibold text-gray-700">{csvLabels.first} Key Field</label>
                    <select
                        value={keyFields.external_field}
                        onChange={(e) => setKeyFields({ ...keyFields, external_field: e.target.value })}
                        className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                    >
                        <option value="">Select a key field...</option>
                        {externalFields.map((f) => (<option key={f} value={f}>{f}</option>))}
                    </select>
                </div>
                <div>
                    <label className="block mb-2 font-semibold text-gray-700">{csvLabels.second} Key Field</label>
                    <select
                        value={keyFields.velaris_field}
                        onChange={(e) => setKeyFields({ ...keyFields, velaris_field: e.target.value })}
                        className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                    >
                        <option value="">Select a key field...</option>
                        {velarisFields.map((f) => (<option key={f} value={f}>{f}</option>))}
                    </select>
                </div>
            </div>

            <h2 className="font-bold text-2xl mb-4 text-gray-800 flex items-center gap-2">
                <span className="text-3xl">🔗</span>
                Field Mappings
            </h2>
            <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                <p className="text-sm text-blue-800">
                    <strong>ℹ️ Note:</strong> Key fields are used for matching rows. Add mappings below for other fields you want to compare.
                    You don't need to map key fields again.
                </p>
            </div>
            {mappings.map((m, idx) => (
                <div key={idx} className="border-2 border-gray-200 p-5 mb-4 rounded-lg bg-gradient-to-r from-gray-50 to-white hover:shadow-md transition-all duration-200 animate-fadeIn">
                    <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-gray-700">Mapping #{idx + 1}</span>
                        <button
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-lg font-semibold transition-all"
                            onClick={() => removeMapping(idx)}
                        >
                            🗑️ Remove
                        </button>
                    </div>
                    <div className="grid md:grid-cols-3 gap-3 mb-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">{csvLabels.first} Field</label>
                            <select
                                value={m.external_field}
                                onChange={(e) => updateMapping(idx, "external_field", e.target.value)}
                                className="w-full border-2 border-gray-300 rounded-lg p-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                            >
                                <option value="">Select field...</option>
                                {externalFields.filter(f => f !== keyFields.external_field).map((f) => (<option key={f} value={f}>{f}</option>))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">{csvLabels.second} Field</label>
                            <select
                                value={m.velaris_field}
                                onChange={(e) => updateMapping(idx, "velaris_field", e.target.value)}
                                className="w-full border-2 border-gray-300 rounded-lg p-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                            >
                                <option value="">Select field...</option>
                                {velarisFields.filter(f => f !== keyFields.velaris_field).map((f) => (<option key={f} value={f}>{f}</option>))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Comparison Rule</label>
                            <select
                                value={m.rule}
                                onChange={(e) => updateMapping(idx, "rule", e.target.value)}
                                className="w-full border-2 border-gray-300 rounded-lg p-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                            >
                                {comparisonRules.map(rule => (
                                    <option key={rule.value} value={rule.value}>{rule.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 pt-3 border-t border-gray-200">
                        <div>
                            <p className="font-semibold text-sm text-gray-700 mb-2">{csvLabels.first} Transforms:</p>
                            <div className="flex flex-wrap gap-2">
                                {transformOptions.map(t => (
                                    <label key={t} className="inline-flex items-center gap-2 bg-white border-2 border-gray-300 rounded-lg px-3 py-2 cursor-pointer hover:border-blue-400 transition-all">
                                        <input
                                            type="checkbox"
                                            checked={m.external_transforms.includes(t)}
                                            onChange={() => toggleTransform(idx, "external_transforms", t)}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">{t}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className="font-semibold text-sm text-gray-700 mb-2">{csvLabels.second} Transforms:</p>
                            <div className="flex flex-wrap gap-2">
                                {transformOptions.map(t => (
                                    <label key={t} className="inline-flex items-center gap-2 bg-white border-2 border-gray-300 rounded-lg px-3 py-2 cursor-pointer hover:border-blue-400 transition-all">
                                        <input
                                            type="checkbox"
                                            checked={m.velaris_transforms.includes(t)}
                                            onChange={() => toggleTransform(idx, "velaris_transforms", t)}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">{t}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            <button
                onClick={addMapping}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-emerald-600 shadow-md hover:shadow-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2"
            >
                <span className="text-xl">➕</span>
                <span>Add New Mapping</span>
            </button>
        </div>
    );
}
