import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Shield,
  Facebook,
  Globe,
  Phone,
  Banknote,
  UserCheck,
  Mail,
  MessageSquare,
  Star,
  CheckCircle,
  Award,
  Users,
  TrendingUp,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { adminsAPI } from "../api/api";

const AdminDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("info");

  useEffect(() => {
    fetchAdmin();
  }, [id]);

  const fetchAdmin = async () => {
    try {
      const data = await adminsAPI.getAdminByNumber(Number(id));
      setAdmin(data);
    } catch (error) {
      console.error("Error fetching admin:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin admin...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Không tìm thấy admin
        </h1>
        <p className="text-gray-600 mb-6">
          Admin bạn tìm kiếm không tồn tại hoặc đã bị xóa.
        </p>
        <Link
          to="/admins"
          className="text-red-600 hover:text-red-700 font-medium flex items-center justify-center"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Quay về danh sách admin
        </Link>
      </div>
    );
  }

  const bankAccounts = admin.bank_accounts || {};
  const services = admin.services || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Back button */}
        <Link
          to="/admins"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Quay về danh sách admin
        </Link>

        {/* Admin header */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-2xl shadow-xl text-white overflow-hidden mb-8">
          <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="flex items-center space-x-4 mb-6 md:mb-0">
                <div className="bg-white/20 p-4 rounded-2xl">
                  <UserCheck className="h-12 w-12" />
                </div>
                <div>
                  <div className="text-sm opacity-90 mb-1">Admin số</div>
                  <div className="text-4xl font-bold mb-2">
                    #{admin.admin_number}
                  </div>
                  <h1 className="text-2xl font-bold">
                    {admin.user?.full_name || admin.user?.username}
                  </h1>
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="flex items-center bg-white/20 px-3 py-1 rounded-full">
                      <Shield className="h-4 w-4 mr-1" />
                      <span className="text-sm">
                        {admin.user?.role === "super_admin"
                          ? "Super Admin"
                          : "Admin"}
                      </span>
                    </div>
                    {admin.insurance_fund > 0 && (
                      <div className="flex items-center bg-green-500/20 px-3 py-1 rounded-full">
                        <Banknote className="h-4 w-4 mr-1" />
                        <span className="text-sm">
                          Quỹ BH: {admin.insurance_fund.toLocaleString()}đ
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm opacity-90 mb-2">
                  Đánh giá cộng đồng
                </div>
                <div className="flex items-center justify-end space-x-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-6 w-6 ${
                        star <= 4
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-xl font-bold">4.8/5</span>
                </div>
                <div className="text-sm opacity-90">
                  Đã hỗ trợ 1,000+ giao dịch
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Main info */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-lg mb-6">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab("info")}
                  className={`flex-1 py-4 font-medium text-center ${
                    activeTab === "info"
                      ? "border-b-2 border-red-600 text-red-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Thông tin liên hệ
                </button>
                <button
                  onClick={() => setActiveTab("services")}
                  className={`flex-1 py-4 font-medium text-center ${
                    activeTab === "services"
                      ? "border-b-2 border-red-600 text-red-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Dịch vụ
                </button>
                <button
                  onClick={() => setActiveTab("banks")}
                  className={`flex-1 py-4 font-medium text-center ${
                    activeTab === "banks"
                      ? "border-b-2 border-red-600 text-red-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Tài khoản ngân hàng
                </button>
              </div>

              {/* Tab content */}
              <div className="p-6">
                {activeTab === "info" && (
                  <div className="space-y-6">
                    {/* Contact info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {admin.facebook_main && (
                        <div className="flex items-start space-x-3">
                          <div className="bg-blue-100 p-3 rounded-lg">
                            <Facebook className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 mb-1">
                              Facebook chính
                            </div>
                            <a
                              href={admin.facebook_main}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                            >
                              {admin.facebook_main.replace("https://", "")}
                              <ExternalLink className="h-4 w-4 ml-2" />
                            </a>
                          </div>
                        </div>
                      )}

                      {admin.facebook_backup && (
                        <div className="flex items-start space-x-3">
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <Facebook className="h-6 w-6 text-blue-500" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 mb-1">
                              Facebook phụ
                            </div>
                            <a
                              href={admin.facebook_backup}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                            >
                              {admin.facebook_backup.replace("https://", "")}
                              <ExternalLink className="h-4 w-4 ml-2" />
                            </a>
                          </div>
                        </div>
                      )}

                      {admin.zalo && (
                        <div className="flex items-start space-x-3">
                          <div className="bg-green-100 p-3 rounded-lg">
                            <Phone className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 mb-1">
                              Zalo liên hệ
                            </div>
                            <div className="font-medium">{admin.zalo}</div>
                          </div>
                        </div>
                      )}

                      {admin.website && (
                        <div className="flex items-start space-x-3">
                          <div className="bg-purple-100 p-3 rounded-lg">
                            <Globe className="h-6 w-6 text-purple-600" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 mb-1">
                              Website
                            </div>
                            <a
                              href={admin.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-600 hover:text-purple-800 font-medium flex items-center"
                            >
                              {admin.website.replace("https://", "")}
                              <ExternalLink className="h-4 w-4 ml-2" />
                            </a>
                          </div>
                        </div>
                      )}

                      {admin.user?.email && (
                        <div className="flex items-start space-x-3">
                          <div className="bg-gray-100 p-3 rounded-lg">
                            <Mail className="h-6 w-6 text-gray-600" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 mb-1">
                              Email
                            </div>
                            <div className="font-medium">
                              {admin.user.email}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {admin.description && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                          Giới thiệu
                        </h3>
                        <p className="text-gray-700">{admin.description}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "services" && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Dịch vụ cung cấp
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Array.isArray(services)
                        ? services.map((service: string, index: number) => (
                            <div
                              key={index}
                              className="bg-gray-50 p-4 rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <span className="font-medium">{service}</span>
                              </div>
                            </div>
                          ))
                        : Object.entries(services).map(([key, value]) => (
                            <div
                              key={key}
                              className="bg-gray-50 p-4 rounded-lg"
                            >
                              <div className="font-medium mb-1">{key}</div>
                              <div className="text-sm text-gray-600">
                                {value as string}
                              </div>
                            </div>
                          ))}
                    </div>
                  </div>
                )}

                {activeTab === "banks" && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Tài khoản ngân hàng
                    </h3>
                    <div className="space-y-4">
                      {Object.entries(bankAccounts).map(([bank, account]) => (
                        <div key={bank} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="bg-white p-2 rounded-lg">
                                <Banknote className="h-5 w-5 text-gray-600" />
                              </div>
                              <div>
                                <div className="font-medium">{bank}</div>
                                <div className="text-2xl font-bold text-gray-900">
                                  {account as string}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-600">
                                Chủ tài khoản
                              </div>
                              <div className="font-medium">
                                {admin.user?.full_name || admin.user?.username}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Insurance fund info */}
            {admin.insurance_fund > 0 && (
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Award className="h-6 w-6" />
                      <h3 className="text-xl font-bold">Quỹ Bảo Hiểm CS</h3>
                    </div>
                    <p className="text-green-100 mb-4">
                      Từ ngày 16/04/2021, Admin cam kết bảo đảm an toàn cho bạn
                      với số tiền nằm trong Quỹ Bảo Hiểm
                    </p>
                    <div className="text-3xl font-bold">
                      {admin.insurance_fund.toLocaleString()} VNĐ
                    </div>
                  </div>
                  <Shield className="h-16 w-16 opacity-20" />
                </div>
              </div>
            )}
          </div>

          {/* Right column - Stats & CTA */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-bold text-gray-900 mb-4">
                Thống kê hoạt động
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="text-sm text-gray-600">
                        Khách hàng đã hỗ trợ
                      </div>
                      <div className="text-xl font-bold">1,000+</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="text-sm text-gray-600">
                        Giao dịch thành công
                      </div>
                      <div className="text-xl font-bold">95%</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <div>
                      <div className="text-sm text-gray-600">
                        Thời gian hoạt động
                      </div>
                      <div className="text-xl font-bold">3+ năm</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="h-5 w-5 text-yellow-600" />
                    <div>
                      <div className="text-sm text-gray-600">Đánh giá tốt</div>
                      <div className="text-xl font-bold">4.8/5</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact CTA */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-bold text-gray-900 mb-4">
                Liên hệ với Admin
              </h3>
              <p className="text-gray-600 mb-6">
                Liên hệ trực tiếp với Admin để được tư vấn và hỗ trợ
              </p>

              <div className="space-y-3">
                {admin.zalo && (
                  <a
                    href={`https://zalo.me/${admin.zalo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-2 bg-green-600 text-white p-3 rounded-lg hover:bg-green-700"
                  >
                    <Phone className="h-5 w-5" />
                    <span>Nhắn tin Zalo</span>
                  </a>
                )}

                {admin.facebook_main && (
                  <a
                    href={admin.facebook_main}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-2 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700"
                  >
                    <Facebook className="h-5 w-5" />
                    <span>Nhắn tin Facebook</span>
                  </a>
                )}
              </div>
            </div>

            {/* Verification badge */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="h-8 w-8" />
                <div>
                  <h4 className="font-bold">ĐÃ ĐƯỢC XÁC MINH</h4>
                  <p className="text-red-100 text-sm">
                    Admin uy tín - Đã kiểm duyệt
                  </p>
                </div>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>Thông tin công khai minh bạch</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>Đã xác minh danh tính</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>Có quỹ bảo hiểm đảm bảo</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDetail;
