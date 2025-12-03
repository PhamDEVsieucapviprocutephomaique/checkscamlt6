import React, { useState, useCallback, useEffect } from "react";
import SearchHeader from "../components/SearchHeader";
import FiltersSidebar from "../components/FiltersSidebar";
import RoomList from "../components/RoomList";

const FindRoom: React.FC = () => {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useState<any>(null);
  const [searchType, setSearchType] = useState<"filter" | "keyword">("filter");
  const [filterData, setFilterData] = useState({
    priceRange: { min: "", max: "" },
    selectedPrice: "",
    areaRange: { min: "", max: "" },
    selectedArea: "",
  });

  const handleFilterChange = useCallback((newFilterData: any) => {
    setFilterData(newFilterData);
  }, []);

  // HÀM MỚI: Xử lý search bằng keyword (Elasticsearch)
  const handleKeywordSearch = async (
    keyword: string,
    pageNum: number = 1,
    limit: number = 20
  ) => {
    setLoading(true);
    setCurrentPage(pageNum);
    setSearchType("keyword");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/find-rooms/search-keyword?keyword=${encodeURIComponent(
          keyword
        )}&page=${pageNum}&limit=${limit}`
      );

      const data = await response.json();
      if (data.success) {
        setSearchResults(data.rooms || []);
        setTotalPages(data.total_pages || 1);
      }
    } catch (error) {
      console.error("Keyword search error:", error);
    } finally {
      setLoading(false);
    }
  };

  // HÀM MỚI: Xử lý search bằng filter (giữ nguyên logic cũ)
  const handleFilterSearch = async (searchData: any, pageNum: number = 1) => {
    setLoading(true);
    setSearchParams(searchData);
    setCurrentPage(pageNum);
    setSearchType("filter");

    try {
      const url =
        pageNum === 1
          ? "http://127.0.0.1:8000/api/find-rooms/search"
          : `http://127.0.0.1:8000/api/find-rooms/search/page/${pageNum}`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(searchData),
      });

      const data = await response.json();
      if (data.success) {
        setSearchResults(data.rooms || []);
        setTotalPages(data.total_pages || 1);

        if (pageNum !== 1) {
          const roomListElement = document.getElementById("room-list");
          if (roomListElement) {
            roomListElement.scrollTop = 0;
          }
        }
      }
    } catch (error) {
      console.error("Filter search error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Search handler chính - PHÂN LOẠI KEYWORD vs FILTER
  const handleSearch = async (searchData: any) => {
    console.log("📤 Dữ liệu gửi lên server:", searchData);

    if (searchData.keyword && searchData.keyword.trim() !== "") {
      await handleKeywordSearch(searchData.keyword.trim(), 1);
    } else {
      await handleFilterSearch(searchData, 1);
    }
  };

  // Load page handler - XỬ LÝ PHÂN TRANG CHO CẢ 2 LOẠI
  const handleLoadPage = async (pageNum: number) => {
    if (searchType === "keyword" && searchParams?.keyword) {
      await handleKeywordSearch(searchParams.keyword, pageNum);
    } else if (searchType === "filter" && searchParams) {
      await handleFilterSearch(searchParams, pageNum);
    }
  };

  // Room click handler - SỬA QUAN TRỌNG: GỌI API CHI TIẾT
  const handleRoomClick = async (roomId: string) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/find-rooms/${roomId}`
      );
      const data = await response.json();
      if (data.success) {
        setSelectedRoom(data.room); // data.room chứa đầy đủ thông tin từ API detail
      }
    } catch (error) {
      console.error("Room detail error:", error);
    }
  };

  // HÀM MỚI: Đóng overlay
  const handleCloseOverlay = () => {
    setSelectedRoom(null);
  };

  useEffect(() => {
    const initialSearchData = {
      keyword: "",
      location: {
        province: "",
        district: "",
        ward: "",
      },
      filters: {
        price: {},
        area: {},
        furnitureCondition: "",
        utility: "",
      },
    };

    handleSearch(initialSearchData);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <SearchHeader
          onSearch={handleSearch}
          loading={loading}
          filterData={filterData}
        />

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-1/4">
            <FiltersSidebar onFilterChange={handleFilterChange} />
          </div>

          <div className="lg:w-3/4">
            <RoomList
              rooms={searchResults}
              loading={loading}
              selectedRoom={selectedRoom}
              onRoomClick={handleRoomClick}
              onCloseOverlay={handleCloseOverlay} // THÊM PROP MỚI
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handleLoadPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindRoom;
