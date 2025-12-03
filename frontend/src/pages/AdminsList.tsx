import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  Facebook,
  Globe,
  Phone,
  Banknote,
  UserCheck,
  Search,
  Filter,
} from "lucide-react";
import { adminsAPI } from "../api/api";

const AdminsList: React.FC = () => {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const data = await adminsAPI.getAdmins();
      setAdmins(data);
    } catch (error) {
      console.error("Error fetching admins:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.user?.full_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      admin.admin_number.toString().includes(searchQuery) ||
      admin.zalo?.includes(searchQuery)
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải danh sách admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 p-3 rounded-full">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            DANH SÁCH ADMIN
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Danh sách các Admin uy tín được cộng đồng tin tưởng và xác minh
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Tìm kiếm admin theo tên, số thứ tự, zalo..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Admins grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAdmins.map((admin) => (
            <div
              key={admin.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
            >
              {/* Header with number */}
              <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <UserCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-sm opacity-90">Admin số</div>
                      <div className="text-2xl font-bold">
                        #{admin.admin_number}
                      </div>
                    </div>
                  </div>
                  {admin.insurance_fund > 0 && (
                    <div className="text-right">
                      <div className="text-sm opacity-90">Quỹ bảo hiểm</div>
                      <div className="text-xl font-bold">
                        {admin.insurance_fund.toLocaleString()}đ
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Admin info */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {admin.user?.full_name || admin.user?.username}
                </h3>

                {/* Contact info */}
                <div className="space-y-3 mb-6">
                  {admin.facebook_main && (
                    <div className="flex items-center">
                      <Facebook className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0" />
                      <div className="truncate">
                        <div className="text-sm text-gray-600">
                          Facebook chính
                        </div>
                        <a
                          href={admin.facebook_main}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 truncate block"
                        >
                          {admin.facebook_main.replace("https://", "")}
                        </a>
                      </div>
                    </div>
                  )}

                  {admin.facebook_backup && (
                    <div className="flex items-center">
                      <Facebook className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
                      <div className="truncate">
                        <div className="text-sm text-gray-600">
                          Facebook phụ
                        </div>
                        <a
                          href={admin.facebook_backup}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 truncate block"
                        >
                          {admin.facebook_backup.replace("https://", "")}
                        </a>
                      </div>
                    </div>
                  )}

                  {admin.zalo && (
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                      <div>
                        <div className="text-sm text-gray-600">Zalo</div>
                        <div className="font-medium">{admin.zalo}</div>
                      </div>
                    </div>
                  )}

                  {admin.website && (
                    <div className="flex items-center">
                      <Globe className="h-5 w-5 text-purple-600 mr-3 flex-shrink-0" />
                      <div className="truncate">
                        <div className="text-sm text-gray-600">Website</div>
                        <a
                          href={admin.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-800 truncate block"
                        >
                          {admin.website.replace("https://", "")}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Services */}
                {admin.services && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Dịch vụ cung cấp
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(admin.services)
                        ? admin.services
                            .slice(0, 3)
                            .map((service: string, index: number) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                              >
                                {service}
                              </span>
                            ))
                        : Object.entries(admin.services).map(([key, value]) => (
                            <span
                              key={key}
                              className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                            >
                              {`${key}: ${value}`}
                            </span>
                          ))}
                      {Array.isArray(admin.services) &&
                        admin.services.length > 3 && (
                          <span className="px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-sm">
                            +{admin.services.length - 3} khác
                          </span>
                        )}
                    </div>
                  </div>
                )}

                {/* Bank accounts */}
                {admin.bank_accounts && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Tài khoản ngân hàng
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(admin.bank_accounts).map(
                        ([bank, account]) => (
                          <div
                            key={bank}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-gray-600">{bank}:</span>
                            <span className="font-medium">
                              {account as string}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* View details button */}
                <Link
                  to={`/admin/${admin.admin_number}`}
                  className="block w-full bg-red-600 text-white text-center font-semibold py-3 rounded-lg hover:bg-red-700"
                >
                  XEM CHI TIẾT
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* No results */}
        {filteredAdmins.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow">
            <UserCheck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Không tìm thấy admin
            </h3>
            <p className="text-gray-600">
              {searchQuery
                ? `Không tìm thấy admin nào phù hợp với "${searchQuery}"`
                : "Không có admin nào trong danh sách"}
            </p>
          </div>
        )}

        {/* Info note */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <Shield className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-blue-900 mb-2">
                Lưu ý về danh sách Admin
              </h4>
              <ul className="text-blue-800 space-y-2">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    Danh sách Admin được xác minh và công khai minh bạch
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    Admin có quỹ bảo hiểm để đảm bảo an toàn giao dịch
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    Liên hệ trực tiếp với Admin để được hỗ trợ và tư vấn
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    Kiểm tra kỹ thông tin trước khi thực hiện giao dịch
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminsList;
