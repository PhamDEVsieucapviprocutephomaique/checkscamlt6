import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import {
  Mail,
  Lock,
  Phone,
  User,
  Check,
  Eye,
  EyeOff,
  Snowflake,
} from "lucide-react";

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "student",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };

    switch (name) {
      case "email":
        if (!value) {
          newErrors.email = "Email không được để trống";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = "Email không hợp lệ";
        } else {
          delete newErrors.email;
        }
        break;

      case "password":
        if (!value) {
          newErrors.password = "Mật khẩu không được để trống";
        } else if (value.length < 8) {
          newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          newErrors.password = "Mật khẩu phải có chữ hoa, chữ thường và số";
        } else {
          delete newErrors.password;
        }
        setPasswordStrength(checkPasswordStrength(value));
        break;

      case "confirmPassword":
        if (value !== formData.password) {
          newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
        } else {
          delete newErrors.confirmPassword;
        }
        break;

      case "phone":
        if (value && !/^\d{10,11}$/.test(value)) {
          newErrors.phone = "Số điện thoại phải có 10-11 chữ số";
        } else {
          delete newErrors.phone;
        }
        break;
    }

    setErrors(newErrors);
  };

  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    Object.keys(formData).forEach((key) => {
      if (key !== "role") {
        validateField(key, formData[key as keyof typeof formData]);
      }
    });

    if (Object.keys(errors).length > 0) return;

    setLoading(true);

    try {
      const registerResponse = await fetch(
        "http://localhost:8000/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            phone: formData.phone || null,
            role: formData.role,
            is_active: true,
            is_superuser: false,
            is_verified: false,
          }),
        }
      );

      const registerData = await registerResponse.json();

      if (!registerResponse.ok) {
        const errorMsg = registerData.detail || "Đăng ký thất bại";
        setErrors({
          submit:
            typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg),
        });
        setLoading(false);
        return;
      }

      const loginResponse = await fetch(
        "http://localhost:8000/auth/jwt/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            username: formData.email,
            password: formData.password,
          }),
        }
      );

      const loginData = await loginResponse.json();

      if (loginResponse.ok) {
        const userResponse = await fetch("http://localhost:8000/api/users/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${loginData.access_token}`,
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          login(loginData.access_token, userData);
          navigate("/");
        } else {
          setErrors({ submit: "Đăng ký thành công! Vui lòng đăng nhập." });
          navigate("/login");
        }
      } else {
        setErrors({ submit: "Đăng ký thành công! Vui lòng đăng nhập." });
        navigate("/login");
      }
    } catch (err) {
      setErrors({ submit: "Lỗi kết nối đến server" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    validateField(name, value);
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
        return "bg-gray-300";
      case 1:
        return "bg-red-400";
      case 2:
        return "bg-blue-400";
      case 3:
        return "bg-cyan-400";
      case 4:
        return "bg-teal-400";
      default:
        return "bg-gray-300";
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0:
        return { text: "Chưa đánh giá", color: "text-gray-400" };
      case 1:
        return { text: "Rất yếu", color: "text-red-400" };
      case 2:
        return { text: "Trung bình", color: "text-blue-400" };
      case 3:
        return { text: "Mạnh", color: "text-cyan-400" };
      case 4:
        return { text: "Rất mạnh", color: "text-teal-400" };
      default:
        return { text: "", color: "" };
    }
  };

  const strengthInfo = getPasswordStrengthText();

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
        <div className="absolute top-1/2 left-1/4 text-cyan-200/20">
          <Snowflake size={18} />
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
                Bắt Đầu <br />
                Hành Trình <br />
                Của Bạn
              </motion.h1>

              <motion.p
                className="text-cyan-100 text-lg leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Tham gia cộng đồng tìm phòng trọ và bạn ở ghép hàng đầu. Trải
                nghiệm dịch vụ chuyên nghiệp với công nghệ hiện đại.
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
                <span className="text-sm">Bảo mật tuyệt đối</span>
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
                Tạo Tài Khoản
              </h2>
              <p className="text-slate-600 text-lg mb-8">
                Điền thông tin để bắt đầu
              </p>

              <AnimatePresence>
                {errors.submit && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl"
                  >
                    <p className="text-red-600 text-sm">{errors.submit}</p>
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
                        className={`w-full px-4 py-3 bg-white border rounded-2xl focus:outline-none focus:ring-2 transition duration-300 text-slate-800 placeholder-slate-400 text-lg ${
                          errors.email
                            ? "border-red-400 focus:ring-red-400"
                            : "border-slate-300 focus:ring-cyan-500 focus:border-cyan-500"
                        }`}
                        placeholder="you@example.com"
                        required
                        disabled={loading}
                      />
                      <Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    </div>
                    <AnimatePresence>
                      {errors.email && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="mt-2 text-red-500 text-sm"
                        >
                          {errors.email}
                        </motion.p>
                      )}
                    </AnimatePresence>
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
                        className={`w-full px-4 py-3 bg-white border rounded-2xl focus:outline-none focus:ring-2 transition duration-300 text-slate-800 placeholder-slate-400 text-lg pr-12 ${
                          errors.password
                            ? "border-red-400 focus:ring-red-400"
                            : "border-slate-300 focus:ring-cyan-500 focus:border-cyan-500"
                        }`}
                        placeholder="••••••••"
                        required
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition duration-200"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {formData.password && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-3 space-y-2"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600">
                            Độ mạnh:
                          </span>
                          <span
                            className={`text-sm font-semibold ${strengthInfo.color}`}
                          >
                            {strengthInfo.text}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <motion.div
                            className={`h-2 rounded-full ${getPasswordStrengthColor()} transition-all duration-500`}
                            initial={{ width: 0 }}
                            animate={{
                              width: `${(passwordStrength / 4) * 100}%`,
                            }}
                          ></motion.div>
                        </div>
                      </motion.div>
                    )}

                    <AnimatePresence>
                      {errors.password && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="mt-2 text-red-500 text-sm"
                        >
                          {errors.password}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Xác nhận mật khẩu
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 bg-white border rounded-2xl focus:outline-none focus:ring-2 transition duration-300 text-slate-800 placeholder-slate-400 text-lg pr-12 ${
                          errors.confirmPassword
                            ? "border-red-400 focus:ring-red-400"
                            : "border-slate-300 focus:ring-cyan-500 focus:border-cyan-500"
                        }`}
                        placeholder="••••••••"
                        required
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition duration-200"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <AnimatePresence>
                      {errors.confirmPassword && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="mt-2 text-red-500 text-sm"
                        >
                          {errors.confirmPassword}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Vai trò của bạn
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, role: "student" }))
                      }
                      className={`p-4 border-2 rounded-2xl text-center transition duration-300 ${
                        formData.role === "student"
                          ? "border-cyan-500 bg-cyan-50 text-cyan-700 shadow-md"
                          : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={loading}
                    >
                      <div className="text-2xl mb-2">🎓</div>
                      <div className="font-semibold text-base">Sinh viên</div>
                    </motion.button>

                    <motion.button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, role: "landlord" }))
                      }
                      className={`p-4 border-2 rounded-2xl text-center transition duration-300 ${
                        formData.role === "landlord"
                          ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md"
                          : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={loading}
                    >
                      <div className="text-2xl mb-2">🏠</div>
                      <div className="font-semibold text-base">Chủ trọ</div>
                    </motion.button>
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={loading || Object.keys(errors).length > 0}
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
                      Đang tạo tài khoản...
                    </motion.span>
                  ) : (
                    <span className="flex items-center text-xl">
                      <Check className="w-6 h-6 mr-3" />
                      Tạo Tài Khoản
                    </span>
                  )}
                </motion.button>
              </form>

              <div className="mt-8 pt-6 border-t border-slate-200">
                <p className="text-center text-slate-600 text-lg">
                  Đã có tài khoản?{" "}
                  <Link
                    to="/login"
                    className="text-cyan-600 hover:text-cyan-700 font-semibold hover:underline transition duration-200"
                  >
                    Đăng nhập ngay
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

export default Register;
