import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  AlertTriangle,
  Eye,
  Calendar,
  Ban,
  Facebook,
  Phone,
  X,
} from "lucide-react";
import { warningsAPI } from "../api/api";

const SearchPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchType, setSearchType] = useState<string>("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  useEffect(() => {
    if (initialQuery) {
      handleSearch();
    }
  }, [initialQuery]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!searchQuery.trim()) return;

    setLoading(true);
    setPage(1);

    try {
      const data = await warningsAPI.search(searchQuery, searchType, 1, limit);
      setResults(data);
      setTotalResults(data.length);

      // Update URL
      navigate(
        `/search?q=${encodeURIComponent(searchQuery)}${
          searchType ? `&type=${searchType}` : ""
        }`
      );
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setResults([]);
    setTotalResults(0);
    navigate("/search");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const maskBankAccount = (account: string) => {
    if (!account) return "";
    if (account.includes("*")) return account;
    if (account.length <= 3) return account;
    return (
      account.slice(0, 3) + "*".repeat(account.length - 6) + account.slice(-3)
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Tìm kiếm cảnh báo lừa đảo
          </h1>

          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
              <input
                type="text"
                placeholder="Nhập số điện thoại, số tài khoản, link Facebook, tên..."
                className="w-full pl-12 pr-32 py-4 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-2">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
                <button
                  type="submit"
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
                >
                  Tìm kiếm
                </button>
              </div>
            </div>
          </form>

          {/* Search filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setSearchType("")}
              className={`px-4 py-2 rounded-lg ${
                searchType === ""
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setSearchType("phone")}
              className={`px-4 py-2 rounded-lg ${
                searchType === "phone"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Số điện thoại
            </button>
            <button
              onClick={() => setSearchType("bank_account")}
              className={`px-4 py-2 rounded-lg ${
                searchType === "bank_account"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Số tài khoản
            </button>
            <button
              onClick={() => setSearchType("facebook")}
              className={`px-4 py-2 rounded-lg ${
                searchType === "facebook"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Facebook
            </button>
            <button
              onClick={() => setSearchType("name")}
              className={`px-4 py-2 rounded-lg ${
                searchType === "name"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Tên
            </button>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tìm kiếm...</p>
          </div>
        ) : (
          <>
            {searchQuery && (
              <div className="mb-6">
                <p className="text-gray-600">
                  Tìm thấy <span className="font-semibold">{totalResults}</span>{" "}
                  kết quả cho "{searchQuery}"
                </p>
              </div>
            )}

            {results.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow">
                <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Không tìm thấy kết quả
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery
                    ? `Không tìm thấy cảnh báo nào cho "${searchQuery}"`
                    : "Nhập từ khóa để tìm kiếm cảnh báo lừa đảo"}
                </p>
                <div className="space-y-3 max-w-sm mx-auto">
                  <p className="text-sm text-gray-500">Gợi ý tìm kiếm:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <button
                      onClick={() => setSearchQuery("084877393")}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                    >
                      084877393
                    </button>
                    <button
                      onClick={() => setSearchQuery("nguyễn tiến d")}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                    >
                      nguyễn tiến d
                    </button>
                    <button
                      onClick={() => setSearchQuery("707***378")}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                    >
                      707***378
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((warning) => (
                  <div
                    key={warning.id}
                    className="bg-white rounded-xl shadow hover:shadow-md transition-shadow p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                          <h3 className="text-lg font-semibold text-gray-900">
                            <a
                              href={`/warning/${warning.id}`}
                              className="hover:text-red-600"
                            >
                              {warning.title}
                            </a>
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {warning.scammer_name && (
                            <div className="flex items-center text-sm">
                              <span className="text-gray-600 mr-2">Tên:</span>
                              <span className="font-medium">
                                {warning.scammer_name}
                              </span>
                            </div>
                          )}

                          {warning.bank_account && (
                            <div className="flex items-center text-sm">
                              <Ban className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-gray-600 mr-2">TK:</span>
                              <span className="font-medium">
                                {maskBankAccount(warning.bank_account)}
                              </span>
                              {warning.bank_name && (
                                <span className="ml-2 text-gray-500">
                                  ({warning.bank_name})
                                </span>
                              )}
                            </div>
                          )}

                          {warning.facebook_link && (
                            <div className="flex items-center text-sm">
                              <Facebook className="h-4 w-4 text-gray-400 mr-2" />
                              <a
                                href={warning.facebook_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 truncate"
                              >
                                {warning.facebook_link.replace("https://", "")}
                              </a>
                            </div>
                          )}

                          {warning.reporter_zalo && (
                            <div className="flex items-center text-sm">
                              <Phone className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-gray-600 mr-2">Zalo:</span>
                              <span>{warning.reporter_zalo}</span>
                            </div>
                          )}
                        </div>

                        <p className="text-gray-700 line-clamp-2 mb-4">
                          {warning.content}
                        </p>

                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {warning.view_count || 0} lượt xem
                          </div>
                          <div className="flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            {warning.warning_count || 1} lần cảnh báo
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(warning.created_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
