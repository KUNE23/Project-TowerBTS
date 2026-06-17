import { computed, reactive } from "vue";
import * as authService from "../services/authService.js";

const savedToken = localStorage.getItem("token");
const initialToken = savedToken === "btsense-demo-token" ? "" : savedToken;

if (savedToken === "btsense-demo-token") {
  localStorage.removeItem("token");
}

const state = reactive({
  token: initialToken,
  user: {
    id: 1,
    name: "Budi Santoso",
    email: "budi.santoso@btsense.co.id",
    phone: "+62 812 3456 7890",
    role: "supervisor",
  },
  loading: false,
  error: "",
});

export const useAuthStore = () => {
  const isAuthenticated = computed(() => Boolean(state.token));
  const isSupervisor = computed(() => state.user?.role === "supervisor");
  const initials = computed(() => {
    const name = state.user?.name || "SP";
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase();
  });

  const login = async (payload) => {
    state.loading = true;
    state.error = "";

    try {
      const result = await authService.login(payload);
      state.token = result.token || result.data?.token;
      state.user = result.user || result.data?.user || state.user;

      if (state.token) {
        localStorage.setItem("token", state.token);
      } else {
        throw new Error("Login berhasil, tetapi token tidak ditemukan di response backend.");
      }

      return result;
    } catch (error) {
      state.error = error.message || "Login gagal. Periksa koneksi backend dan kredensial.";
      throw error;
    } finally {
      state.loading = false;
    }
  };

  const updateProfile = async (payload) => {
    state.loading = true;

    try {
      const result = await authService.updateProfile(payload);
      state.user = result.user || result.data?.user || { ...state.user, ...payload };
      return result;
    } finally {
      state.loading = false;
    }
  };

  const logout = async () => {
    await authService.logout();
    state.token = "";
  };

  return {
    state,
    isAuthenticated,
    isSupervisor,
    initials,
    login,
    updateProfile,
    logout,
  };
};
