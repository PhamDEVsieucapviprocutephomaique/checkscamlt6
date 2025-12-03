import React from "react";
import { ShieldAlert, Mail, Phone, Facebook, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="h-8 w-8 text-red-500" />
              <span className="text-2xl font-bold">
                Check<span className="text-red-500">Scam</span>
              </span>
            </div>
            <p className="text-gray-400">
              Hệ thống cảnh báo lừa đảo trực tuyến. Bảo vệ cộng đồng khỏi các
              hình thức lừa đảo.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-gray-400 hover:text-white">
                  Tìm kiếm
                </Link>
              </li>
              <li>
                <Link to="/report" className="text-gray-400 hover:text-white">
                  Tố cáo
                </Link>
              </li>
              <li>
                <Link to="/warnings" className="text-gray-400 hover:text-white">
                  Cảnh báo
                </Link>
              </li>
              <li>
                <Link to="/admins" className="text-gray-400 hover:text-white">
                  Admin
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Thể loại lừa đảo</h3>
            <ul className="space-y-2">
              <li className="text-gray-400">Lừa đảo Facebook</li>
              <li className="text-gray-400">Lừa đảo Zalo</li>
              <li className="text-gray-400">Lừa đảo ngân hàng</li>
              <li className="text-gray-400">Lừa đảo game</li>
              <li className="text-gray-400">Lừa đảo thương mại điện tử</li>
              <li className="text-gray-400">Lừa đảo đầu tư</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 text-gray-400">
                <Mail className="h-5 w-5" />
                <span>support@checkscam.vn</span>
              </li>
              <li className="flex items-center space-x-2 text-gray-400">
                <Phone className="h-5 w-5" />
                <span>1900 1234</span>
              </li>
            </ul>
            <div className="mt-6">
              <h4 className="font-semibold mb-2">Đăng ký nhận cảnh báo</h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Email của bạn"
                  className="flex-1 px-3 py-2 text-gray-900 rounded-l-lg focus:outline-none"
                />
                <button className="bg-red-600 px-4 py-2 rounded-r-lg hover:bg-red-700">
                  Đăng ký
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-400">
          <p>
            © {new Date().getFullYear()} CheckScam.vn. Tất cả các quyền được bảo
            hộ.
          </p>
          <p className="mt-2 text-sm">
            <Link to="/privacy" className="hover:text-white mx-2">
              Chính sách bảo mật
            </Link>{" "}
            |
            <Link to="/terms" className="hover:text-white mx-2">
              Điều khoản sử dụng
            </Link>{" "}
            |
            <Link to="/disclaimer" className="hover:text-white mx-2">
              Tuyên bố miễn trừ
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
