import axios from "axios";

export async function ensureAccessToken() {
  let token = localStorage.getItem("access_token");
  const refreshToken = localStorage.getItem("refresh_token");

  if (!token && !refreshToken) return null;

  // nếu chưa hết hạn thì trả luôn
  if (token) return token;

  // nếu access hết hạn -> refresh
  try {
    const res = await axios.post("http://127.0.0.1:8000/api/token/refresh/", {
      refresh: refreshToken,
    });

    localStorage.setItem("access_token", res.data.access);
    return res.data.access;
  } catch {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    return null;
  }
}
