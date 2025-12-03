import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Shield,
  Edit,
  Save,
  X,
  Calendar,
  AlertTriangle,
  MessageSquare,
  Eye,
  Upload,
} from "lucide-react";
import { authAPI, warningsAPI } from "../api/api";
import { useAuth } from "../context/AuthContext";

const Profile: React.FC = () => {
  const { user, login } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userStats, setUserStats] = useState({
    warningsCount: 0,
    commentsCount: 0,
    totalViews: 0,
  });
  const [recentWarnings, setRecentWarnings] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    zalo_contact: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
        zalo_contact: user.zalo_contact || "",
      });
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const warnings = await warningsAPI.getMyWarnings();
      setUserStats({
        warningsCount: warnings.length,
        commentsCount: 0, // You might need to implement this
        totalViews: warnings.reduce(
          (sum: number, w: any) => sum + (w.view_count || 0),
          0
        ),
      });
      setRecentWarnings(warnings.slice(0, 5));
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const updatedUser = await authAPI.updateProfile(formData);
      login(localStorage.getItem("access_token") || "", updatedUser);
      setEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;

    const file = e.target.files[0];
    setLoading(true);

    try {
      const result = await authAPI.uploadAvatar(file);
      // Update user with new avatar URL
      const updatedUser = { ...user, avatar_url: result.avatar_url };
      login(localStorage.getItem("access_token") || "", updatedUser);
    } catch (error) {
      console.error("Error uploading avatar:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return "Chưa có thông tin";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 max-w-md mx-auto">
          <Shield className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Vui lòng đăng nhập
          </h2>
          <p className="text-gray-600 mb-4">
            Bạn cần đăng nhập để xem trang này
          </p>
          <a href="/login" className="btn-primary inline-block">
            Đăng nhập ngay
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Hồ sơ cá nhân
          </h1>
          <p className="text-gray-600">
            Quản lý thông tin và hoạt động của bạn trên CheckScam
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Profile info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Thông tin cá nhân
                </h2>
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center space-x-2 text-red-600 hover:text-red-700"
                  >
                    <Edit className="h-5 w-5" />
                    <span>Chỉnh sửa</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditing(false)}
                      className="flex items-center space-x-2 text-gray-600 hover:text-gray-700"
                    >
                      <X className="h-5 w-5" />
                      <span>Hủy</span>
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      <Save className="h-5 w-5" />
                      <span>{loading ? "Đang lưu..." : "Lưu thay đổi"}</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-start space-x-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-red-600 text-white p-2 rounded-full cursor-pointer hover:bg-red-700">
                    <Upload className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </label>
                </div>

                {/* Form fields */}
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên đăng nhập
                      </label>
                      <input
                        type="text"
                        value={user.username}
                        disabled
                        className="input-field bg-gray-50 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Họ và tên
                      </label>
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        disabled={!editing}
                        className={`input-field ${
                          !editing ? "bg-gray-50 cursor-not-allowed" : ""
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          disabled={!editing}
                          className={`pl-10 input-field ${
                            !editing ? "bg-gray-50 cursor-not-allowed" : ""
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số điện thoại
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          disabled={!editing}
                          className={`pl-10 input-field ${
                            !editing ? "bg-gray-50 cursor-not-allowed" : ""
                          }`}
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Zalo liên hệ
                      </label>
                      <input
                        type="text"
                        name="zalo_contact"
                        value={formData.zalo_contact}
                        onChange={handleChange}
                        disabled={!editing}
                        className={`input-field ${
                          !editing ? "bg-gray-50 cursor-not-allowed" : ""
                        }`}
                        placeholder="Nhập số Zalo của bạn"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Role and status */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-6">
                  <div>
                    <span className="text-sm text-gray-600">Vai trò</span>
                    <div className="flex items-center space-x-2 mt-1">
                      <Shield
                        className={`h-5 w-5 ${
                          user.role === "admin"
                            ? "text-red-600"
                            : "text-gray-400"
                        }`}
                      />
                      <span className="font-medium">
                        {user.role === "admin" ? "Quản trị viên" : "Người dùng"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm text-gray-600">Trạng thái</span>
                    <div className="mt-1">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          user.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.is_active ? "Đang hoạt động" : "Đã khóa"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm text-gray-600">Ngày tham gia</span>
                    <div className="flex items-center space-x-2 mt-1">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <span>
                        {user.created_at
                          ? formatDate(user.created_at)
                          : "Chưa có thông tin"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent warnings */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Cảnh báo gần đây của bạn
              </h2>

              {recentWarnings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Bạn chưa đăng cảnh báo nào</p>
                  <a
                    href="/report"
                    className="text-red-600 hover:text-red-700 font-medium mt-2 inline-block"
                  >
                    Đăng cảnh báo đầu tiên
                  </a>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentWarnings.map((warning) => (
                    <div
                      key={warning.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-red-300 hover:bg-red-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">
                            <a
                              href={`/warning/${warning.id}`}
                              className="hover:text-red-600"
                            >
                              {warning.title}
                            </a>
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <Eye className="h-4 w-4 mr-1" />
                              {warning.view_count || 0} lượt xem
                            </span>
                            <span className="flex items-center">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              {warning.comment_count || 0} bình luận
                            </span>
                            <span>
                              {warning.created_at
                                ? formatDate(warning.created_at)
                                : "Chưa có thông tin"}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            warning.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : warning.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {warning.status === "approved"
                            ? "Đã duyệt"
                            : warning.status === "pending"
                            ? "Chờ duyệt"
                            : "Từ chối"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {userStats.warningsCount > 5 && (
                <div className="mt-6 text-center">
                  <a
                    href="/my-warnings"
                    className="text-red-600 hover:text-red-700 font-medium"
                  >
                    Xem tất cả cảnh báo ({userStats.warningsCount})
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Right column - Stats */}
          <div className="space-y-6">
            {/* Stats card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-bold text-gray-900 mb-4">
                Thống kê hoạt động
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="bg-red-100 p-2 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">
                        Cảnh báo đã đăng
                      </div>
                      <div className="text-2xl font-bold">
                        {userStats.warningsCount}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <MessageSquare className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Bình luận</div>
                      <div className="text-2xl font-bold">
                        {userStats.commentsCount}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Eye className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Tổng lượt xem</div>
                      <div className="text-2xl font-bold">
                        {userStats.totalViews}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-bold text-gray-900 mb-4">Hành động nhanh</h3>
              <div className="space-y-3">
                <a
                  href="/report"
                  className="flex items-center justify-between p-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100"
                >
                  <span className="font-medium">Đăng cảnh báo mới</span>
                  <AlertTriangle className="h-5 w-5" />
                </a>

                <a
                  href="/my-warnings"
                  className="flex items-center justify-between p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
                >
                  <span className="font-medium">Xem cảnh báo của tôi</span>
                  <Eye className="h-5 w-5" />
                </a>

                <a
                  href="/search"
                  className="flex items-center justify-between p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100"
                >
                  <span className="font-medium">Tìm kiếm cảnh báo</span>
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </a>
              </div>
            </div>

            {/* Account security */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-bold text-gray-900 mb-4">
                Bảo mật tài khoản
              </h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50">
                  <div className="font-medium text-gray-900">Đổi mật khẩu</div>
                  <div className="text-sm text-gray-600">
                    Cập nhật mật khẩu mới
                  </div>
                </button>

                <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50">
                  <div className="font-medium text-gray-900">Xóa tài khoản</div>
                  <div className="text-sm text-gray-600">
                    Xóa vĩnh viễn tài khoản
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
