export default function ResultsViewer({ result, onReset }) {
    const total = result.matched.length + result.mismatched.length + result.missing_in_velaris.length + result.missing_in_external.length;
    const matchPercentage = total > 0 ? ((result.matched.length / total) * 100).toFixed(1) : 0;

    return (
        <div className="mt-8 animate-slideIn">
            <div className="bg-white p-6 rounded-xl shadow-2xl border-2 border-gray-200">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="font-bold text-3xl text-gray-800 flex items-center gap-3">
                        <span className="text-4xl">📊</span>
                        Comparison Results
                    </h2>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-200 shadow-md">
                        <div className="text-3xl mb-1">✅</div>
                        <div className="text-2xl font-bold text-green-700">{result.matched.length}</div>
                        <div className="text-sm font-semibold text-green-600">Matched</div>
                    </div>
                    <div className="bg-gradient-to-br from-red-50 to-rose-50 p-4 rounded-lg border-2 border-red-200 shadow-md">
                        <div className="text-3xl mb-1">❌</div>
                        <div className="text-2xl font-bold text-red-700">{result.mismatched.length}</div>
                        <div className="text-sm font-semibold text-red-600">Mismatched</div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-lg border-2 border-orange-200 shadow-md">
                        <div className="text-3xl mb-1">📤</div>
                        <div className="text-2xl font-bold text-orange-700">{result.missing_in_velaris.length}</div>
                        <div className="text-sm font-semibold text-orange-600">Missing in Velaris</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg border-2 border-blue-200 shadow-md">
                        <div className="text-3xl mb-1">📥</div>
                        <div className="text-2xl font-bold text-blue-700">{result.missing_in_external.length}</div>
                        <div className="text-sm font-semibold text-blue-600">Missing in External</div>
                    </div>
                </div>

                {/* Match Percentage */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border-2 border-indigo-200 mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-gray-700">Match Rate</span>
                        <span className="font-bold text-2xl text-indigo-600">{matchPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-4 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${matchPercentage}%` }}
                        ></div>
                    </div>
                </div>

                {/* Mismatched Details */}
                {result.mismatched.length > 0 && (
                    <div className="mt-6">
                        <h3 className="font-bold text-xl mb-4 text-gray-800 flex items-center gap-2">
                            <span>🔍</span>
                            Mismatch Details
                        </h3>
                        <div className="overflow-x-auto rounded-lg border-2 border-gray-200">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gradient-to-r from-gray-100 to-gray-50">
                                        <th className="border-b-2 border-gray-300 p-3 text-left font-bold text-gray-700">ID</th>
                                        <th className="border-b-2 border-gray-300 p-3 text-left font-bold text-gray-700">Differences</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.mismatched.map((m, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                            <td className="border-b border-gray-200 p-3 font-semibold text-gray-700">{m.id}</td>
                                            <td className="border-b border-gray-200 p-3">
                                                {Object.entries(m.differences).map(([field, val]) => (
                                                    <div key={field} className="mb-2 last:mb-0 p-2 bg-red-50 rounded border-l-4 border-red-400">
                                                        <div className="font-bold text-gray-700 mb-1">{field}</div>
                                                        <div className="text-xs">
                                                            <span className="inline-block bg-orange-100 text-orange-800 px-2 py-1 rounded mr-2">
                                                                External: <strong>{val.external || '(empty)'}</strong>
                                                            </span>
                                                            <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                                Velaris: <strong>{val.velaris || '(empty)'}</strong>
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
        </div>
    );
}
