export default function ResultsViewer({ result }) {
    return (
        <div className="mt-6 p-4 border rounded bg-white">
            <h2 className="font-bold mb-2">Comparison Results</h2>

            <p><strong>Matched:</strong> {result.matched.length}</p>
            <p><strong>Mismatched:</strong> {result.mismatched.length}</p>
            <p><strong>Missing in Velaris:</strong> {result.missing_in_velaris.length}</p>
            <p><strong>Missing in External:</strong> {result.missing_in_external.length}</p>

            {result.mismatched.length ? (
                <div className="mt-2 overflow-x-auto">
                    <table className="table-auto border-collapse border border-gray-300 w-full text-sm">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border p-1">ID</th>
                                <th className="border p-1">Differences</th>
                            </tr>
                        </thead>
                        <tbody>
                            {result.mismatched.map((m, idx) => (
                                <tr key={idx}>
                                    <td className="border p-1">{m.id}</td>
                                    <td className="border p-1">
                                        {Object.entries(m.differences).map(([field, val]) => (
                                            <div key={field}>
                                                <strong>{field}:</strong> {val.external} → {val.velaris}
                                            </div>
                                        ))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : null}
        </div>
    );
}
