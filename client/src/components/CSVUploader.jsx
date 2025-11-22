import { useEffect } from "react";
import Papa from "papaparse";

export default function CSVUploader({ label, setFile, setFields }) {
    const handleFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setFile(file);

        // Extract headers
        Papa.parse(file, {
            preview: 1,
            header: true,
            complete: (results) => {
                setFields(results.meta.fields);
            },
        });
    };

    return (
        <div className="mb-4">
            <label className="block mb-1 font-medium">{label}</label>
            <input type="file" accept=".csv" onChange={handleFile} className="border p-2 rounded w-full" />
        </div>
    );
}
