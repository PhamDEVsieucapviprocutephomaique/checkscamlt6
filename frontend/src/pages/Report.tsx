import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Upload,
  X,
  Ban,
  Facebook,
  Globe,
  User,
  Phone,
  Mail,
  Shield,
  FileText,
} from "lucide-react";
import { reportsAPI } from "../api/api";

const Report: React.FC = () => {
  const navigate = useNavigate();
  const [reportType, setReportType] = useState<"scam" | "website">("scam");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form data
  const [formData, setFormData] = useState({
    // Common fields
    content: "",
    category: "",
    reporter_name: "",
    reporter_zalo: "",
    reporter_email: "",
    agree_terms: false,

    // Scam report fields
    scammer_name: "",
    bank_account: "",
    bank_name: "",
    facebook_link: "",

    // Website report fields
    website_url: "",
    website_category: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checkbox = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: checkbox.checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles([...files, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.agree_terms) {
      setError("Bạn phải đồng ý với các điều khoản báo cáo");
      return;
    }

    if (
      reportType === "scam" &&
      !formData.scammer_name &&
      !formData.bank_account
    ) {
      setError("Tên hoặc số tài khoản là bắt buộc");
      return;
    }

    if (reportType === "website" && !formData.website_url) {
      setError("URL website là bắt buộc");
      return;
    }

    setLoading(true);

    try {
      const data = {
        report_type: reportType,
        ...formData,
      };

      if (reportType === "scam") {
        await reportsAPI.createScamReport(data, files);
      } else {
        await reportsAPI.createWebsiteReport(data, files);
      }

      navigate("/report/success");
    } catch (err: any) {
      setError(err.message || "Gửi báo cáo thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: "facebook", label: "Facebook" },
    { value: "zalo", label: "Zalo" },
    { value: "banking", label: "Ngân hàng" },
    { value: "gaming", label: "Game" },
    { value: "ecommerce", label: "Thương mại điện tử" },
    { value: "investment", label: "Đầu tư" },
    { value: "other", label: "Khác" },
  ];

  const websiteCategories = [
    { value: "fake_shop", label: "Website fake shop" },
    { value: "phising", label: "Website phishing" },
    { value: "scam_investment", label: "Đầu tư lừa đảo" },
    { value: "fake_bank", label: "Ngân hàng giả" },
    { value: "virus_malware", label: "Phát tán virus" },
    { value: "other", label: "Khác" },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 text-center">
        <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          TỐ CÁO LỪA ĐẢO
        </h1>
        <p className="text-gray-600">
          Chia sẻ thông tin để cảnh báo cộng đồng và ngăn chặn lừa đảo
        </p>
      </div>

      {/* Report type selector */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setReportType("scam")}
            className={`p-6 border-2 rounded-xl text-center transition-colors ${
              reportType === "scam"
                ? "border-red-600 bg-red-50"
                : "border-gray-200 hover:border-red-300"
            }`}
          >
            <div className="flex flex-col items-center">
              <User
                className={`h-8 w-8 mb-3 ${
                  reportType === "scam" ? "text-red-600" : "text-gray-400"
                }`}
              />
              <h3 className="font-semibold text-lg mb-2">
                Tố cáo lừa đảo cá nhân
              </h3>
              <p className="text-sm text-gray-600">
                Lừa đảo qua Facebook, Zalo, ngân hàng, game...
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setReportType("website")}
            className={`p-6 border-2 rounded-xl text-center transition-colors ${
              reportType === "website"
                ? "border-red-600 bg-red-50"
                : "border-gray-200 hover:border-red-300"
            }`}
          >
            <div className="flex flex-col items-center">
              <Globe
                className={`h-8 w-8 mb-3 ${
                  reportType === "website" ? "text-red-600" : "text-gray-400"
                }`}
              />
              <h3 className="font-semibold text-lg mb-2">
                Báo cáo website lừa đảo
              </h3>
              <p className="text-sm text-gray-600">
                Website fake, phishing, đa cấp trá hình, virus...
              </p>
            </div>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          {reportType === "scam" ? (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Thông tin scammer
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên chủ tài khoản *
                  </label>
                  <input
                    type="text"
                    name="scammer_name"
                    value={formData.scammer_name}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Nhập tên scammer (nếu có)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số tài khoản *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Ban className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="bank_account"
                      value={formData.bank_account}
                      onChange={handleChange}
                      className="pl-10 input-field"
                      placeholder="Nhập số tài khoản ngân hàng"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngân hàng
                  </label>
                  <input
                    type="text"
                    name="bank_name"
                    value={formData.bank_name}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Vietcombank, MB, Techcombank..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Link Facebook (nếu có)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Facebook className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="url"
                      name="facebook_link"
                      value={formData.facebook_link}
                      onChange={handleChange}
                      className="pl-10 input-field"
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Thông tin website
              </h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website, Link Scam *
                  </label>
                  <input
                    type="url"
                    name="website_url"
                    value={formData.website_url}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="https://example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thể loại lừa đảo *
                  </label>
                  <select
                    name="website_category"
                    value={formData.website_category}
                    onChange={handleChange}
                    className="input-field"
                    required
                  >
                    <option value="">Chọn thể loại</option>
                    {websiteCategories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thể loại lừa đảo *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="">Chọn thể loại</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nội dung tố cáo *
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              rows={6}
              placeholder="Mô tả chi tiết vụ lừa đảo, cách thức hoạt động, số tiền bị lừa..."
              required
            />
          </div>
        </div>

        {/* File upload */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            Tải bằng chứng
          </h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tải bằng chứng đoạn chat, bill chuyển tiền, screenshot... *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                Kéo thả file hoặc click để chọn
              </p>
              <p className="text-sm text-gray-500 mb-4">
                PNG, JPG, GIF (Tối đa 10MB mỗi file)
              </p>
              <input
                type="file"
                onChange={handleFileChange}
                multiple
                accept=".png,.jpg,.jpeg,.gif"
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-block bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 cursor-pointer"
              >
                Chọn file
              </label>
              <p className="text-xs text-gray-500 mt-4">
                ⚠️ Mẹo: Gửi ảnh lên zalo để giảm dung lượng, sau đó tải về và up
                lên web từng ảnh một sẽ nhanh hơn
              </p>
            </div>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">
                File đã chọn ({files.length})
              </h4>
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <div className="font-medium">{file.name}</div>
                      <div className="text-sm text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reporter info */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <User className="h-5 w-5 mr-2" />
            Thông tin người xác thực
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ và tên *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="reporter_name"
                  value={formData.reporter_name}
                  onChange={handleChange}
                  className="pl-10 input-field"
                  placeholder="Nhập họ và tên"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zalo liên hệ *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  name="reporter_zalo"
                  value={formData.reporter_zalo}
                  onChange={handleChange}
                  className="pl-10 input-field"
                  placeholder="Nhập số Zalo"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email liên hệ *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="reporter_email"
                  value={formData.reporter_email}
                  onChange={handleChange}
                  className="pl-10 input-field"
                  placeholder="Nhập email"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="agree-terms"
              name="agree_terms"
              checked={formData.agree_terms}
              onChange={handleChange}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded mt-1"
              required
            />
            <label htmlFor="agree-terms" className="text-sm text-gray-700">
              <span className="font-semibold">
                Cảnh báo này trên group tôi chỉ đăng hộ
              </span>
              <br />
              Tôi chính là nạn nhân, tôi đồng ý và sẵn sàng chịu trách nhiệm
              trước pháp luật về nội dung cảnh báo này.
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <Shield className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-lg text-red-900 mb-2">
                Lưu ý quan trọng
              </h3>
              <ul className="text-red-800 space-y-2 mb-4">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    Đơn tố cáo phải up đầy đủ bill chuyển khoản, đoạn chat chứng
                    minh họ lừa đảo
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    Thông tin sai sự thật sẽ bị xử lý theo quy định pháp luật
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    Bài viết sẽ được kiểm duyệt trước khi đăng công khai
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              type="submit"
              disabled={loading || !formData.agree_terms}
              className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {loading ? "Đang gửi..." : "GỬI DUYỆT"}
            </button>
            <p className="text-sm text-gray-600 mt-3">
              Bài viết của bạn sẽ được kiểm duyệt trong vòng 24h
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Report;
