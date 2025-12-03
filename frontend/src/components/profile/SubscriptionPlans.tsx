import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown,
  Zap,
  Star,
  X,
  CheckCircle,
  ArrowRight,
  Users,
  Target,
} from "lucide-react";

interface SubscriptionPlansProps {
  message: string;
  setMessage: (message: string) => void;
}

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({
  message,
  setMessage,
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const subscriptionPlans = [
    {
      id: "basic",
      name: "Cơ Bản",
      price: "0",
      period: "30 ngày miễn phí",
      features: [
        "Đăng 5 tin miễn phí",
        "Hiển thị tiêu chuẩn",
        "Hỗ trợ qua email",
        "Thời hạn 30 ngày",
      ],
      icon: <Star className="w-6 h-6" />,
      color: "from-gray-500 to-gray-700",
      popular: false,
    },
    {
      id: "pro",
      name: "Chuyên Nghiệp",
      price: "100.000",
      period: "tháng",
      features: [
        "Đăng 20 tin/tháng",
        "Ưu tiên hiển thị",
        "Hỗ trợ 24/7",
        "Đẩy tin lên top",
        "Quản lý cơ bản",
      ],
      icon: <Zap className="w-6 h-6" />,
      color: "from-blue-500 to-cyan-600",
      popular: true,
    },
    {
      id: "premium",
      name: "Cao Cấp",
      price: "500.000",
      period: "tháng",
      features: [
        "Đăng tin không giới hạn",
        "Vị trí ưu tiên cao nhất",
        "Hỗ trợ VIP 1-1",
        "Quản lý phòng trọ chuyên nghiệp",
        "Quảng cáo đa nền tảng",
        "Báo cáo chi tiết",
      ],
      icon: <Crown className="w-6 h-6" />,
      color: "from-purple-600 to-pink-600",
      popular: false,
    },
  ];

  const handleSubscription = (planId: string) => {
    setSelectedPlan(planId);
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    setLoading(true);
    setTimeout(() => {
      setMessage(
        `Đã đăng ký gói ${
          subscriptionPlans.find((p) => p.id === selectedPlan)?.name
        } thành công!`
      );
      setShowPaymentModal(false);
      setSelectedPlan(null);
      setLoading(false);
    }, 2000);
  };

  const selectedPlanData = subscriptionPlans.find(
    (plan) => plan.id === selectedPlan
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8"
      >
        {/* Introduction */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Target className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Nâng Tầm Kinh Doanh Của Bạn
          </h2>
          <p className="text-slate-600 text-lg md:text-xl max-w-4xl mx-auto leading-relaxed">
            Với hơn 10,000 sinh viên đang tìm phòng mỗi tháng, hãy chọn gói dịch
            vụ phù hợp để
            <span className="font-semibold text-blue-600">
              {" "}
              tối đa hóa hiệu quả cho thuê phòng trọ
            </span>
            . Chúng tôi cung cấp công cụ và hỗ trợ để biến công việc quản lý
            phòng trọ của bạn trở nên chuyên nghiệp và hiệu quả hơn bao giờ hết.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {subscriptionPlans.map((plan) => (
            <motion.div
              key={plan.id}
              whileHover={{ scale: 1.02 }}
              className={`relative bg-gradient-to-br ${
                plan.color
              } rounded-3xl p-8 text-white ${
                plan.popular ? "ring-4 ring-blue-400 ring-opacity-50" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    ⭐ PHỔ BIẾN NHẤT
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <div className="flex justify-center mb-4">{plan.icon}</div>
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-white/80 text-lg">đ/{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 mr-3 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <motion.button
                onClick={() => handleSubscription(plan.id)}
                className="w-full py-4 bg-white text-slate-800 font-semibold rounded-2xl hover:bg-slate-100 transition duration-200 flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {plan.id === "basic" ? (
                  "Dùng Thử Miễn Phí"
                ) : (
                  <>
                    Đăng Ký Ngay
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Message */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 bg-green-50 border border-green-200 rounded-2xl"
            >
              <p className="text-green-700 text-center font-medium">
                {message}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && selectedPlanData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-800">
                  Xác Nhận Đăng Ký
                </h3>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition duration-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="text-center mb-6">
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${selectedPlanData.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}
                >
                  {selectedPlanData.icon}
                </div>
                <h4 className="text-xl font-bold text-slate-800 mb-2">
                  {selectedPlanData.name}
                </h4>
                <p className="text-3xl font-bold text-slate-800 mb-1">
                  {selectedPlanData.price}đ
                </p>
                <p className="text-slate-600">/{selectedPlanData.period}</p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 mb-6">
                <h5 className="font-semibold text-slate-800 mb-3">
                  Hướng dẫn nạp tiền:
                </h5>
                <ol className="text-sm text-slate-600 space-y-2">
                  <li>
                    1. Chuyển khoản đến số tài khoản:{" "}
                    <strong>0865713395 - MB Bank</strong>
                  </li>
                  <li>
                    2. Nội dung:{" "}
                    <strong>
                      DANGKY {selectedPlanData.id.toUpperCase()}{" "}
                      {selectedPlanData.price}
                    </strong>
                  </li>
                  <li>
                    3. Gói dịch vụ sẽ được kích hoạt trong vòng 5 phút sau khi
                    chuyển khoản
                  </li>
                </ol>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-2xl hover:bg-slate-50 transition duration-200"
                >
                  Hủy
                </button>
                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold rounded-2xl hover:from-blue-600 hover:to-cyan-700 transition duration-200 disabled:opacity-50"
                >
                  {loading ? "Đang xử lý..." : "Xác Nhận"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SubscriptionPlans;
