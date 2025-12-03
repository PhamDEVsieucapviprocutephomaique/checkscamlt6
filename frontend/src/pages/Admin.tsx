import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  AlertTriangle,
  Users,
  BarChart3,
  FileText,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  Clock,
  TrendingUp,
} from "lucide-react";
import {
  warningsAPI,
  reportsAPI,
  statisticsAPI,
  usersAPI,
  adminsAPI,
} from "../api/api";
import { useAuth } from "../context/AuthContext";

const Admin: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState<any>(null);
  const [pendingWarnings, setPendingWarnings] = useState<any[]>([]);
  const [pendingReports, setPendingReports] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [adminProfiles, setAdminProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [dashboardStats, warnings, reports, usersData, adminProfilesData] =
        await Promise.all([
          statisticsAPI.getDashboardStats(),
          warningsAPI.getPendingWarnings(),
          reportsAPI.getReports({ status: "pending" }),
          usersAPI.getUsers(),
          adminsAPI.getAllAdminProfiles(),
        ]);

      setStats(dashboardStats);
      setPendingWarnings(warnings);
      setPendingReports(reports);
      setUsers(usersData);
      setAdminProfiles(adminProfilesData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewWarning = async (
    warningId: number,
    status: "approved" | "rejected"
  ) => {
    try {
      await warningsAPI.reviewWarning(warningId, {
        status,
        review_note:
          status === "approved" ? "Đã kiểm duyệt" : "Vi phạm chính sách",
      });
      setPendingWarnings(pendingWarnings.filter((w) => w.id !== warningId));
    } catch (error) {
      console.error("Error reviewing warning:", error);
    }
  };

  const handleReviewReport = async (
    reportId: number,
    status: "approved" | "rejected"
  ) => {
    try {
      await reportsAPI.updateReport(reportId, { status });
      setPendingReports(pendingReports.filter((r) => r.id !== reportId));
    } catch (error) {
      console.error("Error reviewing report:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Quản trị viên
                </h1>
                <p className="text-sm text-gray-600">
                  Xin chào, {user?.full_name || user?.username}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 overflow-x-auto">
            {[
              { id: "dashboard", label: "Dashboard", icon: BarChart3 },
              { id: "warnings", label: "Cảnh báo", icon: AlertTriangle },
              { id: "reports", label: "Tố cáo", icon: FileText },
              { id: "users", label: "Người dùng", icon: Users },
              { id: "admins", label: "Admin", icon: Shield },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 font-medium whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-b-2 border-red-600 text-red-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                  {tab.id === "warnings" && pendingWarnings.length > 0 && (
                    <span className="bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {pendingWarnings.length}
                    </span>
                  )}
                  {tab.id === "reports" && pendingReports.length > 0 && (
                    <span className="bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {pendingReports.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tổng cảnh báo</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats?.total_warnings || 0}
                    </p>
                  </div>
                  <div className="bg-red-100 p-3 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <div className="mt-4 text-sm text-green-600">
                  <TrendingUp className="inline h-4 w-4 mr-1" />
                  +12% so với tháng trước
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tổng lượt xem</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats?.total_views?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Eye className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tố cáo mới</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats?.total_reports || 0}
                    </p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <FileText className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Người dùng mới</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {users.length || 0}
                    </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Two columns layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pending warnings */}
              <div className="bg-white rounded-xl shadow">
                <div className="p-6 border-b">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-yellow-600" />
                    Cảnh báo chờ duyệt ({pendingWarnings.length})
                  </h2>
                </div>
                <div className="divide-y">
                  {pendingWarnings.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      Không có cảnh báo nào chờ duyệt
                    </div>
                  ) : (
                    pendingWarnings.slice(0, 5).map((warning) => (
                      <div key={warning.id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1 line-clamp-2">
                              {warning.title}
                            </h4>
                            <div className="flex items-center space-x-3 text-sm text-gray-600">
                              <span>{warning.scammer_name}</span>
                              <span>•</span>
                              <span>{formatDate(warning.created_at)}</span>
                            </div>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() =>
                                handleReviewWarning(warning.id, "approved")
                              }
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                              title="Duyệt"
                            >
                              <CheckCircle className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() =>
                                handleReviewWarning(warning.id, "rejected")
                              }
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              title="Từ chối"
                            >
                              <XCircle className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {pendingWarnings.length > 5 && (
                  <div className="p-4 border-t text-center">
                    <button
                      onClick={() => setActiveTab("warnings")}
                      className="text-red-600 hover:text-red-700 font-medium"
                    >
                      Xem tất cả ({pendingWarnings.length})
                    </button>
                  </div>
                )}
              </div>

              {/* Top scammers */}
              <div className="bg-white rounded-xl shadow">
                <div className="p-6 border-b">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-red-600" />
                    Top Scammers 7 ngày
                  </h2>
                </div>
                <div className="divide-y">
                  {stats?.top_scammers?.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      Không có dữ liệu
                    </div>
                  ) : (
                    stats?.top_scammers
                      ?.slice(0, 5)
                      .map((scammer: any, index: number) => (
                        <div key={index} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <span
                                className={`font-bold ${
                                  index < 3 ? "text-red-600" : "text-gray-500"
                                }`}
                              >
                                #{index + 1}
                              </span>
                              <div>
                                <div className="font-medium">
                                  {scammer.scammer_name}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {scammer.bank_account} •{" "}
                                  {scammer.warning_count} cảnh báo
                                </div>
                              </div>
                            </div>
                            <button className="p-2 hover:bg-gray-100 rounded-lg">
                              <MoreVertical className="h-5 w-5 text-gray-400" />
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "warnings" && (
          <div className="bg-white rounded-xl shadow">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Quản lý cảnh báo
                </h2>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm cảnh báo..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    <Filter className="h-5 w-5" />
                    <span>Lọc</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tiêu đề
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Scammer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Người đăng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày đăng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pendingWarnings.map((warning) => (
                    <tr key={warning.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <div className="font-medium text-gray-900 truncate">
                            {warning.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {warning.category} • {warning.view_count} lượt xem
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium">
                          {warning.scammer_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {warning.bank_account}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {warning.reporter_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {warning.reporter_zalo}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(warning.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                          Chờ duyệt
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => navigate(`/warning/${warning.id}`)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Xem"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleReviewWarning(warning.id, "approved")
                            }
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            title="Duyệt"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleReviewWarning(warning.id, "rejected")
                            }
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Từ chối"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "admins" && (
          <div className="bg-white rounded-xl shadow">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Quản lý Admin
                </h2>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  Thêm Admin
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      STT
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thông tin liên hệ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dịch vụ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {adminProfiles.map((admin) => (
                    <tr key={admin.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-900">
                          #{admin.admin_number}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <UserCheck className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {admin.user?.full_name || admin.user?.username}
                            </div>
                            <div className="text-sm text-gray-500">
                              {admin.user?.role === "super_admin"
                                ? "Super Admin"
                                : "Admin"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {admin.facebook_main && (
                            <div className="text-sm">
                              <span className="text-gray-500">Fb:</span>{" "}
                              <a
                                href={admin.facebook_main}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                {admin.facebook_main.replace("https://", "")}
                              </a>
                            </div>
                          )}
                          {admin.zalo && (
                            <div className="text-sm">
                              <span className="text-gray-500">Zalo:</span>{" "}
                              {admin.zalo}
                            </div>
                          )}
                          {admin.website && (
                            <div className="text-sm">
                              <span className="text-gray-500">Web:</span>{" "}
                              <a
                                href={admin.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                {admin.website.replace("https://", "")}
                              </a>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {admin.services && Array.isArray(admin.services) && (
                            <div className="flex flex-wrap gap-1">
                              {admin.services
                                .slice(0, 3)
                                .map((service: string, index: number) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded"
                                  >
                                    {service}
                                  </span>
                                ))}
                              {admin.services.length > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{admin.services.length - 3} dịch vụ khác
                                </span>
                              )}
                            </div>
                          )}
                          {admin.insurance_fund > 0 && (
                            <div className="text-sm text-green-600">
                              Quỹ BH: {admin.insurance_fund.toLocaleString()}đ
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Chỉnh sửa"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Xóa"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
