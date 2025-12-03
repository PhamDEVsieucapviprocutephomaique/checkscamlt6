import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, User, Phone, MapPin, Shield } from "lucide-react";

interface PersonalInfoProps {
  message: string;
  setMessage: (message: string) => void;
}

const PersonalInfo: React.FC<PersonalInfoProps> = ({ message, setMessage }) => {
  const [loading, setLoading] = useState(false);
  const [landlordInfo, setLandlordInfo] = useState({
    fullName: "",
    phone: "",
    identityCard: "",
    address: "",
    companyName: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setMessage("Cập nhật thông tin thành công!");
      setLoading(false);
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8"
    >
      {/* Header với message động viên */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3">
          Hoàn Thiện Hồ Sơ Cá Nhân
        </h2>
        <p className="text-slate-600 text-lg max-w-2xl mx-auto">
          Hãy cung cấp đầy đủ thông tin để thuật toán của chúng tôi có thể giúp
          bài đăng của bạn tiếp cận đúng đối tượng và đạt hiệu quả cao nhất
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Họ và tên đầy đủ *
            </label>
            <input
              type="text"
              value={landlordInfo.fullName}
              onChange={(e) =>
                setLandlordInfo({ ...landlordInfo, fullName: e.target.value })
              }
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 transition duration-200"
              placeholder="Nhập họ và tên đầy đủ"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Số điện thoại *
            </label>
            <input
              type="tel"
              value={landlordInfo.phone}
              onChange={(e) =>
                setLandlordInfo({ ...landlordInfo, phone: e.target.value })
              }
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 transition duration-200"
              placeholder="Số điện thoại liên hệ"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              CMND/CCCD *
            </label>
            <input
              type="text"
              value={landlordInfo.identityCard}
              onChange={(e) =>
                setLandlordInfo({
                  ...landlordInfo,
                  identityCard: e.target.value,
                })
              }
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 transition duration-200"
              placeholder="Số CMND/CCCD"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Tên công ty (nếu có)
            </label>
            <input
              type="text"
              value={landlordInfo.companyName}
              onChange={(e) =>
                setLandlordInfo({
                  ...landlordInfo,
                  companyName: e.target.value,
                })
              }
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 transition duration-200"
              placeholder="Tên công ty/doanh nghiệp"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Địa chỉ liên hệ *
          </label>
          <input
            type="text"
            value={landlordInfo.address}
            onChange={(e) =>
              setLandlordInfo({ ...landlordInfo, address: e.target.value })
            }
            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 transition duration-200"
            placeholder="Địa chỉ liên hệ đầy đủ"
            required
          />
        </div>

        {/* Security Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <Shield className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">
                Bảo mật thông tin
              </h4>
              <p className="text-blue-700 text-sm">
                Thông tin của bạn được bảo mật an toàn và chỉ sử dụng cho mục
                đích xác minh danh tính. Chúng tôi cam kết không chia sẻ thông
                tin cho bên thứ ba.
              </p>
            </div>
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold rounded-2xl text-lg transition duration-300 shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
              Đang cập nhật...
            </div>
          ) : (
            "💼 Cập Nhật Thông Tin"
          )}
        </motion.button>
      </form>

      {/* Message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-6 p-4 bg-green-50 border border-green-200 rounded-2xl"
          >
            <p className="text-green-700 text-center font-medium">{message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PersonalInfo;
