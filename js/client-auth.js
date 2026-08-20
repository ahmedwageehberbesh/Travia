/** Demo auth — session + persisted accounts, no backend. */

const USERS_KEY = "travia_demo_users";
const SESSION_KEY = "demo_user";

function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getUser() {
  const raw = sessionStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function login(email, password) {
  await new Promise((r) => setTimeout(r, 400));
  const users = loadUsers();
  const key = email.trim().toLowerCase();
  const stored = users[key];

  if (stored && stored.password !== password) {
    throw new Error("كلمة المرور غير صحيحة / Invalid password");
  }

  const user = stored || {
    email: key,
    full_name: key.split("@")[0] || "Demo User",
    role: "CLIENT",
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

export async function register({ email, full_name, password }) {
  await new Promise((r) => setTimeout(r, 400));
  const key = email.trim().toLowerCase();
  const users = loadUsers();

  if (users[key]) {
    throw new Error("البريد مسجّل مسبقاً / Email already registered");
  }

  const user = { email: key, full_name, role: "CLIENT" };
  users[key] = { ...user, password };
  saveUsers(users);
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

export async function logout() {
  sessionStorage.removeItem(SESSION_KEY);
}
