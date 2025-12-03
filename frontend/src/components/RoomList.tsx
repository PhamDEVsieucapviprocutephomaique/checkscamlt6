import React from "react";

interface RoomListProps {
  rooms: any[];
  loading: boolean;
  selectedRoom: any;
  onRoomClick: (roomId: string) => void;
  onCloseOverlay: () => void; // PROP MỚI
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const RoomList: React.FC<RoomListProps> = ({
  rooms,
  loading,
  selectedRoom,
  onRoomClick,
  onCloseOverlay,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  // OVERLAY COMPONENT - HIỂN THỊ ĐẦY ĐỦ THÔNG TIN TỪ API DETAIL
  const RoomDetailOverlay = () => {
    if (!selectedRoom) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-2xl font-bold">{selectedRoom.title}</h2>
            <button
              onClick={onCloseOverlay}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-200 transition duration-200"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Images */}
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-2">
                {selectedRoom.images && selectedRoom.images.length > 0 ? (
                  selectedRoom.images.map((img: string, index: number) => (
                    <img
                      key={index}
                      src={img}
                      alt={`${selectedRoom.title} ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))
                ) : (
                  <div className="col-span-2 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">Chưa có ảnh</span>
                  </div>
                )}
              </div>
            </div>

            {/* Price & Area */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="text-blue-600 font-bold text-2xl">
                  {new Intl.NumberFormat("vi-VN").format(selectedRoom.price)}đ
                </div>
                <div className="text-blue-600 text-sm">Giá thuê / tháng</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <div className="text-green-600 font-bold text-2xl">
                  {selectedRoom.area}m²
                </div>
                <div className="text-green-600 text-sm">Diện tích</div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-3 text-gray-800">
                Mô tả
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-line">
                  {selectedRoom.description || "Chưa có mô tả chi tiết"}
                </p>
              </div>
            </div>

            {/* Address */}
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-3 text-gray-800">
                Địa chỉ
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="text-gray-700 mb-2">
                  <strong className="text-gray-800">Địa chỉ đầy đủ:</strong>
                  <br />
                  <span className="text-blue-600">
                    {selectedRoom.address.full_address}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 text-sm">
                  <div className="bg-white p-3 rounded border">
                    <strong className="text-gray-700">Tỉnh/TP:</strong>
                    <div className="text-gray-600 mt-1">
                      {selectedRoom.address.province}
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <strong className="text-gray-700">Quận/Huyện:</strong>
                    <div className="text-gray-600 mt-1">
                      {selectedRoom.address.district}
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <strong className="text-gray-700">Phường/Xã:</strong>
                    <div className="text-gray-600 mt-1">
                      {selectedRoom.address.ward}
                    </div>
                  </div>
                </div>
                {selectedRoom.address.address_detail && (
                  <div className="mt-3 bg-white p-3 rounded border">
                    <strong className="text-gray-700">Địa chỉ cụ thể:</strong>
                    <div className="text-gray-600 mt-1">
                      {selectedRoom.address.address_detail}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Landlord Info */}
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-3 text-gray-800">
                Thông tin liên hệ
              </h3>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded border">
                    <strong className="text-gray-700">Email:</strong>
                    <div className="text-gray-600 mt-1">
                      {selectedRoom.landlord.email ? (
                        <a
                          href={`mailto:${selectedRoom.landlord.email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {selectedRoom.landlord.email}
                        </a>
                      ) : (
                        "Chưa có thông tin"
                      )}
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <strong className="text-gray-700">Số điện thoại:</strong>
                    <div className="text-gray-600 mt-1">
                      {selectedRoom.landlord.phone ? (
                        <a
                          href={`tel:${selectedRoom.landlord.phone}`}
                          className="text-blue-600 hover:underline"
                        >
                          {selectedRoom.landlord.phone}
                        </a>
                      ) : (
                        "Chưa có thông tin"
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded border">
                <strong className="text-gray-700">Trạng thái:</strong>
                <div
                  className={`font-medium mt-1 ${
                    selectedRoom.room_status === "available"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {selectedRoom.room_status === "available"
                    ? "🟢 Còn trống"
                    : "🔴 Đã cho thuê"}
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded border">
                <strong className="text-gray-700">Ngày đăng:</strong>
                <div className="text-gray-600 mt-1">
                  {new Date(selectedRoom.created_at).toLocaleDateString(
                    "vi-VN",
                    {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t p-6 flex justify-end space-x-3 bg-gray-50 rounded-b-lg">
            <button
              onClick={onCloseOverlay}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition duration-200 font-medium"
            >
              Đóng
            </button>
            {selectedRoom.landlord.phone && (
              <a
                href={`tel:${selectedRoom.landlord.phone}`}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 font-medium"
              >
                📞 Gọi ngay
              </a>
            )}
            <a
              href={`https://zalo.me/${selectedRoom.landlord.phone}`}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
            >
              💬 Nhắn Zalo
            </a>
          </div>
        </div>
      </div>
    );
  };

  // Pagination component (giữ nguyên)
  const Pagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => onPageChange(1)}
          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="start-ellipsis" className="px-2">
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`px-3 py-1 border rounded ${
            currentPage === i
              ? "bg-blue-600 text-white border-blue-600"
              : "border-gray-300 hover:bg-gray-50"
          }`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="end-ellipsis" className="px-2">
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => onPageChange(totalPages)}
          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
        >
          {totalPages}
        </button>
      );
    }

    return (
      <div className="flex justify-center items-center space-x-2 mt-6">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Trước
        </button>

        <div className="flex space-x-1">{pages}</div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Sau →
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Danh sách phòng trọ</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-lg overflow-hidden animate-pulse"
            >
              <div className="h-48 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Danh sách phòng trọ</h2>
          {totalPages > 1 && (
            <div className="text-sm text-gray-600">
              Trang {currentPage} / {totalPages}
            </div>
          )}
        </div>

        <div
          id="room-list"
          className="max-h-[600px] overflow-y-auto mb-6 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rooms.map((room) => (
              <div
                key={room.id}
                className={`border rounded-lg overflow-hidden hover:shadow-lg transition duration-200 ${
                  selectedRoom?.id === room.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200"
                }`}
              >
                <div className="h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
                  {room.images && room.images.length > 0 ? (
                    <img
                      src={room.images[0]}
                      alt={room.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-500">Chưa có ảnh</span>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    {room.title}
                  </h3>

                  <div className="flex items-center text-yellow-600 mb-2">
                    <span className="font-bold text-xl">
                      {new Intl.NumberFormat("vi-VN").format(room.price)}đ
                    </span>
                    <span className="text-sm ml-1">/tháng</span>
                  </div>

                  <div className="text-gray-600 text-sm mb-2">
                    <span className="font-medium">Diện tích:</span> {room.area}
                    m²
                  </div>

                  <div className="text-gray-600 text-sm mb-3">
                    <span className="font-medium">Địa chỉ:</span> {room.ward},{" "}
                    {room.district}
                  </div>

                  <div className="text-gray-500 text-xs mb-4">
                    Đăng ngày{" "}
                    {new Date(room.created_at).toLocaleDateString("vi-VN")}
                  </div>

                  <button
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200"
                    onClick={() => onRoomClick(room.id)}
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Pagination />

        {rooms.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-4">🏠</div>
            <p className="text-lg">Không tìm thấy phòng phù hợp</p>
            <p className="text-sm mt-2">Hãy thử thay đổi bộ lọc tìm kiếm</p>
          </div>
        )}
      </div>

      {/* OVERLAY HIỂN THỊ KHI CÓ SELECTED ROOM */}
      <RoomDetailOverlay />
    </>
  );
};

export default RoomList;
