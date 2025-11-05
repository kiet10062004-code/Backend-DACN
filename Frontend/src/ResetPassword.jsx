import React, { useState } from "react";
import axios from "axios";

export default function ResetPassword({ email, otp, goBack }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); setError("");

    if (!newPassword || !confirmPassword) return setError("Vui lòng nhập mật khẩu và xác nhận");
    if (newPassword !== confirmPassword) return setError("Mật khẩu xác nhận không khớp");
    if (!email) return setError("Email không được để trống");
    if (!otp) return setError("OTP không được để trống");
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/reset-password/", {
        email,
        otp,
        new_password: newPassword
      });
      setMessage(res.data.message);
      setNewPassword(""); setConfirmPassword("");
    } catch (err) {
      setError(err.response?.data?.error || "Có lỗi xảy ra");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: "50px auto", padding: 30, borderRadius: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.1)", backgroundColor: "#fff" }}>
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>Đổi mật khẩu</h2>

      <input
        type="password"
        placeholder="Mật khẩu mới"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        style={{ width: "90%", padding: 12, marginBottom: 15, borderRadius: 8, border: "1px solid #ccc" }}
      />

      <input
        type="password"
        placeholder="Xác nhận mật khẩu mới"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        style={{ width: "90%", padding: 12, marginBottom: 15, borderRadius: 8, border: "1px solid #ccc" }}
      />

      {error && <p style={{ color: "red", marginBottom: 10 }}>{error}</p>}
      {message && <p style={{ color: "green", marginBottom: 10 }}>{message}</p>}

      <button type="submit" style={{ width: "100%", padding: 12, borderRadius: 8, border: "none", backgroundColor: "#2196F3", color: "#fff", cursor: "pointer", marginBottom: 10 }}>
        Đổi mật khẩu
      </button>

      <div style={{ textAlign: "right", color: "#2196F3", cursor: "pointer" }} onClick={goBack}>Quay lại đăng nhập</div>
    </form>
  );
}
