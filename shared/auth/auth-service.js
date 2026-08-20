import { api, setAccessToken } from "../api-client.js";

export async function login(email, password) {
  const data = await api("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setAccessToken(data.access_token);
  sessionStorage.setItem("user", JSON.stringify(data.user));
  return data.user;
}

export async function register(payload) {
  const data = await api("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  setAccessToken(data.access_token);
  sessionStorage.setItem("user", JSON.stringify(data.user));
  return data.user;
}

export async function logout() {
  try {
    await api("/auth/logout", { method: "POST", body: "{}" });
  } catch (_) {}
  setAccessToken(null);
  sessionStorage.removeItem("user");
}

export function getUser() {
  const raw = sessionStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}

export function requireRole(role, loginUrl) {
  const user = getUser();
  if (!user || user.role !== role) {
    window.location.href = loginUrl;
    return null;
  }
  return user;
}
