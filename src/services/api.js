const API_BASE_URL = import.meta.env.BACKEND_URL;

async function parseResponse(res, fallbackMessage) {
  if (res.ok) return res.json();

  let message = fallbackMessage;
  try {
    const data = await res.json();
    if (data?.message) message = data.message;
  } catch (error) {
    // Keep fallback if response has no JSON body.
  }

  throw new Error(message);
}

export const api = {
  login: async (username, password) => {
    const res = await fetch(`${API_BASE_URL}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    return parseResponse(res, "Login failed");
  },

  getStats: async (token) => {
    //console.log(API_BASE_URL);
    const res = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return parseResponse(res, "Failed to fetch stats");
  },

  getEmployees: async (token, params = {}) => {
    // console.log(API_BASE_URL);
    const query = new URLSearchParams(params).toString();
    const url = query
      ? `${API_BASE_URL}/admin/employees?${query}`
      : `${API_BASE_URL}/admin/employees`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return parseResponse(res, "Failed to fetch employees");
  },

  getEmployee: async (token, id) => {
    const res = await fetch(`${API_BASE_URL}/admin/employees/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return parseResponse(res, "Failed to fetch employee");
  },

  createEmployee: async (token, data) => {
    const res = await fetch(`${API_BASE_URL}/admin/employees`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return parseResponse(res, "Failed to create employee");
  },

  verifyEmployee: async (
    token,
    id,
    action,
    notes = "",
    rejectionReason = "",
  ) => {
    const res = await fetch(`${API_BASE_URL}/admin/employees/${id}/verify`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action, notes, rejectionReason }),
    });
    return parseResponse(res, "Failed to process verification");
  },

  deleteEmployee: async (token, id) => {
    const res = await fetch(`${API_BASE_URL}/admin/employees/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return parseResponse(res, "Failed to delete employee");
  },

  // --- REPORT MANAGEMENT ---
  getReports: async (token, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = query
      ? `${API_BASE_URL}/admin/reports?${query}`
      : `${API_BASE_URL}/admin/reports`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return parseResponse(res, "Failed to fetch reports");
  },

  getReportStats: async (token) => {
    const res = await fetch(`${API_BASE_URL}/admin/reports/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return parseResponse(res, "Failed to fetch report stats");
  },

  getReportDetails: async (token, id) => {
    const res = await fetch(`${API_BASE_URL}/admin/reports/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return parseResponse(res, "Failed to fetch report details");
  },

  updateReportStatus: async (token, id, data) => {
    const res = await fetch(`${API_BASE_URL}/admin/reports/${id}/status`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return parseResponse(res, "Failed to update report status");
  },

  issueWarning: async (token, reportId, data) => {
    const res = await fetch(
      `${API_BASE_URL}/admin/reports/${reportId}/warning`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );
    return parseResponse(res, "Failed to issue warning");
  },

  suspendUser: async (token, reportId, data) => {
    const res = await fetch(
      `${API_BASE_URL}/admin/reports/${reportId}/suspend`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );
    return parseResponse(res, "Failed to suspend user");
  },

  getWarnings: async (token, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = query
      ? `${API_BASE_URL}/admin/warnings?${query}`
      : `${API_BASE_URL}/admin/warnings`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return parseResponse(res, "Failed to fetch warnings");
  },

  getUserReports: async (token, userModel, userId) => {
    const res = await fetch(
      `${API_BASE_URL}/admin/users/${userModel}/${userId}/reports`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return parseResponse(res, "Failed to fetch user reports");
  },

  // --- QUIZ MANAGEMENT ---
  getQuizzes: async (token, params = {}) => {
    //console.log(API_BASE_URL);
    const query = new URLSearchParams(params).toString();
    const url = query
      ? `${API_BASE_URL}/admin/quizzes?${query}`
      : `${API_BASE_URL}/admin/quizzes`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return parseResponse(res, "Failed to fetch quizzes");
  },

  getQuiz: async (token, id) => {
    const res = await fetch(`${API_BASE_URL}/admin/quizzes/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return parseResponse(res, "Failed to fetch quiz");
  },

  createQuiz: async (token, data) => {
    const res = await fetch(`${API_BASE_URL}/admin/quizzes`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return parseResponse(res, "Failed to create quiz");
  },

  updateQuiz: async (token, id, data) => {
    const res = await fetch(`${API_BASE_URL}/admin/quizzes/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return parseResponse(res, "Failed to update quiz");
  },

  deleteQuiz: async (token, id) => {
    const res = await fetch(`${API_BASE_URL}/admin/quizzes/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return parseResponse(res, "Failed to delete quiz");
  },

  translateText: async (token, text, targetLang) => {
    const res = await fetch(`${API_BASE_URL}/admin/quizzes/translate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, targetLang }),
    });
    return parseResponse(res, "Failed to translate text");
  },
};
