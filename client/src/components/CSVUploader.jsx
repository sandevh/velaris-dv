import Papa from "papaparse";

export default function CSVUploader({ label, setFile, setFields, fileName }) {
    const handleFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setFile(file);
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
        <div className="card">
            <label>{label}</label>
            <input
                key={fileName || 'empty'}
                aria-label={`${label} file input`}
                type="file"
                accept=".csv"
                onChange={handleFile}
                className="input"
            />
            {fileName && (
                <div className="alert alert-success mt-md" role="status">
                    <div>
                        <strong style={{ display: 'block', marginBottom: 2 }}>File loaded</strong>
                        <span>{fileName}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
