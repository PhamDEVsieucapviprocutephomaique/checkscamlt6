const API_BASE_URL = "http://localhost:8000";

// Helper functions - FIX LỖI CHÍNH Ở ĐÂY
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("access_token");
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {}; // Trả về object rỗng thay vì undefined
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    const error = await response.json();
    throw new Error(error.detail || "Something went wrong");
  }
  return response.json();
};

// Auth API
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    return handleResponse(response);
  },

  register: async (userData: any) => {
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  getMe: async () => {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      headers: getAuthHeaders() as HeadersInit, // FIX: Thêm as HeadersInit
    });
    return handleResponse(response);
  },

  updateProfile: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      } as HeadersInit, // FIX: Thêm as HeadersInit
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/users/me/avatar`, {
      method: "POST",
      headers: getAuthHeaders() as HeadersInit, // FIX
      body: formData,
    });
    return handleResponse(response);
  },
};

// Warnings API
export const warningsAPI = {
  // Public endpoints
  search: async (
    query: string,
    searchType?: string,
    page: number = 1,
    limit: number = 20
  ) => {
    const params = new URLSearchParams({
      query,
      page: page.toString(),
      limit: limit.toString(),
    });
    if (searchType) params.append("search_type", searchType);

    const response = await fetch(`${API_BASE_URL}/warnings/search/?${params}`);
    return handleResponse(response);
  },

  getWarnings: async (params?: {
    skip?: number;
    limit?: number;
    status?: string;
    category?: string;
    start_date?: string;
    end_date?: string;
  }) => {
    const queryParams = new URLSearchParams(params as any);
    const response = await fetch(`${API_BASE_URL}/warnings/?${queryParams}`);
    return handleResponse(response);
  },

  getWarning: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/warnings/${id}`);
    return handleResponse(response);
  },

  getTodayWarnings: async () => {
    const response = await fetch(`${API_BASE_URL}/warnings/today/`);
    return handleResponse(response);
  },

  getTopScammers: async (days: number = 7, limit: number = 10) => {
    const response = await fetch(
      `${API_BASE_URL}/warnings/top/scammers?days=${days}&limit=${limit}`
    );
    return handleResponse(response);
  },

  getTopSearches: async (days: number = 1, limit: number = 10) => {
    const response = await fetch(
      `${API_BASE_URL}/warnings/top/searches?days=${days}&limit=${limit}`
    );
    return handleResponse(response);
  },

  getSuggestions: async (query: string, limit: number = 10) => {
    const response = await fetch(
      `${API_BASE_URL}/warnings/search/suggest/?query=${query}&limit=${limit}`
    );
    return handleResponse(response);
  },

  // User endpoints
  createWarning: async (data: any, files: File[]) => {
    const formData = new FormData();

    // Add warning data
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key]);
    });

    // Add files
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await fetch(`${API_BASE_URL}/warnings/`, {
      method: "POST",
      headers: getAuthHeaders() as HeadersInit, // FIX
      body: formData,
    });
    return handleResponse(response);
  },

  getMyWarnings: async () => {
    const response = await fetch(`${API_BASE_URL}/warnings/my-warnings`, {
      headers: getAuthHeaders() as HeadersInit, // FIX
    });
    return handleResponse(response);
  },

  // Admin endpoints
  getPendingWarnings: async (skip: number = 0, limit: number = 50) => {
    const response = await fetch(
      `${API_BASE_URL}/warnings/admin/pending?skip=${skip}&limit=${limit}`,
      {
        headers: getAuthHeaders() as HeadersInit, // FIX
      }
    );
    return handleResponse(response);
  },

  reviewWarning: async (
    warningId: number,
    data: { status: string; review_note?: string }
  ) => {
    const response = await fetch(
      `${API_BASE_URL}/warnings/admin/${warningId}/review`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        } as HeadersInit, // FIX
        body: JSON.stringify(data),
      }
    );
    return handleResponse(response);
  },

  deleteWarning: async (warningId: number) => {
    const response = await fetch(
      `${API_BASE_URL}/warnings/admin/${warningId}`,
      {
        method: "DELETE",
        headers: getAuthHeaders() as HeadersInit, // FIX
      }
    );
    return handleResponse(response);
  },
};

// Reports API
export const reportsAPI = {
  createScamReport: async (data: any, files: File[]) => {
    const formData = new FormData();

    Object.keys(data).forEach((key) => {
      formData.append(key, data[key]);
    });

    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await fetch(`${API_BASE_URL}/reports/scam`, {
      method: "POST",
      body: formData,
    });
    return handleResponse(response);
  },

  createWebsiteReport: async (data: any, files: File[]) => {
    const formData = new FormData();

    Object.keys(data).forEach((key) => {
      formData.append(key, data[key]);
    });

    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await fetch(`${API_BASE_URL}/reports/website`, {
      method: "POST",
      body: formData,
    });
    return handleResponse(response);
  },

  // Admin endpoints
  getReports: async (params?: {
    report_type?: string;
    status?: string;
    skip?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams(params as any);
    const response = await fetch(
      `${API_BASE_URL}/reports/admin/?${queryParams}`,
      {
        headers: getAuthHeaders() as HeadersInit, // FIX
      }
    );
    return handleResponse(response);
  },

  updateReport: async (reportId: number, data: { status: string }) => {
    const response = await fetch(`${API_BASE_URL}/reports/admin/${reportId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      } as HeadersInit, // FIX
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  deleteReport: async (reportId: number) => {
    const response = await fetch(`${API_BASE_URL}/reports/admin/${reportId}`, {
      method: "DELETE",
      headers: getAuthHeaders() as HeadersInit, // FIX
    });
    return handleResponse(response);
  },
};

// Admins API
export const adminsAPI = {
  // Public endpoints
  getAdmins: async (skip: number = 0, limit: number = 20) => {
    const response = await fetch(
      `${API_BASE_URL}/admins/?skip=${skip}&limit=${limit}`
    );
    return handleResponse(response);
  },

  getAdminByNumber: async (adminNumber: number) => {
    const response = await fetch(`${API_BASE_URL}/admins/${adminNumber}`);
    return handleResponse(response);
  },

  // Admin endpoints
  createAdminProfile: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/admins/profiles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      } as HeadersInit, // FIX
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  getAllAdminProfiles: async (skip: number = 0, limit: number = 50) => {
    const response = await fetch(
      `${API_BASE_URL}/admins/profiles/all?skip=${skip}&limit=${limit}`,
      {
        headers: getAuthHeaders() as HeadersInit, // FIX
      }
    );
    return handleResponse(response);
  },

  updateAdminProfile: async (profileId: number, data: any) => {
    const response = await fetch(
      `${API_BASE_URL}/admins/profiles/${profileId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        } as HeadersInit, // FIX
        body: JSON.stringify(data),
      }
    );
    return handleResponse(response);
  },

  deleteAdminProfile: async (profileId: number) => {
    const response = await fetch(
      `${API_BASE_URL}/admins/profiles/${profileId}`,
      {
        method: "DELETE",
        headers: getAuthHeaders() as HeadersInit, // FIX
      }
    );
    return handleResponse(response);
  },
};

// Comments API
export const commentsAPI = {
  createComment: async (data: {
    warning_id: number;
    content: string;
    is_verified_victim?: boolean;
  }) => {
    const response = await fetch(`${API_BASE_URL}/comments/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      } as HeadersInit, // FIX
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  getCommentsByWarning: async (
    warningId: number,
    skip: number = 0,
    limit: number = 50
  ) => {
    const response = await fetch(
      `${API_BASE_URL}/comments/warning/${warningId}?skip=${skip}&limit=${limit}`
    );
    return handleResponse(response);
  },

  updateComment: async (commentId: number, data: { content: string }) => {
    const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      } as HeadersInit, // FIX
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  deleteComment: async (commentId: number) => {
    const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
      method: "DELETE",
      headers: getAuthHeaders() as HeadersInit, // FIX
    });
    return handleResponse(response);
  },
};

// Statistics API
export const statisticsAPI = {
  getDashboardStats: async (days: number = 7) => {
    const response = await fetch(
      `${API_BASE_URL}/statistics/dashboard?days=${days}`,
      {
        headers: getAuthHeaders() as HeadersInit, // FIX
      }
    );
    return handleResponse(response);
  },

  getDailyStats: async (date: string) => {
    const response = await fetch(
      `${API_BASE_URL}/statistics/daily?date=${date}`,
      {
        headers: getAuthHeaders() as HeadersInit, // FIX
      }
    );
    return handleResponse(response);
  },
};

// User management API (Admin only)
export const usersAPI = {
  getUsers: async (params?: {
    skip?: number;
    limit?: number;
    role?: string;
    is_active?: boolean;
  }) => {
    const queryParams = new URLSearchParams(params as any);
    const response = await fetch(`${API_BASE_URL}/users/?${queryParams}`, {
      headers: getAuthHeaders() as HeadersInit, // FIX
    });
    return handleResponse(response);
  },

  getUser: async (userId: number) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      headers: getAuthHeaders() as HeadersInit, // FIX
    });
    return handleResponse(response);
  },

  updateUser: async (userId: number, data: any) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      } as HeadersInit, // FIX
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  deleteUser: async (userId: number) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "DELETE",
      headers: getAuthHeaders() as HeadersInit, // FIX
    });
    return handleResponse(response);
  },
};

// Health check
export const healthAPI = {
  check: async () => {
    const response = await fetch(`${API_BASE_URL}/health`);
    return handleResponse(response);
  },
};
