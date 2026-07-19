import api from "./api";

export const loginApi = async (data) => {
  const response = await api.post(
    "/users/login",
    data
  );

  return response.data;
};

export const registerApi = async (data) => {
  const response = await api.post(
    "/users/register",
    data
  );

  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get(
    "/users/me"
  );

  return response.data;
};

export const getMyAvatar = async () => {
  const response = await api.get("/users/my-avatar", {
    responseType: "blob",
  });

  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post("/users/forgot-password", { email });
  return response.data;
}

export const resetPassword = async ({ token, newPassword }) => {
  const response = await api.post("/users/reset-password", {
    token,
    newPassword,
  });
  return response.data;
};