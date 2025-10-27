import React, { useState } from "react";
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

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("access_token"));
  const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem("avatar_url") || "");
  const [fullName, setFullName] = useState("");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("avatar_url");
    setIsLoggedIn(false);
    setAvatarUrl("");
    setFullName("");
  };

  const LayoutRoute = ({ children }) => (
    <Layout isLoggedIn={isLoggedIn} avatarUrl={avatarUrl} fullName={fullName} handleLogout={handleLogout}>
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
      <Route path="/register" element={<Dangky />}/>
      <Route path="/profile" element={<LayoutRoute><Profile setFullName={setFullName} setAvatarUrl={setAvatarUrl} /></LayoutRoute>}/>
      <Route path="/login" element={<Dangnhap setIsLoggedIn={setIsLoggedIn} goToForgotPassword={() => navigate("/forgot-password")} />} />
      <Route path="/forgot-password" element={<ForgotPassword goToReset={(email, otp) => navigate(`/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`)} goBack={() => navigate("/login")} />} />
      <Route path="/reset-password" element={<ResetPassword email={new URLSearchParams(window.location.search).get("email")} otp={new URLSearchParams(window.location.search).get("otp")} goBack={() => navigate("/login")} />} />
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
