import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle, Home, AlertTriangle, Share2 } from "lucide-react";

const ReportSuccess: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Success icon */}
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>

          {/* Success message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Gửi tố cáo thành công! 🎉
          </h1>

          <p className="text-gray-600 mb-6">
            Cảm ơn bạn đã chia sẻ thông tin với cộng đồng. Bài viết của bạn đã
            được gửi đến đội ngũ kiểm duyệt và sẽ được xử lý trong thời gian sớm
            nhất.
          </p>

          {/* Stats */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">24h</div>
                <div className="text-sm text-gray-600">Thời gian xử lý</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">95%</div>
                <div className="text-sm text-gray-600">Tỷ lệ duyệt</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">1000+</div>
                <div className="text-sm text-gray-600">Cảnh báo mỗi ngày</div>
              </div>
            </div>
          </div>

          {/* Next steps */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
              Bước tiếp theo
            </h3>
            <ul className="text-left space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Đội ngũ Admin sẽ xem xét và kiểm duyệt bài viết</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Bài viết đạt chuẩn sẽ được đăng công khai</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Bạn sẽ nhận được thông báo khi bài viết được duyệt</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Thông tin của bạn sẽ giúp cảnh báo hàng nghìn người</span>
              </li>
            </ul>
          </div>

          {/* Share section */}
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <Share2 className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">
                Chia sẻ CheckScam với bạn bè
              </span>
            </div>
            <p className="text-sm text-blue-800 mb-3">
              Cùng nhau lan tỏa để bảo vệ cộng đồng khỏi lừa đảo
            </p>
            <div className="flex justify-center space-x-2">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                Chia sẻ Facebook
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                Chia sẻ Zalo
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <Link
              to="/"
              className="flex items-center justify-center space-x-2 w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-medium"
            >
              <Home className="h-5 w-5" />
              <span>Về trang chủ</span>
            </Link>

            <Link
              to="/report"
              className="block w-full border-2 border-red-600 text-red-600 py-3 rounded-lg hover:bg-red-50 font-medium"
            >
              Gửi tố cáo mới
            </Link>

            <Link
              to="/search"
              className="block w-full text-gray-600 py-3 rounded-lg hover:bg-gray-100 font-medium"
            >
              Tìm kiếm cảnh báo
            </Link>
          </div>

          {/* Footer note */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Mọi thắc mắc xin liên hệ:
              <a
                href="mailto:support@checkscam.vn"
                className="text-red-600 hover:text-red-700 ml-1"
              >
                support@checkscam.vn
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportSuccess;
