const API_BASE_URL = "https://ap-automation-api.onrender.com/api";

export const invoiceAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/invoices/`);
    if (!response.ok) throw new Error("Failed to fetch invoices");
    return response.json();
  },

  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/invoices/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create invoice");
    return response.json();
  },

  update: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
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
    });

    if (!response.ok) {
      throw new Error("Failed to delete invoice");
    }

    return true;
  },

  submit: async (id) => {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}/submit/`, {
      method: "POST",
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
    });

    if (!response.ok) {
      throw new Error("Failed to approve invoice");
    }

    return response.json();
  },

  reject: async (id, rejectionReason) => {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}/reject/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to mark invoice as paid");
    }

    return result;
  },
};
