import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, User, LogIn, Snowflake } from "lucide-react";

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/auth/jwt/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Lưu token
        localStorage.setItem("access_token", data.access_token);

        let userData;

        try {
          // Lấy thông tin user từ API
          const userResponse = await fetch(
            "http://localhost:8000/api/users/me",
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${data.access_token}`,
              },
            }
          );

          if (userResponse.ok) {
            userData = await userResponse.json();
            // 2. In user data ra console
          } else {
            // Fallback: tạo user data từ email
            userData = {
              id: "1",
              email: formData.email,
              role: "landlord",
            };
          }
        } catch (userError) {
          // Fallback nếu có lỗi
          userData = {
            id: "1",
            email: formData.email,
            role: "landlord",
          };
        }

        // Gọi login
        login(data.access_token, userData);
        navigate("/");
      } else {
        let errorMessage = "Email hoặc mật khẩu không đúng";

        if (data.detail) {
          if (typeof data.detail === "string") {
            errorMessage = data.detail;
          } else if (Array.isArray(data.detail)) {
            errorMessage = data.detail
              .map((err: any) =>
                typeof err === "object" ? err.msg : String(err)
              )
              .join(", ");
          } else if (typeof data.detail === "object") {
            errorMessage = JSON.stringify(data.detail);
          }
        }

        setError(errorMessage);
      }
    } catch (err) {
      console.error("Lỗi đăng nhập:", err);
      setError("Lỗi kết nối đến server");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 flex items-center justify-center p-6">
      {/* Snowflake Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-blue-200/30">
          <Snowflake size={24} />
        </div>
        <div className="absolute top-20 right-20 text-cyan-200/30">
          <Snowflake size={20} />
        </div>
        <div className="absolute bottom-20 left-20 text-slate-200/30">
          <Snowflake size={28} />
        </div>
        <div className="absolute bottom-10 right-10 text-blue-200/30">
          <Snowflake size={22} />
        </div>
      </div>

      <motion.div
        className="w-full max-w-4xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-200/50 border border-white/60 overflow-hidden"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="grid grid-cols-2 min-h-[600px]">
          {/* Left Side - Branding */}
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-12 flex flex-col justify-between text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="relative z-10">
              <motion.div
                className="flex items-center mb-8"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mr-4 backdrop-blur-sm">
                  <Snowflake className="w-6 h-6" />
                </div>
                <span className="text-2xl font-bold">RoomFinder</span>
              </motion.div>

              <motion.h1
                className="text-4xl font-bold mb-6 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Chào Mừng <br />
                Trở Lại
              </motion.h1>

              <motion.p
                className="text-cyan-100 text-lg leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Đăng nhập để tiếp tục hành trình tìm phòng trọ và bạn ở ghép.
                Truy cập vào không gian cá nhân của bạn.
              </motion.p>
            </div>

            <motion.div
              className="relative z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center text-cyan-100">
                <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                <span className="text-sm">Kết nối an toàn</span>
              </div>
            </motion.div>
          </div>

          {/* Right Side - Form */}
          <div className="p-12 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-3xl font-bold text-slate-800 mb-2">
                Đăng Nhập
              </h2>
              <p className="text-slate-600 text-lg mb-8">
                Nhập thông tin đăng nhập của bạn
              </p>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl"
                  >
                    <p className="text-red-600 text-sm">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Địa chỉ email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-300 text-slate-800 placeholder-slate-400 text-lg"
                        placeholder="you@example.com"
                        required
                        disabled={loading}
                      />
                      <Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Mật khẩu
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-300 text-slate-800 placeholder-slate-400 text-lg pr-12"
                        placeholder="••••••••"
                        required
                        disabled={loading}
                      />
                      <Lock className="absolute right-12 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition duration-200"
                      >
                        {showPassword ? (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-8 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold rounded-2xl text-lg transition duration-300 shadow-lg shadow-cyan-200 flex items-center justify-center"
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <motion.span
                      className="flex items-center"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-6 h-6 border-2 border-white border-t-transparent rounded-full mr-3"
                      />
                      Đang đăng nhập...
                    </motion.span>
                  ) : (
                    <span className="flex items-center text-xl">
                      <LogIn className="w-6 h-6 mr-3" />
                      Đăng Nhập
                    </span>
                  )}
                </motion.button>
              </form>

              <div className="mt-8 pt-6 border-t border-slate-200">
                <p className="text-center text-slate-600 text-lg">
                  Chưa có tài khoản?{" "}
                  <Link
                    to="/register"
                    className="text-cyan-600 hover:text-cyan-700 font-semibold hover:underline transition duration-200"
                  >
                    Đăng ký ngay
                  </Link>
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
