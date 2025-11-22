import { useState } from "react";
import CSVUploader from "./components/CSVUploader";
import MappingBuilder from "./components/MappingBuilder";
import ResultsViewer from "./components/ResultsViewer";
import axios from "axios";

function App() {
  const [externalCSV, setExternalCSV] = useState(null);
  const [velarisCSV, setVelarisCSV] = useState(null);
  const [externalFields, setExternalFields] = useState([]);
  const [velarisFields, setVelarisFields] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [keyFields, setKeyFields] = useState({ external: "", velaris: "" });
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    if (!externalCSV || !velarisCSV || !keyFields.external || !keyFields.velaris) return;

    const formData = new FormData();
    formData.append("external_csv", externalCSV);
    formData.append("velaris_csv", velarisCSV);
    formData.append("mapping_config", JSON.stringify({ key_fields: keyFields, mappings }));

    try {
      const res = await axios.post("http://localhost:8000/compare/external-velaris", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Error comparing CSVs");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">External → Velaris CSV Compare</h1>

      <CSVUploader
        label="External CSV"
        setFile={setExternalCSV}
        setFields={setExternalFields}
      />
      <CSVUploader
        label="Velaris CSV"
        setFile={setVelarisCSV}
        setFields={setVelarisFields}
      />

      {externalFields.length && velarisFields.length ? (
        <MappingBuilder
          externalFields={externalFields}
          velarisFields={velarisFields}
          mappings={mappings}
          setMappings={setMappings}
          keyFields={keyFields}
          setKeyFields={setKeyFields}
        />
      ) : null}

      {mappings.length ? (
        <div className="flex justify-center mt-4">
          <button
            className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700"
            onClick={handleSubmit}
          >
            Compare
          </button>
        </div>
      ) : null}

      {result ? <ResultsViewer result={result} /> : null}
    </div>
  );
}

export default App;
