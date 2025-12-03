import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { User, CreditCard, History, BadgeCheck } from "lucide-react";
import PersonalInfo from "../components/profile/PersonalInfo";
import SubscriptionPlans from "../components/profile/SubscriptionPlans";
import PaymentHistory from "../components/profile/PaymentHistory";

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "info" | "subscription" | "payment-history"
  >("info");
  const [message, setMessage] = useState("");

  if (!user) {
    return <div>Loading...</div>;
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case "info":
        return <PersonalInfo message={message} setMessage={setMessage} />;
      case "subscription":
        return <SubscriptionPlans message={message} setMessage={setMessage} />;
      case "payment-history":
        return <PaymentHistory />;
      default:
        return <PersonalInfo message={message} setMessage={setMessage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">
            {user.role === "student"
              ? "🎓 Hồ Sơ Sinh Viên"
              : "🏠 Quản Lý Tài Khoản Chủ Trọ"}
          </h1>
          <p className="text-slate-600 text-lg md:text-xl max-w-3xl mx-auto">
            {user.role === "student"
              ? "Hoàn thiện hồ sơ để tìm phòng trọ phù hợp nhất"
              : "Tối ưu hóa hiệu quả cho thuê phòng trọ của bạn"}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sticky top-8">
              {/* Avatar & Basic Info */}
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <User className="w-12 h-12 text-white" />
                </div>
                <h2
                  className="text-lg font-semibold text-slate-800 truncate"
                  title={user.email}
                >
                  {user.email}
                </h2>
                <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mt-2">
                  <BadgeCheck className="w-4 h-4 mr-1" />
                  {user.role}
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-3">
                <button
                  onClick={() => setActiveTab("info")}
                  className={`w-full flex items-center px-4 py-4 rounded-2xl transition-all duration-200 text-left ${
                    activeTab === "info"
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg"
                      : "text-slate-700 hover:bg-slate-100 hover:shadow-md"
                  }`}
                >
                  <User className="w-5 h-5 mr-3" />
                  <span className="font-medium">Thông tin cá nhân</span>
                </button>

                {user.role === "landlord" && (
                  <>
                    <button
                      onClick={() => setActiveTab("subscription")}
                      className={`w-full flex items-center px-4 py-4 rounded-2xl transition-all duration-200 text-left ${
                        activeTab === "subscription"
                          ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg"
                          : "text-slate-700 hover:bg-slate-100 hover:shadow-md"
                      }`}
                    >
                      <CreditCard className="w-5 h-5 mr-3" />
                      <span className="font-medium">Gói dịch vụ</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("payment-history")}
                      className={`w-full flex items-center px-4 py-4 rounded-2xl transition-all duration-200 text-left ${
                        activeTab === "payment-history"
                          ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg"
                          : "text-slate-700 hover:bg-slate-100 hover:shadow-md"
                      }`}
                    >
                      <History className="w-5 h-5 mr-3" />
                      <span className="font-medium">Lịch sử nạp tiền</span>
                    </button>
                  </>
                )}
              </nav>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            {renderActiveTab()}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
