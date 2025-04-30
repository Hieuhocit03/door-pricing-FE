import DoorPricingForm from "./components/DoorPricingForm";
import MatrixDoorPricing from "./components/MatrixDoorPricing";
import { useState } from "react";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState<string>("matrix");

  return (
    <div className="App">
      <div className="tab-buttons">
        <button
          className={activeTab === "regular" ? "active" : ""}
          onClick={() => setActiveTab("regular")}
        >
          Cơ bản
        </button>
        <button
          className={activeTab === "matrix" ? "active" : ""}
          onClick={() => setActiveTab("matrix")}
        >
          Nâng cao
        </button>
      </div>

      {activeTab === "regular" ? <DoorPricingForm /> : <MatrixDoorPricing />}
    </div>
  );
}

export default App;
