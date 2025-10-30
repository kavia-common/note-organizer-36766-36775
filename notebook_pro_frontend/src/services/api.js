const env = {
  API_BASE: process.env.REACT_APP_API_BASE || "",
  BACKEND_URL: process.env.REACT_APP_BACKEND_URL || "",
  FRONTEND_URL: process.env.REACT_APP_FRONTEND_URL || "",
  WS_URL: process.env.REACT_APP_WS_URL || "",
  NODE_ENV: process.env.REACT_APP_NODE_ENV || process.env.NODE_ENV || "development",
  NEXT_TELEMETRY_DISABLED: process.env.REACT_APP_NEXT_TELEMETRY_DISABLED || "",
  ENABLE_SOURCE_MAPS: process.env.REACT_APP_ENABLE_SOURCE_MAPS || "",
  PORT: process.env.REACT_APP_PORT || "3000",
  TRUST_PROXY: process.env.REACT_APP_TRUST_PROXY || "",
  LOG_LEVEL: process.env.REACT_APP_LOG_LEVEL || "info",
  HEALTHCHECK_PATH: process.env.REACT_APP_HEALTHCHECK_PATH || "/health",
  FEATURE_FLAGS: process.env.REACT_APP_FEATURE_FLAGS || "",
  EXPERIMENTS_ENABLED: process.env.REACT_APP_EXPERIMENTS_ENABLED || "",
};

/**
 * PUBLIC_INTERFACE
 * createApiClient
 * Creates a minimal API client; if no API_BASE is set, returns a mock client that rejects calls.
 */
export function createApiClient() {
  const base = env.API_BASE || env.BACKEND_URL;
  const enabled = Boolean(base);

  const headers = { "Content-Type": "application/json" };

  const http = async (path, options = {}) => {
    const url = `${base}${path}`;
    const res = await fetch(url, { ...options, headers: { ...headers, ...(options.headers || {}) } });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API ${res.status}: ${text}`);
    }
    return res.status === 204 ? null : res.json();
  };

  // Define endpoints shape we might support in future; currently not used.
  const client = {
    enabled,
    env,
    listNotes: () => http("/notes"),
    getNote: (id) => http(`/notes/${id}`),
    createNote: (data) => http("/notes", { method: "POST", body: JSON.stringify(data) }),
    updateNote: (id, data) => http(`/notes/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    deleteNote: (id) => http(`/notes/${id}`, { method: "DELETE" }),
    // categories
    listCategories: () => http("/categories"),
    createCategory: (data) => http("/categories", { method: "POST", body: JSON.stringify(data) }),
  };

  if (!enabled) {
    // Return a disabled client that throws to signal mock mode is active
    const disabled = {};
    Object.keys(client).forEach((k) => {
      if (typeof client[k] === "function") {
        disabled[k] = () => Promise.reject(new Error("API disabled: running in mock mode"));
      } else {
        disabled[k] = client[k];
      }
    });
    disabled.enabled = false;
    return disabled;
  }

  return client;
}
