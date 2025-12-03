import React from "react";
import { motion } from "framer-motion";
import { History, CheckCircle, XCircle, Clock } from "lucide-react";

const PaymentHistory: React.FC = () => {
  // Mock lịch sử nạp tiền
  const paymentHistory = [
    {
      id: 1,
      date: "2024-01-15",
      amount: "100.000",
      method: "VNPay",
      status: "Thành công",
      plan: "Chuyên Nghiệp",
    },
    {
      id: 2,
      date: "2024-01-10",
      amount: "500.000",
      method: "Momo",
      status: "Thành công",
      plan: "Cao Cấp",
    },
    {
      id: 3,
      date: "2024-01-05",
      amount: "100.000",
      method: "Banking",
      status: "Thất bại",
      plan: "Chuyên Nghiệp",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Thành công":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "Thất bại":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Thành công":
        return "bg-green-100 text-green-800";
      case "Thất bại":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <History className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3">
          Lịch Sử Nạp Tiền
        </h2>
        <p className="text-slate-600 text-lg">
          Theo dõi lịch sử giao dịch và trạng thái các gói dịch vụ của bạn
        </p>
      </div>

      {/* Payment History Table */}
      <div className="bg-slate-50 rounded-2xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-4 px-4 font-semibold text-slate-700">
                  Ngày
                </th>
                <th className="text-left py-4 px-4 font-semibold text-slate-700">
                  Gói dịch vụ
                </th>
                <th className="text-left py-4 px-4 font-semibold text-slate-700">
                  Số tiền
                </th>
                <th className="text-left py-4 px-4 font-semibold text-slate-700">
                  Phương thức
                </th>
                <th className="text-left py-4 px-4 font-semibold text-slate-700">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody>
              {paymentHistory.map((payment) => (
                <tr
                  key={payment.id}
                  className="border-b border-slate-100 last:border-b-0"
                >
                  <td className="py-4 px-4 text-slate-700">{payment.date}</td>
                  <td className="py-4 px-4 font-medium text-slate-800">
                    {payment.plan}
                  </td>
                  <td className="py-4 px-4 font-semibold text-slate-800">
                    {payment.amount}đ
                  </td>
                  <td className="py-4 px-4 text-slate-700">{payment.method}</td>
                  <td className="py-4 px-4">
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        payment.status
                      )}`}
                    >
                      {getStatusIcon(payment.status)}
                      <span className="ml-2">{payment.status}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {paymentHistory.length === 0 && (
          <div className="text-center py-12">
            <History className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">Chưa có giao dịch nào</p>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600">2</div>
          <div className="text-green-700 text-sm">Giao dịch thành công</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">600.000đ</div>
          <div className="text-blue-700 text-sm">Tổng đã nạp</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">1</div>
          <div className="text-orange-700 text-sm">Giao dịch thất bại</div>
        </div>
      </div>
    </motion.div>
  );
};

export default PaymentHistory;
