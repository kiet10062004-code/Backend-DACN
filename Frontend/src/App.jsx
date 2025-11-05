import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Layout from "./Layout";
import Trangchu from "./Trangchu";
import Products from "./Products";
import Dangky from "./DangKy";
import Dangnhap from "./Dangnhap";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import Cart from "./Cart";
import Thanhtoan from "./Thanhtoan";
import TraCuuDonHang from "./TraCuuDonHang";
import Profile from "./Profile";
import ProductDetail from "./ProductDetail";
import axiosClient from "./AxiosClient";
import { ensureAccessToken } from "./auth";
import ChangePassword from "./ChangePassword";

function App() {
  const navigate = useNavigate();  // ✅ cần khai báo ở đây

  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("access_token"));
  const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem("avatar_url") || "");
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      const token = await ensureAccessToken();
      if (!token) return;

      try {
        const res = await axiosClient.get("/api/profile/");
        const fullName = `${res.data.first_name || ""} ${res.data.last_name || ""}`.trim();
        setFullName(fullName);

        if (res.data.avatar) {
          setAvatarUrl(res.data.avatar);
          localStorage.setItem("avatar_url", res.data.avatar);
        }
      } catch (error) {
        console.log("Không thể tải profile");
      }
    }

    if (isLoggedIn) fetchProfile();
  }, [isLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("avatar_url");

    setIsLoggedIn(false);
    setAvatarUrl("");
    setFullName("");

    navigate("/login");  
  };

  const LayoutRoute = ({ children }) => (
    <Layout
      isLoggedIn={isLoggedIn}
      avatarUrl={avatarUrl}
      fullName={fullName}
      handleLogout={handleLogout}  
    >
      {children}
    </Layout>
  );

  return (
    <Routes>
      <Route path="/" element={<LayoutRoute><Trangchu /></LayoutRoute>} />
      <Route path="/products" element={<LayoutRoute><Products /></LayoutRoute>} />
      <Route path="/product/:id" element={<LayoutRoute><ProductDetail /></LayoutRoute>} />
      <Route path="/cart" element={<LayoutRoute><Cart /></LayoutRoute>} />
      <Route path="/thanhtoan" element={<LayoutRoute><Thanhtoan /></LayoutRoute>} />
      <Route path="/tra-cuu" element={<LayoutRoute><TraCuuDonHang /></LayoutRoute>} />
      <Route path="/register" element={<Dangky />} />
      <Route path="/login" element={<Dangnhap setIsLoggedIn={setIsLoggedIn} />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/profile" element={<LayoutRoute><Profile setFullName={setFullName} setAvatarUrl={setAvatarUrl} /></LayoutRoute>} />
      <Route path="/change-password" element={<LayoutRoute><ChangePassword /></LayoutRoute>} />
    </Routes>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}
