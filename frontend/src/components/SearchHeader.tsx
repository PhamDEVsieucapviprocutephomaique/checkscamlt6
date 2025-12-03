import React, { useState, useRef, useEffect } from "react";

interface SearchHeaderProps {
  onSearch: (searchData: any) => void;
  loading: boolean;
  filterData: {
    priceRange: { min: string; max: string };
    selectedPrice: string;
    areaRange: { min: string; max: string };
    selectedArea: string;
  };
}

const locationService = {
  getProvinces: async () => {
    const response = await fetch("https://provinces.open-api.vn/api/p/");
    return response.json();
  },

  getDistricts: async (provinceCode: number) => {
    const response = await fetch(
      `https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`
    );
    const data = await response.json();
    return data.districts;
  },

  getWards: async (districtCode: number) => {
    const response = await fetch(
      `https://provinces.open-api.vn/api/d/${districtCode}?depth=2`
    );
    const data = await response.json();
    return data.wards;
  },
};

const SearchHeader: React.FC<SearchHeaderProps> = ({
  onSearch,
  loading,
  filterData,
}) => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<any>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<any>(null);
  const [selectedWard, setSelectedWard] = useState<any>(null);
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [showWardDropdown, setShowWardDropdown] = useState(false);
  const [selectedFurnitureCondition, setSelectedFurnitureCondition] =
    useState("");
  const [selectedUtility, setSelectedUtility] = useState("");
  const [showFurnitureDropdown, setShowFurnitureDropdown] = useState(false);
  const [showUtilityDropdown, setShowUtilityDropdown] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const furnitureConditions = [
    { label: "Nội Thất", value: "" },
    { label: "Mới", value: "new" },
    { label: "Đã sử dụng", value: "used" },
  ];

  const utilityOptions = [
    { label: "Mức độ tiện ích", value: "" },
    { label: "Cao", value: "high" },
    { label: "Vừa", value: "medium" },
    { label: "Thấp", value: "low" },
  ];

  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const provincesData = await locationService.getProvinces();
        setProvinces(provincesData);
      } catch (error) {
        console.error("Error loading provinces:", error);
      }
    };
    loadProvinces();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowProvinceDropdown(false);
        setShowDistrictDropdown(false);
        setShowWardDropdown(false);
        setShowFurnitureDropdown(false);
        setShowUtilityDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // SỬA: Thêm reset input sau khi search
  const handleSearchClick = () => {
    // Convert price range
    let priceFilter = {};
    if (filterData.selectedPrice) {
      switch (filterData.selectedPrice) {
        case "under-1m":
          priceFilter = { min: 0, max: 1000000 };
          break;
        case "1m-3m":
          priceFilter = { min: 1000000, max: 3000000 };
          break;
        case "3m-5m":
          priceFilter = { min: 3000000, max: 5000000 };
          break;
        case "5m-7m":
          priceFilter = { min: 5000000, max: 7000000 };
          break;
        case "over-7m":
          priceFilter = { min: 7000000, max: null };
          break;
        default:
          priceFilter = {};
      }
    } else if (filterData.priceRange.min || filterData.priceRange.max) {
      priceFilter = {
        min: filterData.priceRange.min
          ? parseInt(filterData.priceRange.min)
          : null,
        max: filterData.priceRange.max
          ? parseInt(filterData.priceRange.max)
          : null,
      };
    }

    // Convert area range
    let areaFilter = {};
    if (filterData.selectedArea) {
      switch (filterData.selectedArea) {
        case "under-20":
          areaFilter = { min: 0, max: 20 };
          break;
        case "20-30":
          areaFilter = { min: 20, max: 30 };
          break;
        case "30-40":
          areaFilter = { min: 30, max: 40 };
          break;
        case "40-50":
          areaFilter = { min: 40, max: 50 };
          break;
        case "over-50":
          areaFilter = { min: 50, max: null };
          break;
        default:
          areaFilter = {};
      }
    } else if (filterData.areaRange.min || filterData.areaRange.max) {
      areaFilter = {
        min: filterData.areaRange.min
          ? parseInt(filterData.areaRange.min)
          : null,
        max: filterData.areaRange.max
          ? parseInt(filterData.areaRange.max)
          : null,
      };
    }

    const searchData = {
      keyword: searchKeyword,
      location: {
        province: selectedProvince?.name || "",
        district: selectedDistrict?.name || "",
        ward: selectedWard?.name || "",
      },
      filters: {
        price: priceFilter,
        area: areaFilter,
        furnitureCondition: selectedFurnitureCondition,
        utility: selectedUtility,
      },
    };

    // Gọi search
    onSearch(searchData);

    // SỬA QUAN TRỌNG: Reset input sau khi search
    setSearchKeyword("");
  };

  const handleReset = () => {
    setSearchKeyword("");
    setSelectedProvince(null);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setDistricts([]);
    setWards([]);
    setSelectedFurnitureCondition("");
    setSelectedUtility("");
  };

  const handleProvinceSelect = async (province: any) => {
    setSelectedProvince(province);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setDistricts([]);
    setWards([]);
    setShowProvinceDropdown(false);

    try {
      const districtsData = await locationService.getDistricts(province.code);
      setDistricts(districtsData);
    } catch (error) {
      console.error("Error loading districts:", error);
    }
  };

  const handleDistrictSelect = async (district: any) => {
    setSelectedDistrict(district);
    setSelectedWard(null);
    setWards([]);
    setShowDistrictDropdown(false);

    try {
      const wardsData = await locationService.getWards(district.code);
      setWards(wardsData);
    } catch (error) {
      console.error("Error loading wards:", error);
    }
  };

  const handleWardSelect = (ward: any) => {
    setSelectedWard(ward);
    setShowWardDropdown(false);
  };

  const handleFurnitureConditionSelect = (condition: string) => {
    setSelectedFurnitureCondition(condition);
    setShowFurnitureDropdown(false);
  };

  const handleUtilitySelect = (utility: string) => {
    setSelectedUtility(utility);
    setShowUtilityDropdown(false);
  };

  const toggleProvinceDropdown = () => {
    setShowProvinceDropdown(!showProvinceDropdown);
    setShowDistrictDropdown(false);
    setShowWardDropdown(false);
    setShowFurnitureDropdown(false);
    setShowUtilityDropdown(false);
  };

  const toggleDistrictDropdown = () => {
    if (selectedProvince) {
      setShowDistrictDropdown(!showDistrictDropdown);
      setShowProvinceDropdown(false);
      setShowWardDropdown(false);
      setShowFurnitureDropdown(false);
      setShowUtilityDropdown(false);
    }
  };

  const toggleWardDropdown = () => {
    if (selectedDistrict) {
      setShowWardDropdown(!showWardDropdown);
      setShowProvinceDropdown(false);
      setShowDistrictDropdown(false);
      setShowFurnitureDropdown(false);
      setShowUtilityDropdown(false);
    }
  };

  const toggleFurnitureDropdown = () => {
    setShowFurnitureDropdown(!showFurnitureDropdown);
    setShowProvinceDropdown(false);
    setShowDistrictDropdown(false);
    setShowWardDropdown(false);
    setShowUtilityDropdown(false);
  };

  const toggleUtilityDropdown = () => {
    setShowUtilityDropdown(!showUtilityDropdown);
    setShowProvinceDropdown(false);
    setShowDistrictDropdown(false);
    setShowWardDropdown(false);
    setShowFurnitureDropdown(false);
  };

  const getFurnitureConditionLabel = () => {
    const condition = furnitureConditions.find(
      (fc) => fc.value === selectedFurnitureCondition
    );
    return condition ? condition.label : "Tình trạng nội thất";
  };

  const getUtilityLabel = () => {
    const utility = utilityOptions.find((u) => u.value === selectedUtility);
    return utility ? utility.label : "Tiện ích";
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4 mb-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Nhập từ khóa tìm kiếm..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSearchClick();
              }
            }}
          />
        </div>

        <button
          className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition duration-200 disabled:bg-blue-400"
          onClick={handleSearchClick}
          disabled={loading}
        >
          {loading ? "Đang tìm..." : "Tìm kiếm"}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4" ref={dropdownRef}>
        {/* Các filter location giữ nguyên */}
        <div className="flex-1 relative">
          <button
            onClick={toggleProvinceDropdown}
            className={`w-full px-4 py-3 border rounded-lg text-left flex items-center justify-between ${
              selectedProvince
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 bg-white"
            } hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <span
              className={selectedProvince ? "text-blue-600" : "text-gray-700"}
            >
              {selectedProvince?.name || "Tỉnh/Thành phố"}
            </span>
            <svg
              className="w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showProvinceDropdown && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-20 mt-1 max-h-60 overflow-y-auto">
              {provinces.map((province) => (
                <div
                  key={province.code}
                  className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
                  onClick={() => handleProvinceSelect(province)}
                >
                  {province.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* District Filter */}
        <div className="flex-1 relative">
          <button
            onClick={toggleDistrictDropdown}
            disabled={!selectedProvince}
            className={`w-full px-4 py-3 border rounded-lg text-left flex items-center justify-between ${
              !selectedProvince
                ? "border-gray-300 bg-gray-100 cursor-not-allowed"
                : selectedDistrict
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 bg-white hover:bg-gray-50"
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <span
              className={
                !selectedProvince
                  ? "text-gray-400"
                  : selectedDistrict
                  ? "text-blue-600"
                  : "text-gray-700"
              }
            >
              {selectedDistrict?.name || "Quận/Huyện"}
            </span>
            <svg
              className="w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showDistrictDropdown && selectedProvince && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-20 mt-1 max-h-60 overflow-y-auto">
              {districts.map((district) => (
                <div
                  key={district.code}
                  className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
                  onClick={() => handleDistrictSelect(district)}
                >
                  {district.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ward Filter */}
        <div className="flex-1 relative">
          <button
            onClick={toggleWardDropdown}
            disabled={!selectedDistrict}
            className={`w-full px-4 py-3 border rounded-lg text-left flex items-center justify-between ${
              !selectedDistrict
                ? "border-gray-300 bg-gray-100 cursor-not-allowed"
                : selectedWard
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 bg-white hover:bg-gray-50"
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <span
              className={
                !selectedDistrict
                  ? "text-gray-400"
                  : selectedWard
                  ? "text-blue-600"
                  : "text-gray-700"
              }
            >
              {selectedWard?.name || "Phường/Xã"}
            </span>
            <svg
              className="w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showWardDropdown && selectedDistrict && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-20 mt-1 max-h-60 overflow-y-auto">
              {wards.map((ward) => (
                <div
                  key={ward.code}
                  className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
                  onClick={() => handleWardSelect(ward)}
                >
                  {ward.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Furniture Condition Filter */}
        <div className="w-48 relative">
          <button
            onClick={toggleFurnitureDropdown}
            className={`w-full px-4 py-3 border rounded-lg text-left flex items-center justify-between ${
              selectedFurnitureCondition
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 bg-white"
            } hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <span
              className={
                selectedFurnitureCondition ? "text-blue-600" : "text-gray-700"
              }
            >
              {getFurnitureConditionLabel()}
            </span>
            <svg
              className="w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showFurnitureDropdown && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-20 mt-1">
              {furnitureConditions.map((condition, index) => (
                <div
                  key={index}
                  className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
                  onClick={() =>
                    handleFurnitureConditionSelect(condition.value)
                  }
                >
                  {condition.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Utility Filter */}
        <div className="w-48 relative">
          <button
            onClick={toggleUtilityDropdown}
            className={`w-full px-4 py-3 border rounded-lg text-left flex items-center justify-between ${
              selectedUtility
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 bg-white"
            } hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <span
              className={selectedUtility ? "text-blue-600" : "text-gray-700"}
            >
              {getUtilityLabel()}
            </span>
            <svg
              className="w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showUtilityDropdown && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-20 mt-1">
              {utilityOptions.map((utility, index) => (
                <div
                  key={index}
                  className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
                  onClick={() => handleUtilitySelect(utility.value)}
                >
                  {utility.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* PROGRESS BAR - CHUYỂN XUỐNG DƯỚI CÙNG CỦA FILTER ROW */}
      {loading && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div className="bg-blue-600 h-1.5 rounded-full animate-pulse"></div>
          </div>
          <div className="text-xs text-gray-500 mt-1 text-center">
            Đang tải dữ liệu...
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchHeader;
