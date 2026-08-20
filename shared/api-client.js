const API_BASE = window.TRAVIA_API || "http://localhost:8000/api/v1";

function getAccessToken() {
  return sessionStorage.getItem("access_token");
}

function setAccessToken(token) {
  if (token) sessionStorage.setItem("access_token", token);
  else sessionStorage.removeItem("access_token");
}

async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers, credentials: "include" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.message || res.statusText;
    throw new Error(msg);
  }
  return data;
}

export { api, getAccessToken, setAccessToken, API_BASE };
