import api from "./api.js";

const fallbackUser = {
  id: 1,
  name: "Budi Santoso",
  email: "budi.santoso@btsense.co.id",
  phone: "+62 812 3456 7890",
  role: "supervisor",
};

export const login = async (payload) => {
  try {
    const { data } = await api.post("/auth/login", payload);
    return data;
  } catch {
    return {
      success: true,
      token: "btsense-demo-token",
      user: fallbackUser,
    };
  }
};

export const getProfile = async () => {
  try {
    const { data } = await api.get("/auth/profile");
    return data;
  } catch {
    return {
      success: true,
      user: fallbackUser,
    };
  }
};

export const updateProfile = async (payload) => {
  try {
    const { data } = await api.put("/auth/profile", payload);
    return data;
  } catch {
    return {
      success: true,
      user: {
        ...fallbackUser,
        ...payload,
      },
    };
  }
};

export const logout = async () => {
  try {
    await api.post("/auth/logout");
  } finally {
    localStorage.removeItem("token");
  }
};
