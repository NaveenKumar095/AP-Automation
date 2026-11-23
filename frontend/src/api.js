const API_BASE_URL = "http://127.0.0.1:8000/api";
const getAccessToken = () => localStorage.getItem("access_token");
const authHeaders = (extra = {}) => ({
  ...extra,
  Authorization: `Bearer ${getAccessToken()}`,
});

export const invoiceAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/invoices/`, {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    });
    if (!response.ok) throw new Error("Failed to fetch invoices");
    return response.json();
  },

  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/invoices/`, {
      method: "POST",
      headers: authHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("Failed to create invoice");
    return response.json();
  },

  update: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}/`, {
      method: "PATCH",
      headers: authHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to update invoice");
    }

    return response.json();
  },

  remove: async (id) => {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}/`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to delete invoice");
    }

    return true;
  },

  submit: async (id) => {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}/submit/`, {
      method: "POST",
      headers: authHeaders(),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to submit invoice");
    }

    return result;
  },

  approve: async (id) => {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}/approve/`, {
      method: "POST",
      headers: authHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to approve invoice");
    }

    return response.json();
  },

  reject: async (id, rejectionReason) => {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}/reject/`, {
      method: "POST",
      headers: authHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify({
        rejection_reason: rejectionReason,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to reject invoice");
    }

    return result;
  },

  pay: async (id) => {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}/pay/`, {
      method: "POST",
      headers: authHeaders(),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to mark invoice as paid");
    }

    return result;
  },
};

export const authAPI = {
  register: async (data) => {
    const response = await fetch(`${API_BASE_URL}/auth/register/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(JSON.stringify(result));
    }

    return result;
  },

  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.detail || "Login failed");
    }

    return result;
  },
};

export const vendorAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/vendors/`, {
      headers: authHeaders(),
    });

    if (!response.ok) throw new Error("Failed to fetch vendors");
    return response.json();
  },

  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/vendors/`, {
      method: "POST",
      headers: authHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("Failed to create vendor");
    return response.json();
  },

  update: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/vendors/${id}/`, {
      method: "PATCH",
      headers: authHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("Failed to update vendor");
    return response.json();
  },

  remove: async (id) => {
    const response = await fetch(`${API_BASE_URL}/vendors/${id}/`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    if (!response.ok) throw new Error("Failed to delete vendor");
    return true;
  },
};
