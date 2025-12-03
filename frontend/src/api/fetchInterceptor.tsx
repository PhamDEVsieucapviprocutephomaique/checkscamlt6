// api/fetchInterceptor.ts

// Thêm export {} để biến file thành module
export {};

// Lưu fetch gốc
const originalFetch = window.fetch;

// Override fetch global
window.fetch = async function (...args) {
  const [url, options = {}] = args;

  // Chỉ intercept các request đến API của mình
  if (typeof url === "string" && url.includes("localhost:8000")) {
    const token = localStorage.getItem("access_token");

    // Thêm token vào header nếu có
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    try {
      const response = await originalFetch(url, { ...options, headers });

      // Nếu token hết hạn (401)
      if (response.status === 401) {
        console.log("Token expired, redirecting to login...");

        // Clear storage
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");

        // Redirect đến login
        window.location.href = "/login";
        return Promise.reject(new Error("Token expired"));
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  // Với các request khác, dùng fetch bình thường
  return originalFetch(...args);
};
