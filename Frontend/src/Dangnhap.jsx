import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Dangnhap({ setIsLoggedIn, goToForgotPassword }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const containerStyle = {
    maxWidth: '400px',
    margin: '50px auto',
    padding: '30px',
    border: '1px solid #eee',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#fff'
  };
  const inputContainerStyle = { display: "flex", flexDirection: "column", marginBottom: "15px", position: "relative" };
  const inputStyle = { padding: "10px 12px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "14px", outline: "none", width: "100%", boxSizing: "border-box", transition: "border 0.2s, background-color 0.2s" };
  const inputFocusStyle = { border: "1px solid #2196F3", backgroundColor: "#f0f8ff" };
  const errorStyle = { color: "red", fontSize: "0.85em", marginTop: "4px" };
  const buttonStyle = { width: '100%', padding: '12px', background: '#2196F3', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '15px', transition: 'background 0.3s' };
  const forgotStyle = { marginTop: '10px', textAlign: 'right', color: '#2196F3', cursor: 'pointer', fontSize: '0.9em' };

  const validateForm = () => {
    const errors = {};
    if (!form.username) errors.username = 'Vui lòng nhập tên đăng nhập hoặc email';
    if (!form.password) errors.password = 'Vui lòng nhập mật khẩu';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  setLoading(true);
  setFieldErrors({});
  try {
    const payload = {
      username: form.username,
      password: form.password
    };
    const res = await axios.post('http://127.0.0.1:8000/api/token/', payload);

    const access = res.data.access;
    const refresh = res.data.refresh;

    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);

    const userRes = await axios.get('http://127.0.0.1:8000/api/user/', {
      headers: { Authorization: `Bearer ${access}` }
    });

    const user = userRes.data;
    setIsLoggedIn(true);

    if (user.is_superuser) {
      window.location.href = 'http://127.0.0.1:8000/dashboard/';
    } else {
      navigate('/'); 
    }

  } catch (err) {
    if (err.response) {
      if (err.response.status === 401 || err.response.status === 400) {
        setFieldErrors({ password: 'Tên đăng nhập hoặc mật khẩu không đúng' });
      } else {
        setFieldErrors({ password: `Lỗi từ server: ${err.response.status}` });
      }
    } else if (err.request) {
      setFieldErrors({ username: 'Không thể kết nối tới server. Vui lòng thử lại sau.' });
    } else {
      setFieldErrors({ username: 'Có lỗi xảy ra. Vui lòng thử lại.' });
    }
  } finally {
    setLoading(false);
  }
};


  return (
    <form onSubmit={handleSubmit} style={containerStyle}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>Đăng nhập</h2>

      {[
        { key: 'username', placeholder: 'Tên đăng nhập hoặc email' },
        { key: 'password', placeholder: 'Mật khẩu', type: 'password' }
      ].map(({ key, placeholder, type }) => (
        <div key={key} style={inputContainerStyle}>
          <input
            type={type || 'text'}
            placeholder={placeholder}
            value={form[key]}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            style={inputStyle}
            onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
            onBlur={(e) => Object.assign(e.target.style, inputStyle)}
          />
          {fieldErrors[key] && <div style={errorStyle}>{fieldErrors[key]}</div>}
        </div>
      ))}

      <button type="submit" style={buttonStyle} disabled={loading}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#4A1C48")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#2196F3")}
      >
        {loading ? 'Đang xử lý...' : 'Đăng nhập'}
      </button>

      <div style={forgotStyle} onClick={goToForgotPassword}>Quên mật khẩu?</div>
        <div style={{ color: '#2196F3', cursor: 'pointer', fontSize: '0.9em' ,paddingTop:"10px"}} onClick={() => navigate("/register")}>Đăng ký tài khoản</div>
  

    </form>
  );
}

export default Dangnhap;
