import axios from "axios";

// Base URL - update this to match your server configuration
const API_BASE_URL = "http://localhost:8000/api";

export const customerDeliveryNoticeApi = {
  getAll: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/customerdelivery/get-all`, {
        params,
        withCredentials: true
      });
      return response.data.data || response.data; // Handle both response formats
    } catch (error) {
      console.error("Error fetching all delivery notices:", error);
      throw new Error(error.response?.data?.error || "Failed to fetch delivery notices");
    }
  },

  getByUser: async (email) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/customerdelivery/get-data`,
        { email },
        { withCredentials: true }
      );
      return response.data.data || response.data;
    } catch (error) {
      console.error("Error fetching user delivery notices:", error);
      throw new Error(error.response?.data?.error || "Failed to fetch user delivery notices");
    }
  },

  search: async (searchParams) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/customerdelivery/search`,
        searchParams,
        { withCredentials: true }
      );
      return response.data.data || response.data;
    } catch (error) {
      console.error("Error searching delivery notices:", error);
      throw new Error(error.response?.data?.error || "Failed to search delivery notices");
    }
  },

  create: async (noticeData, user) => {
    try {
      const payload = [noticeData, { user }];
      const response = await axios.post(
        `${API_BASE_URL}/customerdelivery/add-data`,
        payload,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error("Error creating delivery notice:", error);
      throw new Error(error.response?.data?.error || "Failed to create delivery notice");
    }
  },

  update: async (id, noticeData) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/customerdelivery/update/${id}`,
        noticeData,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating delivery notice:", error);
      throw new Error(error.response?.data?.error || "Failed to update delivery notice");
    }
  },

  delete: async (id) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/customerdelivery/delete/${id}`,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting delivery notice:", error);
      throw new Error(error.response?.data?.error || "Failed to delete delivery notice");
    }
  }
};