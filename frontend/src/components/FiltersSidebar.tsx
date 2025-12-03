import React, { useState, useEffect, useCallback } from "react";

interface FiltersSidebarProps {
  onFilterChange: (filterData: any) => void;
}

const FiltersSidebar: React.FC<FiltersSidebarProps> = ({ onFilterChange }) => {
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [selectedPrice, setSelectedPrice] = useState<string>("");
  const [areaRange, setAreaRange] = useState({ min: "", max: "" });
  const [selectedArea, setSelectedArea] = useState<string>("");

  const priceRanges = [
    { label: "Tất cả khoảng giá", value: "" },
    { label: "Dưới 1 triệu", value: "under-1m" },
    { label: "1 - 3 triệu", value: "1m-3m" },
    { label: "3 - 5 triệu", value: "3m-5m" },
    { label: "5 - 7 triệu", value: "5m-7m" },
    { label: "Trên 7 triệu", value: "over-7m" },
  ];

  const areaRanges = [
    { label: "Tất cả diện tích", value: "" },
    { label: "Dưới 20m²", value: "under-20" },
    { label: "20 - 30m²", value: "20-30" },
    { label: "30 - 40m²", value: "30-40" },
    { label: "40 - 50m²", value: "40-50" },
    { label: "Trên 50m²", value: "over-50" },
  ];

  // Sửa: Tạo callback ổn định
  const handleFilterUpdate = useCallback(() => {
    onFilterChange({
      priceRange,
      selectedPrice,
      areaRange,
      selectedArea,
    });
  }, [priceRange, selectedPrice, areaRange, selectedArea]);

  // Sửa: Chỉ gọi khi có thay đổi thực sự
  useEffect(() => {
    handleFilterUpdate();
  }, [handleFilterUpdate]);

  const handlePriceCustomChange = (field: string, value: string) => {
    setPriceRange((prev) => ({ ...prev, [field]: value }));
    if (value) setSelectedPrice("");
  };

  const handlePriceSelect = (value: string) => {
    setSelectedPrice(value);
    setPriceRange({ min: "", max: "" });
  };

  const handleAreaCustomChange = (field: string, value: string) => {
    setAreaRange((prev) => ({ ...prev, [field]: value }));
    if (value) setSelectedArea("");
  };

  const handleAreaSelect = (value: string) => {
    setSelectedArea(value);
    setAreaRange({ min: "", max: "" });
  };

  const handleReset = () => {
    setPriceRange({ min: "", max: "" });
    setSelectedPrice("");
    setAreaRange({ min: "", max: "" });
    setSelectedArea("");
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <div>
        <h3 className="font-semibold text-lg mb-4">Khoảng giá</h3>
        <div className="space-y-3">
          {priceRanges.map((range) => (
            <label key={range.value} className="flex items-center">
              <input
                type="radio"
                name="price"
                value={range.value}
                checked={selectedPrice === range.value}
                onChange={(e) => handlePriceSelect(e.target.value)}
                className="mr-3"
              />
              <span>{range.label}</span>
            </label>
          ))}
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <label className="text-sm text-gray-600">Giá thấp nhất</label>
              <input
                type="number"
                placeholder="Từ"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                value={priceRange.min}
                onChange={(e) => handlePriceCustomChange("min", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Giá cao nhất</label>
              <input
                type="number"
                placeholder="Đến"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                value={priceRange.max}
                onChange={(e) => handlePriceCustomChange("max", e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-4">Diện tích</h3>
        <div className="space-y-3">
          {areaRanges.map((range) => (
            <label key={range.value} className="flex items-center">
              <input
                type="radio"
                name="area"
                value={range.value}
                checked={selectedArea === range.value}
                onChange={(e) => handleAreaSelect(e.target.value)}
                className="mr-3"
              />
              <span>{range.label}</span>
            </label>
          ))}
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <label className="text-sm text-gray-600">Từ (m²)</label>
              <input
                type="number"
                placeholder="Từ"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                value={areaRange.min}
                onChange={(e) => handleAreaCustomChange("min", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Đến (m²)</label>
              <input
                type="number"
                placeholder="Đến"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                value={areaRange.max}
                onChange={(e) => handleAreaCustomChange("max", e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleReset}
        className="w-full bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition duration-200"
      >
        Đặt lại
      </button>
    </div>
  );
};

export default FiltersSidebar;
