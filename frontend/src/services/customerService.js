import axios from "axios";

const API_URL = "http://localhost:5000/api/customer";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getCustomers = async () => {
  const response = await axios.get(
    API_URL,
    getAuthHeaders()
  );

  return response.data;
};

export const getCustomer = async (customerId) => {
  const response = await axios.get(
    `${API_URL}/${customerId}`,
    getAuthHeaders()
  );

  return response.data;
};