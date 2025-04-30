import { useState, useEffect } from "react";
import { DoorData } from "../types/Door";
import { fetchDoorData, findPrice } from "../services/api";
import "../assets/styles/MatrixDoorPricing.css";

interface CellConfig {
  productCode: string;
  pressure: number;
  price: string;
  isConfigured: boolean;
}

const MatrixDoorPricing = () => {
  const [doorData, setDoorData] = useState<DoorData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Main inputs
  const [totalWidth, setTotalWidth] = useState<number>(2000);
  const [totalHeight, setTotalHeight] = useState<number>(2000);

  // Matrix values
  const [w1, setW1] = useState<number>(1000);
  const [w2, setW2] = useState<number>(1000);
  const [h1, setH1] = useState<number>(1000);
  const [h2, setH2] = useState<number>(1000);

  // Selected cell
  const [selectedCell, setSelectedCell] = useState<number | null>(null);

  // Filter options
  const [productCodes, setProductCodes] = useState<string[]>([]);
  const [pressures, setPressures] = useState<number[]>([]);

  // Temporary selection for the currently selected cell
  const [tempProductCode, setTempProductCode] = useState<string>("");
  const [tempPressure, setTempPressure] = useState<number>(0);

  // Configuration for each cell
  const [cellConfigs, setCellConfigs] = useState<{
    [key: number]: CellConfig;
  }>({
    1: { productCode: "", pressure: 0, price: "", isConfigured: false },
    2: { productCode: "", pressure: 0, price: "", isConfigured: false },
    3: { productCode: "", pressure: 0, price: "", isConfigured: false },
    4: { productCode: "", pressure: 0, price: "", isConfigured: false },
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchDoorData();
        setDoorData(data);

        // Extract unique product codes and pressures from the data
        const uniqueProductCodes = [
          ...new Set(data.map((item) => item.product_code)),
        ];
        const uniquePressures = [...new Set(data.map((item) => item.pressure))];

        setProductCodes(uniqueProductCodes);
        setPressures(uniquePressures);

        // Set initial temp values from the first available options
        if (uniqueProductCodes.length > 0 && uniquePressures.length > 0) {
          setTempProductCode(uniqueProductCodes[0]);
          setTempPressure(uniquePressures[0]);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching door data:", error);
        setError("Failed to load data. Please try again later.");
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Calculate w2 when w1 or totalWidth changes
  useEffect(() => {
    setW2(totalWidth - w1);
  }, [w1, totalWidth]);

  // Calculate h2 when h1 or totalHeight changes
  useEffect(() => {
    setH2(totalHeight - h1);
  }, [h1, totalHeight]);

  // Update cell configs when dimensions change
  useEffect(() => {
    updatePricesForConfiguredCells();
  }, [w1, w2, h1, h2, doorData]);

  const handleTotalWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setTotalWidth(value);
  };

  const handleTotalHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setTotalHeight(value);
  };

  const handleW1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value <= totalWidth) {
      setW1(value);
    }
  };

  const handleH1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value <= totalHeight) {
      setH1(value);
    }
  };

  const handleTempProductCodeChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setTempProductCode(e.target.value);
  };

  const handleTempPressureChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setTempPressure(Number(e.target.value));
  };

  const handleCellClick = (cellNumber: number) => {
    setSelectedCell(cellNumber);

    // Set temporary selections based on cell's current config if it exists
    const cellConfig = cellConfigs[cellNumber];
    if (cellConfig.isConfigured) {
      setTempProductCode(cellConfig.productCode);
      setTempPressure(cellConfig.pressure);
    } else {
      // Reset to defaults if cell is not configured
      if (productCodes.length > 0) {
        setTempProductCode(productCodes[0]);
      }
      if (pressures.length > 0) {
        setTempPressure(pressures[0]);
      }
    }
  };

  const handleApplySelection = () => {
    if (!selectedCell || !tempProductCode || !tempPressure) return;

    // Get dimensions based on the selected cell
    let width, height;
    switch (selectedCell) {
      case 1:
        width = w1;
        height = h1;
        break;
      case 2:
        width = w2;
        height = h1;
        break;
      case 3:
        width = w1;
        height = h2;
        break;
      case 4:
        width = w2;
        height = h2;
        break;
      default:
        return;
    }

    // Calculate price for this cell
    const price = findPrice(
      tempProductCode,
      tempPressure,
      width,
      height,
      doorData
    );

    // Update cell configuration
    setCellConfigs((prev) => ({
      ...prev,
      [selectedCell]: {
        productCode: tempProductCode,
        pressure: tempPressure,
        price,
        isConfigured: true,
      },
    }));

    // Clear selected cell after applying
    setSelectedCell(null);
  };

  const updatePricesForConfiguredCells = () => {
    // Create a new object to avoid direct state mutation
    const updatedConfigs = { ...cellConfigs };

    // Update prices for all configured cells
    Object.keys(updatedConfigs).forEach((cellKey) => {
      const cellNumber = Number(cellKey);
      const config = updatedConfigs[cellNumber];

      if (config.isConfigured) {
        // Get dimensions based on the cell number
        let width, height;
        switch (cellNumber) {
          case 1:
            width = w1;
            height = h1;
            break;
          case 2:
            width = w2;
            height = h1;
            break;
          case 3:
            width = w1;
            height = h2;
            break;
          case 4:
            width = w2;
            height = h2;
            break;
          default:
            return;
        }

        // Update price with new dimensions
        const price = findPrice(
          config.productCode,
          config.pressure,
          width,
          height,
          doorData
        );

        updatedConfigs[cellNumber] = {
          ...config,
          price,
        };
      }
    });

    setCellConfigs(updatedConfigs);
  };

  const calculateTotal = (): string => {
    const total = Object.values(cellConfigs).reduce(
      (sum, config) => sum + (parseFloat(config.price) || 0),
      0
    );

    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(total);
  };

  const getCellDimensions = (cellNumber: number): string => {
    switch (cellNumber) {
      case 1:
        return `${w1}×${h1}`;
      case 2:
        return `${w2}×${h1}`;
      case 3:
        return `${w1}×${h2}`;
      case 4:
        return `${w2}×${h2}`;
      default:
        return "";
    }
  };

  if (loading) {
    return <div className="loading">Loading data...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="matrix-door-pricing">
      <h1>BÁO GIÁ CỬA</h1>

      <div className="three-column-layout">
        {/* Left Panel - Dimensions and Configuration */}
        <div className="left-panel">
          <div className="panel-section dimensions-section">
            <h3>Kích thước tổng</h3>
            <div className="input-row">
              <label>Rộng (W):</label>
              <input
                type="number"
                value={totalWidth}
                onChange={handleTotalWidthChange}
              />
            </div>
            <div className="input-row">
              <label>Cao (H):</label>
              <input
                type="number"
                value={totalHeight}
                onChange={handleTotalHeightChange}
              />
            </div>
          </div>

          <div className="panel-section config-section">
            <h3>Cấu hình</h3>
            {selectedCell ? (
              <div className="config-form">
                <div className="selected-cell-info">
                  <strong>Ô {selectedCell}</strong>
                  <span className="selected-dimensions">
                    {getCellDimensions(selectedCell)}
                  </span>
                </div>
                <div className="form-row">
                  <label>ProductCode:</label>
                  <select
                    value={tempProductCode}
                    onChange={handleTempProductCodeChange}
                  >
                    {productCodes.map((code) => (
                      <option key={code} value={code}>
                        {code}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-row">
                  <label>Pressure:</label>
                  <select
                    value={tempPressure}
                    onChange={handleTempPressureChange}
                  >
                    {pressures.map((pressure) => (
                      <option key={pressure} value={pressure}>
                        {pressure}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-actions">
                  <button
                    className="apply-button"
                    onClick={handleApplySelection}
                  >
                    Áp dụng
                  </button>
                  <button
                    className="cancel-button"
                    onClick={() => setSelectedCell(null)}
                  >
                    Hủy
                  </button>
                </div>
              </div>
            ) : (
              <div className="config-info">
                <p>Click vào ô trong ma trận để cấu hình</p>
              </div>
            )}
          </div>
        </div>

        {/* Middle Panel - Matrix */}
        <div className="middle-panel">
          <div className="panel-section matrix-section">
            <div className="matrix-container">
              <div className="matrix-header">
                <div className="dimension-labels">
                  <span className="dimension-label">W</span>
                  <div className="w-labels">
                    <span>w1</span>
                    <span>w2</span>
                  </div>
                </div>
                <div className="w-inputs">
                  <input
                    type="number"
                    value={w1}
                    onChange={handleW1Change}
                    className="dimension-input"
                  />
                  <div className="dimension-value">{w2}</div>
                </div>
              </div>

              <div className="matrix-content">
                <div className="h-labels">
                  <span className="dimension-label">H</span>
                  <span className="h-label">h1</span>
                  <span className="h-label">h2</span>
                </div>
                <div className="h-inputs">
                  <input
                    type="number"
                    value={h1}
                    onChange={handleH1Change}
                    className="dimension-input"
                  />
                  <div className="dimension-value">{h2}</div>
                </div>

                <div className="matrix-grid">
                  <div
                    className={`matrix-cell ${
                      selectedCell === 1 ? "selected" : ""
                    } ${cellConfigs[1].isConfigured ? "configured" : ""}`}
                    onClick={() => handleCellClick(1)}
                  >
                    <div className="cell-number">1</div>
                    <div className="cell-dimensions">
                      {getCellDimensions(1)}
                    </div>
                    {cellConfigs[1].isConfigured && (
                      <div className="cell-config">
                        {cellConfigs[1].productCode} - {cellConfigs[1].pressure}
                      </div>
                    )}
                  </div>
                  <div
                    className={`matrix-cell ${
                      selectedCell === 2 ? "selected" : ""
                    } ${cellConfigs[2].isConfigured ? "configured" : ""}`}
                    onClick={() => handleCellClick(2)}
                  >
                    <div className="cell-number">2</div>
                    <div className="cell-dimensions">
                      {getCellDimensions(2)}
                    </div>
                    {cellConfigs[2].isConfigured && (
                      <div className="cell-config">
                        {cellConfigs[2].productCode} - {cellConfigs[2].pressure}
                      </div>
                    )}
                  </div>
                  <div
                    className={`matrix-cell ${
                      selectedCell === 3 ? "selected" : ""
                    } ${cellConfigs[3].isConfigured ? "configured" : ""}`}
                    onClick={() => handleCellClick(3)}
                  >
                    <div className="cell-number">3</div>
                    <div className="cell-dimensions">
                      {getCellDimensions(3)}
                    </div>
                    {cellConfigs[3].isConfigured && (
                      <div className="cell-config">
                        {cellConfigs[3].productCode} - {cellConfigs[3].pressure}
                      </div>
                    )}
                  </div>
                  <div
                    className={`matrix-cell ${
                      selectedCell === 4 ? "selected" : ""
                    } ${cellConfigs[4].isConfigured ? "configured" : ""}`}
                    onClick={() => handleCellClick(4)}
                  >
                    <div className="cell-number">4</div>
                    <div className="cell-dimensions">
                      {getCellDimensions(4)}
                    </div>
                    {cellConfigs[4].isConfigured && (
                      <div className="cell-config">
                        {cellConfigs[4].productCode} - {cellConfigs[4].pressure}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="matrix-info">
                <div>W = w1 + w2 (nhập w1 → w2 tự động cập nhật)</div>
                <div>H = h1 + h2 (nhập h1 → h2 tự động cập nhật)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Price Summary */}
        <div className="right-panel">
          <div className="panel-section price-section">
            <h3>Bảng giá</h3>
            <div className="price-content">
              <div className="total-price-container">
                <div className="total-price-label">Tổng giá:</div>
                <div className="total-price-value">{calculateTotal()}</div>
              </div>

              <div className="cell-prices">
                <div className="price-row">
                  <div className="price-cell">
                    <div className="price-cell-header">
                      <span className="price-cell-number">Ô 1</span>
                      <span className="price-cell-dimensions">
                        {getCellDimensions(1)}
                      </span>
                    </div>
                    <div className="price-cell-config">
                      {cellConfigs[1].isConfigured
                        ? `${cellConfigs[1].productCode} - ${cellConfigs[1].pressure}`
                        : "Chưa cấu hình"}
                    </div>
                    <div className="price-cell-value">
                      {cellConfigs[1].price
                        ? new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(Number(cellConfigs[1].price))
                        : "-"}
                    </div>
                  </div>
                  <div className="price-cell">
                    <div className="price-cell-header">
                      <span className="price-cell-number">Ô 2</span>
                      <span className="price-cell-dimensions">
                        {getCellDimensions(2)}
                      </span>
                    </div>
                    <div className="price-cell-config">
                      {cellConfigs[2].isConfigured
                        ? `${cellConfigs[2].productCode} - ${cellConfigs[2].pressure}`
                        : "Chưa cấu hình"}
                    </div>
                    <div className="price-cell-value">
                      {cellConfigs[2].price
                        ? new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(Number(cellConfigs[2].price))
                        : "-"}
                    </div>
                  </div>
                </div>
                <div className="price-row">
                  <div className="price-cell">
                    <div className="price-cell-header">
                      <span className="price-cell-number">Ô 3</span>
                      <span className="price-cell-dimensions">
                        {getCellDimensions(3)}
                      </span>
                    </div>
                    <div className="price-cell-config">
                      {cellConfigs[3].isConfigured
                        ? `${cellConfigs[3].productCode} - ${cellConfigs[3].pressure}`
                        : "Chưa cấu hình"}
                    </div>
                    <div className="price-cell-value">
                      {cellConfigs[3].price
                        ? new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(Number(cellConfigs[3].price))
                        : "-"}
                    </div>
                  </div>
                  <div className="price-cell">
                    <div className="price-cell-header">
                      <span className="price-cell-number">Ô 4</span>
                      <span className="price-cell-dimensions">
                        {getCellDimensions(4)}
                      </span>
                    </div>
                    <div className="price-cell-config">
                      {cellConfigs[4].isConfigured
                        ? `${cellConfigs[4].productCode} - ${cellConfigs[4].pressure}`
                        : "Chưa cấu hình"}
                    </div>
                    <div className="price-cell-value">
                      {cellConfigs[4].price
                        ? new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(Number(cellConfigs[4].price))
                        : "-"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatrixDoorPricing;
