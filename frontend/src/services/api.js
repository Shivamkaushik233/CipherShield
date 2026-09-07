import axios from "axios";

// In local dev, Vite's dev server proxies "/api" to the backend (see
// vite.config.js), so the relative path just works. In production
// (a static build deployed separately from the backend, e.g. on Render)
// there's no proxy, so VITE_API_URL must be set at build time to the
// backend's full URL - see render.yaml.
const baseURL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({ baseURL });

// For plain <a href> downloads (PDF receipts/reports, vault files) that
// don't go through axios - these need the same absolute-URL treatment in
// production as the API client above.
export function apiFileUrl(path) {
  return `${baseURL}${path}`;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ciphershield_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("ciphershield_token");
      localStorage.removeItem("ciphershield_user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;
