import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Eye,
  Calendar,
  Ban,
  Facebook,
  User,
  Phone,
  MessageSquare,
  Share2,
  Flag,
  ChevronLeft,
  Shield,
} from "lucide-react";
import { warningsAPI, commentsAPI } from "../api/api";
import { useAuth } from "../context/AuthContext";

const WarningDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [warning, setWarning] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isVerifiedVictim, setIsVerifiedVictim] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [suggestedWarnings, setSuggestedWarnings] = useState<any[]>([]);

  useEffect(() => {
    fetchWarning();
    fetchComments();
  }, [id]);

  const fetchWarning = async () => {
    try {
      const data = await warningsAPI.getWarning(Number(id));
      setWarning(data);

      // Fetch similar warnings
      if (data.scammer_name) {
        const suggestions = await warningsAPI.search(
          data.scammer_name,
          "name",
          1,
          5
        );
        setSuggestedWarnings(
          suggestions.filter((w: any) => w.id !== Number(id))
        );
      }
    } catch (error) {
      console.error("Error fetching warning:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const data = await commentsAPI.getCommentsByWarning(Number(id));
      setComments(data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setCommentLoading(true);
    try {
      await commentsAPI.createComment({
        warning_id: Number(id),
        content: newComment,
        is_verified_victim: isVerifiedVictim,
      });

      setNewComment("");
      setIsVerifiedVictim(false);
      fetchComments();
    } catch (error) {
      console.error("Error creating comment:", error);
    } finally {
      setCommentLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const maskBankAccount = (account: string) => {
    if (!account) return "";
    if (account.includes("*")) return account;
    if (account.length <= 3) return account;
    return (
      account.slice(0, 3) + "*".repeat(account.length - 6) + account.slice(-3)
    );
  };

  const maskName = (name: string) => {
    if (!name) return "";
    const parts = name.split(" ");
    if (parts.length === 1)
      return parts[0][0] + "*".repeat(parts[0].length - 1);

    return parts
      .map((part, index) =>
        index === 0 ? part : part[0] + "*".repeat(part.length - 1)
      )
      .join(" ");
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!warning) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Không tìm thấy cảnh báo
        </h1>
        <p className="text-gray-600 mb-6">
          Cảnh báo bạn tìm kiếm không tồn tại hoặc đã bị xóa.
        </p>
        <Link to="/" className="text-red-600 hover:text-red-700 font-medium">
          ← Quay về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ChevronLeft className="h-5 w-5 mr-1" />
        Quay lại
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          {/* Warning header */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-red-100 p-2 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <span className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold mb-2">
                    {warning.category || "Lừa đảo"}
                  </span>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {warning.title}
                  </h1>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Share2 className="h-5 w-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Flag className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-6 text-gray-600 mb-6">
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-2" />
                <span>{warning.view_count || 0} lượt xem</span>
              </div>
              <div className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                <span>{comments.length} bình luận</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{formatDate(warning.created_at)}</span>
              </div>
              {warning.warning_count > 1 && (
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <span className="font-semibold text-red-600">
                    Đã bị cảnh báo {warning.warning_count} lần
                  </span>
                </div>
              )}
            </div>

            {/* Scammer info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                Thông tin scammer
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {warning.scammer_name && (
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <div className="text-sm text-gray-600">
                        Tên chủ tài khoản
                      </div>
                      <div className="font-medium">{warning.scammer_name}</div>
                    </div>
                  </div>
                )}

                {warning.bank_account && (
                  <div className="flex items-center">
                    <Ban className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <div className="text-sm text-gray-600">Số tài khoản</div>
                      <div className="font-medium">
                        {maskBankAccount(warning.bank_account)}
                      </div>
                      {warning.bank_name && (
                        <div className="text-sm text-gray-600">
                          Ngân hàng: {warning.bank_name}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {warning.facebook_link && (
                  <div className="flex items-center">
                    <Facebook className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <div className="text-sm text-gray-600">Link Facebook</div>
                      <a
                        href={warning.facebook_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:text-blue-800 break-all"
                      >
                        {warning.facebook_link}
                      </a>
                    </div>
                  </div>
                )}

                {warning.reporter_zalo && (
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <div className="text-sm text-gray-600">Zalo liên hệ</div>
                      <div className="font-medium">{warning.reporter_zalo}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                Nội dung cảnh báo
              </h3>
              <div className="prose max-w-none">
                <p className="whitespace-pre-line text-gray-700 leading-relaxed">
                  {warning.content}
                </p>
              </div>
            </div>

            {/* Evidence images */}
            {warning.evidence_images && warning.evidence_images.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Ảnh chụp bằng chứng
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {warning.evidence_images.map((url: string, index: number) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <img
                        src={url}
                        alt={`Bằng chứng ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg hover:opacity-90 transition-opacity"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Reporter info */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <Shield className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-900 mb-2">
                    Thông tin người tố cáo
                  </h4>
                  <div className="text-sm text-yellow-800">
                    {warning.is_anonymous ? (
                      <p>
                        <span className="font-medium">Ẩn danh:</span>{" "}
                        {warning.reporter_nickname || "Người dùng ẩn danh"}
                      </p>
                    ) : (
                      <>
                        <p>
                          <span className="font-medium">Họ và tên:</span>{" "}
                          {maskName(warning.reporter_name)}
                        </p>
                        {warning.reporter_zalo && (
                          <p className="mt-1">
                            <span className="font-medium">Zalo liên hệ:</span>{" "}
                            {warning.reporter_zalo}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                  <p className="text-xs text-yellow-700 mt-3 italic">
                    ⚠️ Lưu ý: Bài đăng này chỉ cung cấp thông tin cảnh báo cho
                    người dùng online, không kết luận cá nhân/tổ chức vi phạm
                    pháp luật.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Comments section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-6 text-lg">
              Bình luận ({comments.length})
            </h3>

            {/* Add comment form */}
            {user ? (
              <form onSubmit={handleSubmitComment} className="mb-8">
                <div className="mb-4">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Chia sẻ thông tin hoặc kinh nghiệm của bạn..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows={4}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="verified-victim"
                      checked={isVerifiedVictim}
                      onChange={(e) => setIsVerifiedVictim(e.target.checked)}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="verified-victim"
                      className="ml-2 text-sm text-gray-700"
                    >
                      Tôi là nạn nhân đã bị lừa
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={!newComment.trim() || commentLoading}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {commentLoading ? "Đang gửi..." : "Gửi bình luận"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="mb-8 text-center py-4 bg-gray-50 rounded-lg">
                <p className="text-gray-600">
                  Vui lòng{" "}
                  <Link
                    to="/login"
                    className="text-red-600 hover:text-red-700 font-medium"
                  >
                    đăng nhập
                  </Link>{" "}
                  để bình luận
                </p>
              </div>
            )}

            {/* Comments list */}
            <div className="space-y-6">
              {comments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Chưa có bình luận nào. Hãy là người đầu tiên!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="border-b border-gray-200 pb-6 last:border-0 last:pb-0"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {comment.user?.full_name ||
                              comment.user?.username ||
                              "Người dùng ẩn danh"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(comment.created_at)}
                            {comment.is_verified_victim && (
                              <span className="ml-2 inline-block bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs font-semibold">
                                Nạn nhân đã xác thực
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {comment.user?.id === user?.id && (
                        <button className="text-sm text-gray-500 hover:text-gray-700">
                          Chỉnh sửa
                        </button>
                      )}
                    </div>

                    <div className="pl-13">
                      <p className="text-gray-700 whitespace-pre-line">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Suggested warnings */}
          {suggestedWarnings.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Cảnh báo tương tự
              </h3>
              <div className="space-y-4">
                {suggestedWarnings.map((suggestion) => (
                  <Link
                    key={suggestion.id}
                    to={`/warning/${suggestion.id}`}
                    className="block p-3 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors"
                  >
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-1" />
                      <div>
                        <div className="font-medium text-gray-900 line-clamp-2">
                          {suggestion.title}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {suggestion.warning_count || 1} lần cảnh báo
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Report CTA */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl shadow-lg p-6 text-white">
            <AlertTriangle className="h-8 w-8 mb-4" />
            <h3 className="font-bold text-lg mb-2">Bạn có thông tin mới?</h3>
            <p className="text-red-100 mb-4">
              Nếu bạn biết thêm thông tin về scammer này, hãy chia sẻ với cộng
              đồng
            </p>
            <Link
              to="/report"
              className="block w-full bg-white text-red-600 text-center font-semibold py-3 rounded-lg hover:bg-gray-100"
            >
              BÁO CÁO THÊM THÔNG TIN
            </Link>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Thống kê bài đăng
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Lượt xem</span>
                <span className="font-medium">{warning.view_count || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Lượt tìm kiếm</span>
                <span className="font-medium">{warning.search_count || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Số lần cảnh báo</span>
                <span className="font-medium">
                  {warning.warning_count || 1}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ngày duyệt</span>
                <span className="font-medium">
                  {warning.approved_at
                    ? formatDate(warning.approved_at)
                    : "Chưa duyệt"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarningDetail;
