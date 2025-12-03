import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Plus,
  Edit,
  Trash2,
  BookOpen,
  MapPin,
  Building,
  Calendar,
  AlertCircle,
  CheckCircle,
  X,
  Ruler, // 👈 THÊM DÒNG NÀY
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import RoomFormModal from "../components/RoomFormModal";

const API_BASE_URL = "http://localhost:8000/api/rooms";

interface Room {
  id: string;
  title: string;
  description: string;
  province: string;
  district: string;
  ward: string;
  address_detail: string;
  area: number;
  price: number;
  room_status: string;
  images: string[];
  created_at: string;
}

interface FormData {
  title: string;
  description: string;
  province: string;
  district: string;
  ward: string;
  address_detail: string;
  area: string;
  price: string;
  room_status: string;
  images: string[];
}

interface Alert {
  type: "success" | "error";
  message: string;
}

const PostRoom: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("management");
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [alert, setAlert] = useState<Alert | null>(null);
  const [imageInput, setImageInput] = useState<string>("");

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    province: "",
    district: "",
    ward: "",
    address_detail: "",
    area: "",
    price: "",
    room_status: "available",
    images: [],
  });

  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const fetchRooms = async (): Promise<void> => {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        showAlert("error", "Vui lòng đăng nhập để tiếp tục");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/my-rooms`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        showAlert(
          "error",
          "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
        );
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        return;
      }

      if (!response.ok) {
        const error = await response.json();
        showAlert("error", error.detail || "Không thể tải danh sách phòng");
        return;
      }

      const data: Room[] = await response.json();
      const roomsWithImages = data.map((room) => ({
        ...room,
        images:
          room.images && room.images.length > 0
            ? room.images
            : [`https://picsum.photos/400/300?random=${room.id}`],
      }));
      setRooms(roomsWithImages);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      showAlert("error", "Lỗi kết nối đến server");
    }
  };

  useEffect(() => {
    if (user?.role === "landlord") {
      fetchRooms();
    }
  }, [user?.role]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        showAlert("error", "Vui lòng đăng nhập lại");
        setLoading(false);
        return;
      }

      const url = editingRoom
        ? `${API_BASE_URL}/${editingRoom.id}`
        : `${API_BASE_URL}/`;

      const method = editingRoom ? "PUT" : "POST";

      const payload = {
        title: formData.title,
        description: formData.description,
        province: formData.province,
        district: formData.district,
        ward: formData.ward,
        address_detail: formData.address_detail,
        area: parseFloat(formData.area),
        price: parseFloat(formData.price),
        room_status: formData.room_status,
        images:
          formData.images.length > 0
            ? formData.images
            : [`https://picsum.photos/400/300?random=${Date.now()}`],
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        showAlert(
          "error",
          "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
        );
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        setLoading(false);
        return;
      }

      if (response.ok) {
        showAlert(
          "success",
          editingRoom
            ? "Cập nhật phòng thành công!"
            : "Đăng phòng mới thành công!"
        );
        await fetchRooms();
        setShowCreateForm(false);
        setEditingRoom(null);
        resetForm();
      } else {
        const error = await response.json();
        showAlert("error", error.detail || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error saving room:", error);
      showAlert("error", "Lỗi kết nối đến server");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = (): void => {
    setFormData({
      title: "",
      description: "",
      province: "",
      district: "",
      ward: "",
      address_detail: "",
      area: "",
      price: "",
      room_status: "available",
      images: [],
    });
    setImageInput("");
  };

  const handleEdit = (room: Room): void => {
    setEditingRoom(room);
    setFormData({
      title: room.title,
      description: room.description || "",
      province: room.province,
      district: room.district,
      ward: room.ward,
      address_detail: room.address_detail,
      area: room.area.toString(),
      price: room.price.toString(),
      room_status: room.room_status,
      images: room.images || [],
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (roomId: string): Promise<void> => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa phòng này không?")) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        showAlert("error", "Vui lòng đăng nhập lại");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/${roomId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        showAlert(
          "error",
          "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
        );
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        return;
      }

      if (response.ok) {
        showAlert("success", "Xóa phòng thành công!");
        await fetchRooms();
      } else {
        const error = await response.json();
        showAlert("error", error.detail || "Không thể xóa phòng");
      }
    } catch (error) {
      console.error("Error deleting room:", error);
      showAlert("error", "Lỗi kết nối đến server");
    }
  };

  const handleAddImage = (): void => {
    if (imageInput.trim() && !formData.images.includes(imageInput.trim())) {
      setFormData({
        ...formData,
        images: [...formData.images, imageInput.trim()],
      });
      setImageInput("");
    }
  };

  const handleRemoveImage = (index: number): void => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (user?.role === "student") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-32 h-32 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl"
          >
            <Building className="w-16 h-16 text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            Tính Năng Dành Cho Chủ Trọ
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600 mb-10 text-lg leading-relaxed"
          >
            Tính năng đăng phòng giúp chủ trọ quản lý và cho thuê phòng trọ hiệu
            quả. Là sinh viên, bạn có thể tìm phòng phù hợp trong mục{" "}
            <strong className="text-blue-600">Tìm Phòng</strong>.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center justify-center gap-2">
              <span className="text-2xl">🎯</span> Bạn Đang Tìm Phòng?
            </h3>
            <div className="space-y-4 text-left">
              {[
                { icon: "💰", text: "Tìm phòng trọ với ngân sách phù hợp" },
                { icon: "🏠", text: "Kết nối với chủ trọ uy tín" },
                { icon: "👥", text: "Tìm bạn ở ghép cùng sở thích" },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center text-gray-700 bg-gray-50 rounded-2xl p-4"
                >
                  <span className="text-2xl mr-4">{item.icon}</span>
                  <span className="font-medium">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <AnimatePresence>
        {alert && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50 max-w-md"
          >
            <div
              className={`rounded-2xl shadow-2xl p-4 border-2 ${
                alert.type === "success"
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-center gap-3">
                {alert.type === "success" ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-600" />
                )}
                <p
                  className={`font-medium ${
                    alert.type === "success" ? "text-green-800" : "text-red-800"
                  }`}
                >
                  {alert.message}
                </p>
                <button
                  onClick={() => setAlert(null)}
                  className="ml-auto text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Quản Lý Phòng Trọ
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Quản lý danh sách phòng trọ của bạn một cách chuyên nghiệp và hiệu
            quả
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6 sticky top-8">
              <nav className="space-y-2">
                {[
                  { id: "management", label: "Quản Lý Phòng", icon: Home },
                  { id: "guide", label: "Hướng Dẫn", icon: BookOpen },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <tab.icon className="w-5 h-5 mr-3" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="space-y-4">
                  <div className="text-center p-6 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl text-white shadow-xl">
                    <div className="text-3xl font-bold mb-1">
                      {rooms.length}
                    </div>
                    <div className="text-sm opacity-90 font-medium">
                      Tổng số phòng
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                      <div className="text-xl font-bold text-green-700">
                        {
                          rooms.filter((r) => r.room_status === "available")
                            .length
                        }
                      </div>
                      <div className="text-xs text-green-600 font-medium mt-1">
                        Đang trống
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-200">
                      <div className="text-xl font-bold text-orange-700">
                        {rooms.filter((r) => r.room_status === "rented").length}
                      </div>
                      <div className="text-xs text-orange-600 font-medium mt-1">
                        Đã thuê
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setEditingRoom(null);
                  resetForm();
                  setShowCreateForm(true);
                }}
                className="w-full mt-6 flex items-center justify-center px-4 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold rounded-xl transition-all duration-200 shadow-xl"
              >
                <Plus className="w-5 h-5 mr-2" />
                Đăng Phòng Mới
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            {activeTab === "management" && (
              <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      Danh Sách Phòng
                    </h2>
                    <p className="text-gray-600 mt-2">
                      Quản lý tất cả phòng trọ của bạn
                    </p>
                  </div>
                </div>

                {rooms.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16"
                  >
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <Building className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                      Không có bài đăng
                    </h3>
                    <p className="text-gray-600 mb-8">
                      Bắt đầu bằng cách đăng phòng trọ đầu tiên của bạn
                    </p>
                    <button
                      onClick={() => {
                        setEditingRoom(null);
                        resetForm();
                        setShowCreateForm(true);
                      }}
                      className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-200 shadow-xl"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Đăng Phòng Mới
                    </button>
                  </motion.div>
                ) : (
                  <div className="grid gap-6 max-h-[600px] overflow-y-auto">
                    {rooms.map((room, index) => (
                      <motion.div
                        key={room.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-3xl p-6 border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                          <div className="flex-shrink-0">
                            <img
                              src={room.images[0]}
                              alt={room.title}
                              className="w-40 h-40 object-cover rounded-2xl shadow-md"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                              <div className="flex-1">
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                  {room.title}
                                </h3>
                                <div className="flex flex-wrap items-center gap-3 mb-3">
                                  <span className="flex items-center text-sm text-gray-600 bg-white px-3 py-1.5 rounded-lg">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    {room.ward}, {room.district}
                                  </span>
                                  <span
                                    className={`px-4 py-1.5 rounded-lg text-sm font-bold ${
                                      room.room_status === "available"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-gray-100 text-gray-700"
                                    }`}
                                  >
                                    {room.room_status === "available"
                                      ? "✓ Đang trống"
                                      : "Đã thuê"}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right mt-4 sm:mt-0 sm:ml-4">
                                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                  {formatPrice(room.price)}đ
                                </div>
                                <div className="text-sm text-gray-600 font-medium">
                                  /tháng
                                </div>
                              </div>
                            </div>

                            {room.description && (
                              <p className="text-gray-600 mb-4 line-clamp-2 bg-white/50 rounded-lg p-3">
                                {room.description}
                              </p>
                            )}

                            <div className="flex flex-wrap gap-4 text-sm">
                              <span className="flex items-center text-gray-700 bg-white px-3 py-2 rounded-lg font-medium">
                                <Ruler className="w-4 h-4 mr-2 text-blue-600" />
                                {room.area}m²
                              </span>
                              <span className="flex items-center text-gray-700 bg-white px-3 py-2 rounded-lg font-medium">
                                <Calendar className="w-4 h-4 mr-2 text-purple-600" />
                                {formatDate(room.created_at)}
                              </span>
                            </div>
                          </div>

                          <div className="flex lg:flex-col gap-2">
                            <button
                              onClick={() => handleEdit(room)}
                              className="flex-1 lg:flex-none flex items-center justify-center px-5 py-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors duration-200 font-medium border-2 border-blue-200"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Sửa
                            </button>
                            <button
                              onClick={() => handleDelete(room.id)}
                              className="flex-1 lg:flex-none flex items-center justify-center px-5 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-200 font-medium border-2 border-red-200"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Xóa
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "guide" && (
              <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  📝 Hướng Dẫn Đăng Phòng Hiệu Quả
                </h2>
                <p className="text-gray-600 mb-10 text-lg">
                  Mẹo giúp phòng trọ của bạn thu hút nhiều người quan tâm hơn
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    {
                      icon: "📸",
                      title: "Hình Ảnh Chất Lượng",
                      tips: [
                        "Chụp ảnh rõ nét, đủ sáng",
                        "Đầy đủ các góc phòng",
                        "5-7 ảnh mỗi phòng",
                      ],
                    },
                    {
                      icon: "💰",
                      title: "Giá Cả Hợp Lý",
                      tips: [
                        "Nghiên cứu thị trường khu vực",
                        "Linh hoạt thương lượng",
                        "Ghi rõ các chi phí phát sinh",
                      ],
                    },
                    {
                      icon: "📍",
                      title: "Địa Chỉ Chi Tiết",
                      tips: [
                        "Ghi rõ số nhà, ngõ, đường",
                        "Mô tả cách đi cụ thể",
                        "Gần các tiện ích công cộng",
                      ],
                    },
                    {
                      icon: "📋",
                      title: "Thông Tin Đầy Đủ",
                      tips: [
                        "Diện tích chính xác",
                        "Liệt kê đầy đủ tiện ích",
                        "Nêu rõ quy tắc nhà trọ",
                      ],
                    },
                  ].map((section, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-3xl p-6 border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex items-center gap-4 mb-5">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">
                          {section.icon}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {section.title}
                        </h3>
                      </div>
                      <ul className="space-y-3">
                        {section.tips.map((tip, tipIndex) => (
                          <li
                            key={tipIndex}
                            className="flex items-start text-gray-700"
                          >
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        <RoomFormModal
          showCreateForm={showCreateForm}
          setShowCreateForm={setShowCreateForm}
          editingRoom={editingRoom}
          setEditingRoom={setEditingRoom}
          formData={formData}
          setFormData={setFormData}
          loading={loading}
          imageInput={imageInput}
          setImageInput={setImageInput}
          handleSubmit={handleSubmit}
          resetForm={resetForm}
          handleAddImage={handleAddImage}
          handleRemoveImage={handleRemoveImage}
        />
      </AnimatePresence>
    </div>
  );
};

export default PostRoom;
