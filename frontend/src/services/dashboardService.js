import axios from "axios";

const API_URL = "http://localhost:5000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getAdminDashboard = async () => {
  const response = await axios.get(
    `${API_URL}/dashboard/admin`,
    getAuthHeaders()
  );

  return response.data;
};

export const getCustomerDashboard = async () => {
  const response = await axios.get(
    `${API_URL}/dashboard/customer`,
    getAuthHeaders()
  );

  return response.data;
};