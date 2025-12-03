import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  AlertTriangle,
  Users,
  Shield,
  TrendingUp,
  Clock,
  Eye,
  MessageSquare,
} from "lucide-react";

const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [todayWarnings, setTodayWarnings] = useState<any[]>([]);
  const [topScammers, setTopScammers] = useState<any[]>([]);
  const [topSearches, setTopSearches] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalWarnings: 0,
    totalViews: 0,
    totalReports: 0,
  });

  // Mock data - Thay bằng API call thực tế
  useEffect(() => {
    // TODO: Gọi API thực tế
    setTodayWarnings([
      {
        id: 1,
        title: "Nguyễn Tiến D - Fake bảo hiểm ảo lừa đảo",
        scammer_name: "Nguyễn Tiến D",
        view_count: 222,
        created_at: new Date(),
      },
      {
        id: 2,
        title: "Lừa đảo mua bán acc Free Fire",
        scammer_name: "Trần Văn A",
        view_count: 150,
        created_at: new Date(),
      },
      {
        id: 3,
        title: "Scam đầu tư tiền ảo Ponzi",
        scammer_name: "Lê Thị B",
        view_count: 89,
        created_at: new Date(),
      },
    ]);

    setTopScammers([
      { scammer_name: "084877393", warning_count: 3 },
      { scammer_name: "962NPS0211389380930", warning_count: 3 },
      { scammer_name: "0471014198888", warning_count: 2 },
      { scammer_name: "0789384972", warning_count: 2 },
      { scammer_name: "082991666", warning_count: 2 },
    ]);

    setTopSearches([
      { query: "40400792914617", search_count: 266 },
      { query: "0367268228", search_count: 19 },
      { query: "0326070092", search_count: 15 },
    ]);

    setStats({
      totalWarnings: 1245,
      totalViews: 125678,
      totalReports: 567,
    });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-red-600 to-red-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Bảo vệ bạn khỏi lừa đảo trực tuyến
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Tìm kiếm, cảnh báo và chia sẻ thông tin về các hình thức lừa đảo.
            Cùng nhau xây dựng cộng đồng an toàn.
          </p>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
              <input
                type="text"
                placeholder="Tìm kiếm số điện thoại, số tài khoản, link Facebook, tên..."
                className="w-full pl-12 pr-4 py-4 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-700 hover:bg-red-800 text-white px-6 py-2 rounded-lg"
              >
                Tìm kiếm
              </button>
            </div>
            <div className="mt-4 text-sm">
              <span className="text-red-200">Ví dụ: </span>
              <button
                type="button"
                onClick={() => setSearchQuery("084877393")}
                className="text-red-200 hover:text-white mx-2"
              >
                084877393
              </button>
              <button
                type="button"
                onClick={() => setSearchQuery("nguyễn tiến d")}
                className="text-red-200 hover:text-white mx-2"
              >
                nguyễn tiến d
              </button>
              <button
                type="button"
                onClick={() => setSearchQuery("707***378")}
                className="text-red-200 hover:text-white mx-2"
              >
                707***378
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <h3 className="text-3xl font-bold text-gray-900">
                {stats.totalWarnings.toLocaleString()}
              </h3>
            </div>
            <p className="text-gray-600">Cảnh báo lừa đảo</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Eye className="h-8 w-8 text-blue-600" />
              <h3 className="text-3xl font-bold text-gray-900">
                {stats.totalViews.toLocaleString()}
              </h3>
            </div>
            <p className="text-gray-600">Lượt xem</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Users className="h-8 w-8 text-green-600" />
              <h3 className="text-3xl font-bold text-gray-900">
                {stats.totalReports.toLocaleString()}
              </h3>
            </div>
            <p className="text-gray-600">Báo cáo từ cộng đồng</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Today Warnings */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-red-600 text-white px-6 py-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <h2 className="text-xl font-bold">CẢNH BÁO HÔM NAY</h2>
                </div>
              </div>

              <div className="divide-y">
                {todayWarnings.map((warning) => (
                  <Link
                    key={warning.id}
                    to={`/warning/${warning.id}`}
                    className="block p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">
                          {warning.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Chủ tk: {warning.scammer_name}</span>
                          <span className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {warning.view_count} lượt xem
                          </span>
                          <span>
                            {new Date(warning.created_at).toLocaleDateString(
                              "vi-VN"
                            )}
                          </span>
                        </div>
                      </div>
                      <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>

              <div className="p-6 border-t">
                <Link
                  to="/warnings"
                  className="text-red-600 hover:text-red-700 font-medium"
                >
                  Xem tất cả cảnh báo →
                </Link>
              </div>
            </div>

            {/* Report CTA */}
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl shadow-lg p-8 mt-8 text-center">
              <Shield className="h-12 w-12 text-white mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">
                Bạn bị lừa đảo?
              </h3>
              <p className="text-white mb-6">
                Hãy tố cáo để cảnh báo cộng đồng!
              </p>
              <Link
                to="/report"
                className="bg-white text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 inline-block"
              >
                TỐ CÁO NGAY
              </Link>
            </div>
          </div>

          {/* Right Column - Statistics */}
          <div className="space-y-8">
            {/* Top Scammers */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gray-900 text-white px-6 py-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <h2 className="text-xl font-bold">LỪA ĐẢO PHỔ BIẾN 7 NGÀY</h2>
                </div>
              </div>

              <div className="divide-y">
                {topScammers.map((scammer, index) => (
                  <div key={index} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-bold ${
                              index < 3
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            Top {index + 1}
                          </span>
                          <span className="font-medium">
                            {scammer.scammer_name}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {scammer.warning_count} bài cảnh báo
                        </div>
                      </div>
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Searches */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-blue-600 text-white px-6 py-4">
                <div className="flex items-center space-x-2">
                  <Search className="h-5 w-5" />
                  <h2 className="text-xl font-bold">TOP TÌM KIẾM NGÀY</h2>
                </div>
              </div>

              <div className="divide-y">
                {topSearches.map((search, index) => (
                  <Link
                    key={index}
                    to={`/search?q=${encodeURIComponent(search.query)}`}
                    className="block p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-gray-500">{index + 1}.</span>
                        <span className="font-medium">{search.query}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {search.search_count} lượt
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-bold text-lg mb-4">Hành động nhanh</h3>
              <div className="space-y-3">
                <Link
                  to="/report"
                  className="flex items-center justify-between p-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100"
                >
                  <span className="font-medium">Gửi tố cáo mới</span>
                  <AlertTriangle className="h-5 w-5" />
                </Link>
                <Link
                  to="/admins"
                  className="flex items-center justify-between p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
                >
                  <span className="font-medium">Danh sách Admin</span>
                  <Users className="h-5 w-5" />
                </Link>
                <Link
                  to="/warnings"
                  className="flex items-center justify-between p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100"
                >
                  <span className="font-medium">Xem tất cả cảnh báo</span>
                  <MessageSquare className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
