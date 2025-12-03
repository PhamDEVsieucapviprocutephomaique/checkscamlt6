import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Eye,
  MessageSquare,
  Calendar,
  Filter,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
} from "lucide-react";
import { warningsAPI } from "../api/api";
import { useAuth } from "../context/AuthContext";

const MyWarnings: React.FC = () => {
  const { user } = useAuth();
  const [warnings, setWarnings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchMyWarnings();
  }, []);

  const fetchMyWarnings = async () => {
    try {
      const data = await warningsAPI.getMyWarnings();
      setWarnings(data);
    } catch (error) {
      console.error("Error fetching warnings:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredWarnings = warnings.filter((warning) => {
    // Apply status filter
    if (filter !== "all" && warning.status !== filter) {
      return false;
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        warning.title.toLowerCase().includes(query) ||
        warning.scammer_name.toLowerCase().includes(query) ||
        warning.bank_account?.toLowerCase().includes(query) ||
        warning.content.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      pending: {
        color: "bg-yellow-100 text-yellow-800",
        icon: Clock,
        text: "Chờ duyệt",
      },
      approved: {
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
        text: "Đã duyệt",
      },
      rejected: {
        color: "bg-red-100 text-red-800",
        icon: XCircle,
        text: "Từ chối",
      },
      deleted: {
        color: "bg-gray-100 text-gray-800",
        icon: Trash2,
        text: "Đã xóa",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${config.color}`}
      >
        <Icon className="h-3 w-3" />
        <span>{config.text}</span>
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải cảnh báo của bạn...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Cảnh báo của tôi
          </h1>
          <p className="text-gray-600">
            Quản lý tất cả cảnh báo bạn đã đăng trên hệ thống
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng số</p>
                <p className="text-3xl font-bold text-gray-900">
                  {warnings.length}
                </p>
              </div>
              <div className="bg-gray-100 p-3 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đã duyệt</p>
                <p className="text-3xl font-bold text-gray-900">
                  {warnings.filter((w) => w.status === "approved").length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Chờ duyệt</p>
                <p className="text-3xl font-bold text-gray-900">
                  {warnings.filter((w) => w.status === "pending").length}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng lượt xem</p>
                <p className="text-3xl font-bold text-gray-900">
                  {warnings.reduce((sum, w) => sum + (w.view_count || 0), 0)}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and search */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            {/* Status filters */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg ${
                  filter === "all"
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setFilter("pending")}
                className={`px-4 py-2 rounded-lg ${
                  filter === "pending"
                    ? "bg-yellow-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Chờ duyệt
              </button>
              <button
                onClick={() => setFilter("approved")}
                className={`px-4 py-2 rounded-lg ${
                  filter === "approved"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Đã duyệt
              </button>
              <button
                onClick={() => setFilter("rejected")}
                className={`px-4 py-2 rounded-lg ${
                  filter === "rejected"
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Từ chối
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Tìm kiếm trong cảnh báo của bạn..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 w-full md:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Warnings list */}
        {filteredWarnings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <AlertTriangle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery || filter !== "all"
                ? "Không tìm thấy cảnh báo phù hợp"
                : "Bạn chưa có cảnh báo nào"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || filter !== "all"
                ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                : "Hãy chia sẻ thông tin lừa đảo đầu tiên để bảo vệ cộng đồng"}
            </p>
            <Link
              to="/report"
              className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700"
            >
              Đăng cảnh báo mới
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredWarnings.map((warning) => (
              <div
                key={warning.id}
                className="bg-white rounded-xl shadow hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getStatusBadge(warning.status)}
                        <span className="text-sm text-gray-500">
                          {formatDate(warning.created_at)}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        <Link
                          to={`/warning/${warning.id}`}
                          className="hover:text-red-600"
                        >
                          {warning.title}
                        </Link>
                      </h3>

                      <p className="text-gray-600 line-clamp-2 mb-4">
                        {warning.content}
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          {warning.view_count || 0} lượt xem
                        </div>
                        <div className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          {warning.comment_count || 0} bình luận
                        </div>
                        {warning.scammer_name && (
                          <div>
                            <span className="text-gray-600">Scammer:</span>{" "}
                            <span className="font-medium">
                              {warning.scammer_name}
                            </span>
                          </div>
                        )}
                        {warning.bank_account && (
                          <div>
                            <span className="text-gray-600">TK:</span>{" "}
                            <span className="font-medium">
                              {warning.bank_account}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="ml-4 flex flex-col space-y-2">
                      {warning.status === "pending" && (
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                          <Edit className="h-5 w-5" />
                        </button>
                      )}
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {warning.status === "rejected" && warning.review_note && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start">
                        <XCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium text-red-900">
                            Lý do từ chối:
                          </div>
                          <div className="text-red-800 text-sm mt-1">
                            {warning.review_note}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create new warning CTA */}
        <div className="mt-8 bg-gradient-to-r from-red-600 to-red-700 rounded-xl shadow-lg p-8 text-center text-white">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">
            Chia sẻ để bảo vệ cộng đồng
          </h3>
          <p className="text-red-100 mb-6 max-w-2xl mx-auto">
            Mỗi cảnh báo của bạn có thể giúp hàng nghìn người tránh khỏi lừa
            đảo. Hãy tiếp tục đóng góp!
          </p>
          <Link
            to="/report"
            className="inline-block bg-white text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 text-lg"
          >
            ĐĂNG CẢNH BÁO MỚI
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MyWarnings;
