/** Demo auth for client app — no backend calls. */

export function getUser() {
  const raw = sessionStorage.getItem("demo_user");
  return raw ? JSON.parse(raw) : null;
}

export async function login(email, _password) {
  await new Promise((r) => setTimeout(r, 400));
  const user = {
    email,
    full_name: email.split("@")[0] || "Demo User",
    role: "CLIENT",
  };
  sessionStorage.setItem("demo_user", JSON.stringify(user));
  return user;
}

export async function register({ email, full_name }) {
  await new Promise((r) => setTimeout(r, 400));
  const user = { email, full_name, role: "CLIENT" };
  sessionStorage.setItem("demo_user", JSON.stringify(user));
  return user;
}

export async function logout() {
  sessionStorage.removeItem("demo_user");
}
