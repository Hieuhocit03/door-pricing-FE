import { useState, useEffect } from "react";
import { DoorData, DoorPricingFormData } from "../types/Door";
import { fetchDoorData, findPrice } from "../services/api";
import "../assets/styles/DoorPricingForm.css";

const DoorPricingForm = () => {
  const [doorData, setDoorData] = useState<DoorData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [formData, setFormData] = useState<DoorPricingFormData>({
    product_code: "",
    pressure: 0,
    width: 0,
    height: 0,
  });
  const [price, setPrice] = useState<string>("");
  const [roundedWidth, setRoundedWidth] = useState<number>(0);
  const [roundedHeight, setRoundedHeight] = useState<number>(0);

  // Available product codes and pressures from API data
  const [productCodes, setProductCodes] = useState<string[]>([]);
  const [pressures, setPressures] = useState<number[]>([]);

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

        // Set initial form values from the first available options
        if (uniqueProductCodes.length > 0 && uniquePressures.length > 0) {
          setFormData((prev) => ({
            ...prev,
            product_code: uniqueProductCodes[0],
            pressure: uniquePressures[0],
          }));
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

  // Calculate price when any of the form inputs change
  useEffect(() => {
    calculatePrice();
  }, [formData, roundedWidth, roundedHeight]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Convert to appropriate types
    let typedValue: string | number = value;
    if (name === "pressure" || name === "width" || name === "height") {
      typedValue = Number(value);
    }

    setFormData({
      ...formData,
      [name]: typedValue,
    });

    // Calculate rounded values when width or height changes
    if (name === "width") {
      const rounded = Math.ceil(Number(value) / 100) * 100;
      setRoundedWidth(rounded);
    } else if (name === "height") {
      const rounded = Math.ceil(Number(value) / 100) * 100;
      setRoundedHeight(rounded);
    }
  };

  const calculatePrice = () => {
    if (
      formData.width &&
      formData.height &&
      formData.product_code &&
      formData.pressure
    ) {
      const calculatedPrice = findPrice(
        formData.product_code,
        formData.pressure,
        formData.width,
        formData.height,
        doorData
      );
      setPrice(calculatedPrice);
    } else {
      setPrice("");
    }
  };

  if (loading) {
    return (
      <div className="loading">
        Loading data<span className="loading-dots">...</span>
      </div>
    );
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="door-pricing-form">
      <h1>BÁO GIÁ CỬA</h1>

      <div className="form-container">
        <div className="form-section">
          <h2>Thông số cơ bản</h2>
          <table className="parameters-table">
            <tbody>
              <tr>
                <td className="param-name">Pressure</td>
                <td className="param-value">
                  <select
                    name="pressure"
                    value={formData.pressure}
                    onChange={handleInputChange}
                  >
                    {pressures.length === 0 && (
                      <option value="">No options available</option>
                    )}
                    {pressures.map((pressure) => (
                      <option key={pressure} value={pressure}>
                        {pressure}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
              <tr>
                <td className="param-name">Product Code</td>
                <td className="param-value">
                  <select
                    name="product_code"
                    value={formData.product_code}
                    onChange={handleInputChange}
                  >
                    {productCodes.length === 0 && (
                      <option value="">No options available</option>
                    )}
                    {productCodes.map((code) => (
                      <option key={code} value={code}>
                        {code}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="form-section">
          <h2>Kích thước</h2>
          <table className="input-table">
            <thead>
              <tr>
                <th>Thông số</th>
                <th>Nhập liệu</th>
                <th>Làm tròn</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="param-name">Chiều rộng (W)</td>
                <td>
                  <input
                    type="number"
                    name="width"
                    value={formData.width === 0 ? "" : formData.width}
                    onChange={handleInputChange}
                    placeholder="Nhập chiều rộng"
                  />
                </td>
                <td className="rounded-value">
                  {formData.width > 0 ? roundedWidth : "-"}
                </td>
              </tr>
              <tr>
                <td className="param-name">Chiều cao (H)</td>
                <td>
                  <input
                    type="number"
                    name="height"
                    value={formData.height === 0 ? "" : formData.height}
                    onChange={handleInputChange}
                    placeholder="Nhập chiều cao"
                  />
                </td>
                <td className="rounded-value">
                  {formData.height > 0 ? roundedHeight : "-"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="output-section">
          <div className="output-label">Kết quả</div>
          <div className="output-arrow">↓</div>
          <div className="output-fields">
            <div className="price-field">
              <div className="price-label">Giá tiền</div>
              <div className="price-value">
                {price
                  ? new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(Number(price))
                  : "-"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoorPricingForm;
