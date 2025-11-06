import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword({ goToReset }) {
  const navigate = useNavigate();
  const goBack = () => {
  navigate("/login");
};
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown === 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const sendOTP = async () => {
    setMessage("");
    setError("");
    if (!email) return setError("Vui lòng nhập email");

    setLoading(true);
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/request-password-reset/",
        { email }
      );
      setMessage(res.data.message);
      setOtpSent(true);
      setOtp(""); 
      setCountdown(60);
    } catch (err) {
      setError(err.response?.data?.error || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp) return setError("Vui lòng nhập OTP");
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await axios.post("http://127.0.0.1:8000/api/verify-otp/", {
        email,
        otp,
      });
      goToReset(email, otp);
    } catch (err) {
      setError(err.response?.data?.error || "OTP không đúng hoặc đã hết hạn");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "50px auto",
        padding: 30,
        borderRadius: 12,
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        backgroundColor: "#fff",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>Quên mật khẩu</h2>

      <input
        type="email"
        placeholder="Nhập email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          width: "94%",
          padding: 12,
          marginBottom: 15,
          borderRadius: 8,
          border: "1px solid #ccc",
        }}
        disabled={otpSent}
      />

      <button
        type="button"
        onClick={sendOTP}
        disabled={loading || countdown > 0}
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 8,
          border: "none",
          backgroundColor: countdown > 0 ? "#ccc" : "#2196F3",
          color: "#fff",
          cursor: countdown > 0 ? "not-allowed" : "pointer",
          marginBottom: 15,
        }}
      >
        {countdown > 0 ? `Gửi lại sau ${countdown}s` : "Gửi mã OTP"}
      </button>

      {otpSent && (
        <>
          <input
            placeholder="Nhập OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            style={{
              width: "94%",
              padding: 12,
              marginBottom: 15,
              borderRadius: 8,
              border: "1px solid #ccc",
            }}
          />
          <button
            type="button"
            onClick={verifyOTP}
            disabled={loading}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 8,
              border: "none",
              backgroundColor: "#2196F3",
              color: "#fff",
              cursor: "pointer",
              marginBottom: 15,
            }}
          >
            Xác nhận OTP
          </button>
        </>
      )}

      {error && <p style={{ color: "red", marginBottom: 10 }}>{error}</p>}
      {message && <p style={{ color: "green", marginBottom: 10 }}>{message}</p>}

      <div
        style={{ textAlign: "right", color: "#2196F3", cursor: "pointer" }}
        onClick={goBack}
      >
        Quay lại đăng nhập
      </div>
    </div>
  );
}
