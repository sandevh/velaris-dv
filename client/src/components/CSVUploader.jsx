import { useEffect } from "react";
import Papa from "papaparse";

export default function CSVUploader({ label, setFile, setFields, fileName }) {
    const handleFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setFile(file);

        // Extract headers
        Papa.parse(file, {
            preview: 1,
            header: true,
            complete: (results) => {
                setFields(results.meta.fields || []);
            },
            error: (error) => {
                console.error("Error parsing CSV:", error);
                alert("Error reading CSV file. Please ensure it's a valid CSV.");
            }
        });
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-gray-200 hover:border-indigo-400 transition-all duration-200">
            <label className="block mb-3 font-bold text-lg text-gray-800 flex items-center gap-2">
                <span className="text-2xl">{label.includes("External") ? "📤" : "📥"}</span>
                {label}
            </label>
            <div className="relative">
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFile}
                    className="block w-full text-sm text-gray-600 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-blue-600 file:to-indigo-600 file:text-white hover:file:from-blue-700 hover:file:to-indigo-700 file:cursor-pointer cursor-pointer file:transition-all file:duration-200"
                />
            </div>
            {fileName && (
                <div className="mt-3 p-3 bg-green-50 border-l-4 border-green-500 rounded-r animate-fadeIn">
                    <p className="text-sm font-semibold text-green-800 flex items-center gap-2">
                        <span>✓</span>
                        <span>{fileName}</span>
                    </p>
                </div>
            )}
        </div>
    );
}
