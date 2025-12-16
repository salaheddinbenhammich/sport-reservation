import api from "./api"; // axios instance with baseURL & token interceptors

export const updateUserProfile = async (data: any) => {
  let response;

  // If data is FormData, Axios automatically sets multipart headers
  if (data instanceof FormData) {
    response = await api.patch("/users/me", data);
  } else {
    response = await api.patch("/users/me", data, {
      headers: { "Content-Type": "application/json" },
    });
  }

  return response.data;
};
