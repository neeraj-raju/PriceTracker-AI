import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api"
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response ? error.response.status : null;

    if (status === 401) {
      // Clear expired token
      localStorage.removeItem("token");
      localStorage.removeItem("name");
      localStorage.removeItem("email");

      // If user is currently on a protected page, redirect to login
      const currentPath = window.location.pathname;
      if (currentPath === "/dashboard" || currentPath === "/compare") {
        window.location.href = "/login?session=expired";
      }
    }

    return Promise.reject(error);
  }
);

export default api;