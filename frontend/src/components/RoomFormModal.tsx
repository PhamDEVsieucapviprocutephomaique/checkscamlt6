import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DollarSign, Ruler, X, Loader, ChevronDown } from "lucide-react";

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

interface RoomFormModalProps {
  showCreateForm: boolean;
  setShowCreateForm: (show: boolean) => void;
  editingRoom: Room | null;
  setEditingRoom: (room: Room | null) => void;
  formData: FormData;
  setFormData: (data: FormData) => void;
  loading: boolean;
  imageInput: string;
  setImageInput: (input: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  resetForm: () => void;
  handleAddImage: () => void;
  handleRemoveImage: (index: number) => void;
}

interface Province {
  code: string;
  name: string;
}

interface District {
  code: string;
  name: string;
  province_code: string;
}

interface Ward {
  code: string;
  name: string;
  district_code: string;
}

const RoomFormModal: React.FC<RoomFormModalProps> = ({
  showCreateForm,
  setShowCreateForm,
  editingRoom,
  setEditingRoom,
  formData,
  setFormData,
  loading,
  imageInput,
  setImageInput,
  handleSubmit,
  resetForm,
  handleAddImage,
  handleRemoveImage,
}) => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);

  const isFormValid = formData.province && formData.district && formData.ward;

  useEffect(() => {
    fetchProvinces();
  }, []);

  const fetchProvinces = async () => {
    setLoadingProvinces(true);
    try {
      const response = await fetch("https://provinces.open-api.vn/api/");
      const data = await response.json();
      setProvinces(data);
    } catch (error) {
      console.error("Error fetching provinces:", error);
    } finally {
      setLoadingProvinces(false);
    }
  };

  const fetchDistricts = async (provinceCode: string) => {
    try {
      const response = await fetch(
        `https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`
      );
      const data = await response.json();
      setDistricts(data.districts || []);
    } catch (error) {
      console.error("Error fetching districts:", error);
      setDistricts([]);
    }
    setWards([]);
  };

  const fetchWards = async (districtCode: string) => {
    try {
      const response = await fetch(
        `https://provinces.open-api.vn/api/d/${districtCode}?depth=2`
      );
      const data = await response.json();
      setWards(data.wards || []);
    } catch (error) {
      console.error("Error fetching wards:", error);
      setWards([]);
    }
  };

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinceCode = e.target.value;
    const selectedProvince = provinces.find((p) => p.code == provinceCode);

    if (selectedProvince) {
      setFormData({
        ...formData,
        province: selectedProvince.name,
        district: "",
        ward: "",
      });
      fetchDistricts(provinceCode);
    } else {
      setFormData({
        ...formData,
        province: "",
        district: "",
        ward: "",
      });
      setDistricts([]);
      setWards([]);
    }
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtCode = e.target.value;
    const selectedDistrict = districts.find((d) => d.code == districtCode);

    if (selectedDistrict) {
      setFormData({
        ...formData,
        district: selectedDistrict.name,
        ward: "",
      });
      fetchWards(districtCode);
    } else {
      setFormData({
        ...formData,
        district: "",
        ward: "",
      });
      setWards([]);
    }
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const wardCode = e.target.value;
    const selectedWard = wards.find((w) => w.code == wardCode);

    if (selectedWard) {
      setFormData({
        ...formData,
        ward: selectedWard.name,
      });
    } else {
      setFormData({
        ...formData,
        ward: "",
      });
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    if (!isFormValid) {
      e.preventDefault();
      return;
    }
    handleSubmit(e);
  };

  if (!showCreateForm) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setShowCreateForm(false);
          setEditingRoom(null);
          resetForm();
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {editingRoom ? "Chỉnh Sửa Phòng" : "Đăng Phòng Mới"}
            </h2>
            <button
              onClick={() => {
                setShowCreateForm(false);
                setEditingRoom(null);
                resetForm();
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề phòng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="VD: Phòng trọ sinh viên gần ĐH Bách Khoa"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giá thuê/tháng <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  required
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="2500000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Diện tích (m²) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.area}
                  onChange={(e) =>
                    setFormData({ ...formData, area: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="25.5"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tình trạng
              </label>
              <select
                value={formData.room_status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    room_status: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              >
                <option value="available">Đang trống</option>
                <option value="rented">Đã cho thuê</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tỉnh/Thành phố <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  required
                  value={
                    provinces.find((p) => p.name === formData.province)?.code ||
                    ""
                  }
                  onChange={handleProvinceChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 appearance-none pr-10"
                >
                  <option value="">Chọn tỉnh/thành phố</option>
                  {provinces.map((province) => (
                    <option key={province.code} value={province.code}>
                      {province.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quận/Huyện <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  required
                  value={
                    districts.find((d) => d.name === formData.district)?.code ||
                    ""
                  }
                  onChange={handleDistrictChange}
                  disabled={!formData.province}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 appearance-none pr-10 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Chọn quận/huyện</option>
                  {districts.map((district) => (
                    <option key={district.code} value={district.code}>
                      {district.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phường/Xã <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  required
                  value={
                    wards.find((w) => w.name === formData.ward)?.code || ""
                  }
                  onChange={handleWardChange}
                  disabled={!formData.district}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 appearance-none pr-10 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Chọn phường/xã</option>
                  {wards.map((ward) => (
                    <option key={ward.code} value={ward.code}>
                      {ward.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Địa chỉ chi tiết <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.address_detail}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address_detail: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="Số 123, ngõ 45, đường ABC"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả phòng
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
                placeholder="Mô tả chi tiết về phòng trọ, tiện ích, quy tắc..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hình ảnh phòng (URL)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageInput}
                  onChange={(e) => setImageInput(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="https://picsum.photos/400/300"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors duration-200"
                >
                  Thêm
                </button>
              </div>
              {formData.images.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {formData.images.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img}
                        alt={`Room ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg border-2 border-gray-300"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://via.placeholder.com/80?text=Error";
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(false);
                setEditingRoom(null);
                resetForm();
              }}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors duration-200"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>{editingRoom ? "Cập nhật" : "Đăng phòng"}</>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default RoomFormModal;
