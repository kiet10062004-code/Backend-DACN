import React, { useEffect, useState } from "react";
import axiosClient from "./AxiosClient";
import { ensureAccessToken } from "./auth";

export default function Profile({ setAvatarUrl, setFullName }) {
  const [profile, setProfile] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      const token = await ensureAccessToken();
      if (!token) return (window.location.href = "/login");

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
      <div style={{ padding: 20 }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#eee", marginBottom: 10 }} />
        <div style={{ width: "100%", height: 15, background: "#eee", marginBottom: 5 }} />
        <div style={{ width: "80%", height: 15, background: "#eee" }} />
      </div>
    );

  return (
    <div style={{ padding: "20px", maxWidth: "400px" }}>
      <h1>Thông tin cá nhân</h1>
      {message && (
        <p style={{ color: message.includes("thành công") ? "green" : "red" }}>{message}</p>
      )}

      <form onSubmit={handleSubmit}>
        <img
          src={preview || profile.avatar || "/media/avatars/default.jpg"}
          width={120}
          style={{ borderRadius: "50%", marginBottom: 10 }}
          alt="avatar"
        />

        <input type="file" onChange={(e) => onAvatarSelect(e.target.files[0])} />

        <input
          style={{ display: "block", marginTop: 10 }}
          name="first_name"
          value={profile.first_name || ""}
          onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
        />

        <input
          style={{ display: "block", marginTop: 10 }}
          name="last_name"
          value={profile.last_name || ""}
          onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
        />

        <input
          style={{ display: "block", marginTop: 10 }}
          name="phone"
          value={profile.phone || ""}
          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
        />

        <input
          style={{ display: "block", marginTop: 10 }}
          disabled
          value={maskEmail(profile.email)}
        />

        <button
          type="submit"
          disabled={saving}
          style={{ marginTop: 15, padding: "8px 12px", cursor: saving ? "not-allowed" : "pointer" }}
        >
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </form>
    </div>
  );
}
