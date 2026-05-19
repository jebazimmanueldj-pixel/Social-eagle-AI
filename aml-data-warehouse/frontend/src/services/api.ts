import axios from "axios";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/auth";

export const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? "/api";

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 30_000,
});

api.interceptors.request.use((cfg) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    cfg.headers = cfg.headers ?? {};
    cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    const message =
      err?.response?.data?.message ?? err?.message ?? "Unexpected error";
    if (status === 401) {
      useAuthStore.getState().clear();
      if (window.location.pathname !== "/login") {
        toast.error("Session expired — please sign in again");
        window.location.href = "/login";
      }
    } else if (status === 403) {
      toast.error("Access denied for this action");
    } else if (status >= 500) {
      toast.error("Server error: " + message);
    }
    return Promise.reject(err);
  }
);
