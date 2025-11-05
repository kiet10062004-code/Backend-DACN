import React, { useEffect, useState } from "react";
import axiosClient from "./AxiosClient";
import { ensureAccessToken } from "./auth";
import { useNavigate } from "react-router-dom";

export default function Profile({ setAvatarUrl, setFullName }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      const token = await ensureAccessToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axiosClient.get("/api/profile/");
        setProfile(res.data);

        const fullName = `${res.data.first_name || ""} ${res.data.last_name || ""}`.trim();
        if (setFullName) setFullName(fullName);
        if (setAvatarUrl && res.data.avatar) setAvatarUrl(res.data.avatar);
      } catch {
        setMessage("Không thể tải thông tin người dùng.");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profile.first_name?.trim() || !profile.last_name?.trim()) {
      setMessage("Họ và Tên không được để trống.");
      return;
    }

    setSaving(true);
    const formData = new FormData();
    formData.append("first_name", profile.first_name || "");
    formData.append("last_name", profile.last_name || "");
    formData.append("phone", profile.phone || "");
    if (avatarFile) formData.append("avatar", avatarFile);

    try {
      const res = await axiosClient.put("/api/profile/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setProfile(res.data);
      setMessage("Cập nhật hồ sơ thành công!");

      const fullName = `${res.data.first_name || ""} ${res.data.last_name || ""}`.trim();
      if (setFullName) setFullName(fullName);

      if (setAvatarUrl && res.data.avatar) {
        setAvatarUrl(res.data.avatar);
        localStorage.setItem("avatar_url", res.data.avatar);
      }
    } catch {
      setMessage("Cập nhật thất bại.");
    } finally {
      setSaving(false);
    }
  };

  const maskEmail = (email) => {
    if (!email) return "";
    const [user, domain] = email.split("@");
    return user.slice(0, 2) + "****@" + domain;
  };

  const onAvatarSelect = (file) => {
    setAvatarFile(file);
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  };

  if (loading)
    return (
      <div
        style={{
          padding: 20,
          height: "100vh",
          width: "100vw",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#eee" }} />
      </div>
    );

  return (
    <div
      style={{
        minHeight: "calc(100vh - 120px)", 
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "400px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          border: "1px solid #ddd",
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "30px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        {message && (
          <p style={{ color: message.includes("thành công") ? "green" : "red", marginBottom: 10 }}>
            {message}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <img
            src={preview || profile.avatar || "/media/avatars/default.jpg"}
            width={120}
            height={120}
            style={{ borderRadius: "50%", marginBottom: 15, objectFit: "cover" }}
            alt="avatar"
          />

          <input type="file" onChange={(e) => onAvatarSelect(e.target.files[0])} style={{ marginBottom: 15 }} />

          <input
            style={inputStyle}
            name="first_name"
            placeholder="Họ"
            value={profile.first_name || ""}
            onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
          />

          <input
            style={inputStyle}
            name="last_name"
            placeholder="Tên"
            value={profile.last_name || ""}
            onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
          />

          <input
            style={{ ...inputStyle, background: "#f5f5f5", cursor: "not-allowed" }}
            disabled
            value={profile.phone || ""}
          />

          <input
            style={{ ...inputStyle, background: "#f5f5f5", cursor: "not-allowed" }}
            disabled
            value={maskEmail(profile.email)}
          />

          <button
            type="submit"
            disabled={saving}
            style={{
              marginTop: 20,
              padding: "10px 20px",
              backgroundColor: saving ? "#ccc" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: saving ? "not-allowed" : "pointer",
              width: "110%",
              fontSize: "16px",
              transition: "0.3s",
            }}
          >
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>

          <div
            style={{
              color: "#2196F3",
              cursor: "pointer",
              fontSize: "0.9em",
              paddingTop: "10px",
            }}
            onClick={() => navigate("/change-password")}
          >
            Đổi mật khẩu
          </div>
        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginTop: "10px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  fontSize: "15px",
};
