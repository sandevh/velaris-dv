import { useState } from "react";
import CSVUploader from "./components/CSVUploader";
import MappingBuilder from "./components/MappingBuilder";
import ResultsViewer from "./components/ResultsViewer";
import axios from "axios";

// Dynamic configuration - change these to customize the app
const APP_CONFIG = {
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:8000",
  apiEndpoint: "/compare/external-velaris",
  csvLabels: {
    first: import.meta.env.VITE_CSV1_LABEL || "External CSV",
    second: import.meta.env.VITE_CSV2_LABEL || "Velaris CSV"
  },
  appTitle: import.meta.env.VITE_APP_TITLE || "CSV Comparison Tool",
  appSubtitle: import.meta.env.VITE_APP_SUBTITLE || "Compare CSV files with custom field mappings",
  transformOptions: (import.meta.env.VITE_TRANSFORM_OPTIONS || "trim,lower,upper").split(","),
  comparisonRules: JSON.parse(import.meta.env.VITE_COMPARISON_RULES || JSON.stringify([
    { value: "equals", label: "Equals" },
    { value: "case_insensitive_equals", label: "Case Insensitive" },
    { value: "contains", label: "Contains" }
  ]))
};

function App() {
  const [externalCSV, setExternalCSV] = useState(null);
  const [velarisCSV, setVelarisCSV] = useState(null);
  const [externalFields, setExternalFields] = useState([]);
  const [velarisFields, setVelarisFields] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [keyFields, setKeyFields] = useState({ external_field: "", velaris_field: "" });
  const [result, setResult] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter out empty mappings
  const getValidMappings = () => {
    return mappings.filter(
      m => m.external_field.trim() !== "" && m.velaris_field.trim() !== ""
    );
  };

  const handleSubmit = async () => {
    if (!externalCSV || !velarisCSV || !keyFields.external_field || !keyFields.velaris_field) {
      setError("Please upload both CSV files and select key fields");
      return;
    }

    const validMappings = getValidMappings();
    if (validMappings.length === 0) {
      setError("Please add at least one valid field mapping");
      return;
    }

    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("external_csv", externalCSV);
    formData.append("velaris_csv", velarisCSV);
    formData.append("mapping_config", JSON.stringify({ key_fields: keyFields, mappings: validMappings }));

    try {
      const res = await axios.post(`${APP_CONFIG.apiUrl}${APP_CONFIG.apiEndpoint}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
      setShowPreview(false);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Error comparing CSVs. Please check your configuration and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setExternalCSV(null);
    setVelarisCSV(null);
    setExternalFields([]);
    setVelarisFields([]);
    setMappings([]);
    setKeyFields({ external_field: "", velaris_field: "" });
    setResult(null);
    setShowPreview(false);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
            {APP_CONFIG.appTitle}
          </h1>
          <p className="text-gray-600 text-lg">{APP_CONFIG.appSubtitle}</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg shadow-md animate-slideIn">
            <div className="flex items-center">
              <span className="text-red-500 text-2xl mr-3">⚠️</span>
              <div>
                <p className="font-semibold text-red-800">Error</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700 font-bold text-xl">
                ×
              </button>
            </div>
          </div>
        )}

        {/* CSV Upload Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <CSVUploader
            label={APP_CONFIG.csvLabels.first}
            setFile={setExternalCSV}
            setFields={setExternalFields}
            fileName={externalCSV?.name}
          />
          <CSVUploader
            label={APP_CONFIG.csvLabels.second}
            setFile={setVelarisCSV}
            setFields={setVelarisFields}
            fileName={velarisCSV?.name}
          />
        </div>

        {/* Mapping Builder */}
        {externalFields.length > 0 && velarisFields.length > 0 && (
          <div className="animate-fadeIn">
            <MappingBuilder
              externalFields={externalFields}
              velarisFields={velarisFields}
              mappings={mappings}
              setMappings={setMappings}
              keyFields={keyFields}
              setKeyFields={setKeyFields}
              transformOptions={APP_CONFIG.transformOptions}
              comparisonRules={APP_CONFIG.comparisonRules}
              csvLabels={APP_CONFIG.csvLabels}
            />
          </div>
        )}

        {/* Action Buttons */}
        {getValidMappings().length > 0 && (
          <div className="flex flex-wrap justify-center gap-4 mt-6 animate-fadeIn">
            <button
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Comparing...</span>
                </>
              ) : (
                <>
                  <span>🔍</span>
                  <span>Compare CSVs</span>
                </>
              )}
            </button>
            <button
              className="bg-white text-gray-700 px-6 py-3 rounded-lg shadow-md hover:shadow-lg border-2 border-gray-300 hover:border-indigo-400 transition-all duration-200 font-semibold"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? "Hide Config" : "Show Config"}
            </button>
            <button
              className="bg-white text-red-600 px-6 py-3 rounded-lg shadow-md hover:shadow-lg border-2 border-red-300 hover:border-red-500 transition-all duration-200 font-semibold"
              onClick={handleReset}
            >
              Reset All
            </button>
          </div>
        )}

        {/* Config Preview */}
        {showPreview && (
          <div className="mt-6 animate-slideIn">
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
              <h3 className="font-bold text-lg mb-3 text-gray-800">Configuration Preview</h3>
              <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-x-auto border border-gray-200">
                {JSON.stringify({ key_fields: keyFields, mappings: getValidMappings() }, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Results */}
        {result && <ResultsViewer result={result} onReset={handleReset} />}
      </div>
    </div>
  );
}

export default App;
