import React from "react";
import { Link } from "react-router-dom";

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Tìm Bạn Ở Ghép &
              <span className="block text-yellow-300">Phòng Trọ Lý Tưởng</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Kết nối sinh viên tìm bạn ở ghép và chủ trọ tìm người thuê phù hợp
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              <Link
                to="/find-roommate"
                className="bg-yellow-400 text-blue-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-300 transform hover:scale-105 transition duration-300 shadow-lg"
              >
                🎯 Tìm Bạn Ở Ghép
              </Link>
              <Link
                to="/find-room"
                className="bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-50 transform hover:scale-105 transition duration-300 shadow-lg"
              >
                🏠 Tìm Phòng Trọ
              </Link>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="fill-current text-white"
          >
            <path
              d="M1200 120L0 16.48 0 0 1200 0 1200 120z"
              className="shape-fill"
            ></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tại Sao Chọn Chúng Tôi?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Nền tảng kết nối hàng đầu dành cho sinh viên tìm bạn ở ghép và
              phòng trọ
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-xl transition duration-300">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Matching Thông Minh
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Thuật toán AI tìm người ở ghép phù hợp với tính cách, thói quen
                và sở thích của bạn
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition duration-300">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🏡</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Đa Dạng Lựa Chọn
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Hàng ngàn phòng trọ với đầy đủ thông tin, hình ảnh thực tế và
                đánh giá chân thực
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-xl transition duration-300">
              <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Tiết Kiệm Tối Đa
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Ở ghép giúp tiết kiệm chi phí, kết nối bạn bè và tạo cộng đồng
                sinh viên thân thiện
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-blue-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-yellow-400 mb-2">
                10,000+
              </div>
              <div className="text-blue-200">Thành Viên</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-yellow-400 mb-2">
                5,000+
              </div>
              <div className="text-blue-200">Phòng Trọ</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-yellow-400 mb-2">
                2,000+
              </div>
              <div className="text-blue-200">Match Thành Công</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-yellow-400 mb-2">50+</div>
              <div className="text-blue-200">Trường Đại Học</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Sẵn Sàng Tìm Kiếm?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Tham gia cộng đồng hàng nghìn sinh viên đang tìm kiếm bạn ở ghép
              và phòng trọ phù hợp
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/register"
                className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-700 transform hover:scale-105 transition duration-300 shadow-lg"
              >
                Đăng Ký Ngay
              </Link>
              <Link
                to="/find-room"
                className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-50 transform hover:scale-105 transition duration-300"
              >
                Khám Phá Phòng Trọ
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Câu Chuyện Thành Công
            </h2>
            <p className="text-xl text-gray-600">
              Những trải nghiệm thực tế từ cộng đồng của chúng tôi
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  TL
                </div>
                <div>
                  <div className="font-semibold">Trần Linh</div>
                  <div className="text-yellow-400">★★★★★</div>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "Nhờ platform này mình đã tìm được 2 bạn ở ghép cực kỳ hợp tính.
                Chúng mình không chỉ là bạn cùng phòng mà còn là những người bạn
                thân thiết!"
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  MN
                </div>
                <div>
                  <div className="font-semibold">Minh Nhật</div>
                  <div className="text-yellow-400">★★★★★</div>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "Phòng trọ mình tìm được qua đây rất đẹp và đúng với mô tả. Chủ
                trọ rất nhiệt tình và khu vực an ninh tốt. Rất hài lòng!"
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  HA
                </div>
                <div>
                  <div className="font-semibold">Hà Anh</div>
                  <div className="text-yellow-400">★★★★☆</div>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "Tính năng matching giúp mình tìm được bạn ở ghép có cùng lịch
                sinh hoạt và sở thích. Tiết kiệm được rất nhiều thời gian tìm
                kiếm!"
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
