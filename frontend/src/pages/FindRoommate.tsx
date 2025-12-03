import React from "react";
import Card from "../components/UI/Card";

const FindRoommate: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Tiêu đề chính */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Tính năng đang bảo trì
        </h1>
        <p className="text-xl text-gray-600 mb-2">Sắp ra mắt</p>
        <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
      </div>

      {/* Thông báo chính */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 mb-8">
          <div className="text-6xl mb-4">🚧</div>
          <h2 className="text-2xl font-bold text-yellow-800 mb-4">
            Tính năng Tìm Bạn Ở Ghép đang được phát triển
          </h2>
          <p className="text-yellow-700 text-lg mb-4">
            Chúng tôi đang nỗ lực hoàn thiện tính năng này để mang đến trải
            nghiệm tốt nhất cho bạn.
          </p>
          <p className="text-yellow-600">
            Dự kiến ra mắt trong thời gian sớm nhất!
          </p>
        </div>
      </div>

      {/* Giới thiệu tính năng sắp tới */}
      <div className="max-w-6xl mx-auto">
        <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">
          Tính năng sắp có
        </h3>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="text-center p-6">
            <div className="text-4xl mb-4">👥</div>
            <h4 className="text-xl font-semibold mb-3">
              Kết nối bạn cùng phòng
            </h4>
            <p className="text-gray-600">
              Tìm kiếm và kết nối với những người có cùng sở thích, thói quen
              sinh hoạt
            </p>
          </Card>

          <Card className="text-center p-6">
            <div className="text-4xl mb-4">🎯</div>
            <h4 className="text-xl font-semibold mb-3">Tìm kiếm thông minh</h4>
            <p className="text-gray-600">
              Lọc theo độ tuổi, giới tính, trường học, sở thích và nhiều tiêu
              chí khác
            </p>
          </Card>

          <Card className="text-center p-6">
            <div className="text-4xl mb-4">💬</div>
            <h4 className="text-xl font-semibold mb-3">Trò chuyện trực tiếp</h4>
            <p className="text-gray-600">
              Nhắn tin trực tiếp để làm quen và trao đổi thông tin trước khi
              quyết định
            </p>
          </Card>
        </div>

        {/* Thông tin liên hệ */}
        <div className="bg-blue-50 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-blue-800 mb-4">
            Bạn muốn nhận thông báo khi tính năng ra mắt?
          </h3>
          <p className="text-blue-700 mb-6">
            Để lại email để chúng tôi thông báo ngay khi tính năng Tìm Bạn Ở
            Ghép được ra mắt.
          </p>
          <div className="max-w-md mx-auto flex gap-2">
            <input
              type="email"
              placeholder="Nhập email của bạn"
              className="flex-1 px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200">
              Đăng ký
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-12 pt-8 border-t border-gray-200">
        <p className="text-gray-500">
          Trang web đang trong giai đoạn phát triển • Cảm ơn bạn đã quan tâm!
        </p>
      </div>
    </div>
  );
};

export default FindRoommate;
