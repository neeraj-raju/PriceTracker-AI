import api from "./api"

export const registerUser = async (userData) => {

  const response = await api.post(
    "/auth/register",
    userData
  )

  return response.data
}

export const loginUser = async (userData) => {

  const response = await api.post(
    "/auth/login",
    userData
  )

  return response.data
}

export const deleteUserAccount = async () => {
  const response = await api.delete("/users/me");
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
};

export const changePassword = async (passwordData) => {
  const response = await api.put("/users/change-password", passwordData);
  return response.data;
};