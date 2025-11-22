import { useState } from "react";
import Dashboard from "./components/Dashboard";
import ManualComparison from "./pages/ManualComparison";
import ScheduledComparisons from "./pages/ScheduledComparisons";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  const [activeTab, setActiveTab] = useState("manual");

  const renderPage = () => {
    switch (activeTab) {
      case "manual":
        return <ManualComparison />;
      case "scheduled":
        return <ScheduledComparisons />;
      default:
        return <ManualComparison />;
    }
  };

  return (
    <ErrorBoundary>
      <Dashboard activeTab={activeTab} onTabChange={setActiveTab}>
        {renderPage()}
      </Dashboard>
    </ErrorBoundary>
  );
}

export default App;
