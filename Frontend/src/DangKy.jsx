import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Dangky() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    phone: '',
    first_name: '',
    last_name: '',
    password: ''
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ================== CSS ==================
  const containerStyle = {
    maxWidth: '400px',
    margin: '50px auto',
    padding: '30px',
    border: '1px solid #eee',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    fontFamily: 'Arial, sans-serif'
  };

  const inputContainerStyle = { 
    display: "flex", 
    flexDirection: "column", 
    marginBottom: "15px",
    position: "relative"
  };

  const inputStyle = {
    padding: "10px 12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "14px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    transition: "border 0.2s, background-color 0.2s"
  };

  const inputFocusStyle = {
    border: "1px solid #2196F3",
    backgroundColor: "#f0f8ff"
  };

  const errorStyle = {
    color: "red",
    fontSize: "0.85em",
    marginTop: "4px"
  };

  const buttonStyle = {
    width: '100%',
    padding: '12px',
    background: '#2196F3',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: loading ? 'not-allowed' : 'pointer',
    marginTop: '15px',
    transition: 'background 0.3s'
  };
  // =========================================

  // validate cơ bản
  const validateForm = () => {
    const { username, email, phone, first_name, last_name, password } = form;
    const errors = {};

    if (!username) errors.username = 'Vui lòng nhập Tên đăng nhập!';
    if (!email) errors.email = 'Vui lòng nhập Email!';
    if (!phone) errors.phone = 'Vui lòng nhập Số điện thoại!';
    if (!first_name) errors.first_name = 'Vui lòng nhập Tên!';
    if (!last_name) errors.last_name = 'Vui lòng nhập Họ!';
    if (!password) errors.password = 'Vui lòng nhập Mật khẩu!';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) errors.email = 'Email không hợp lệ';

    const phoneRegex = /^[0-9]{9,11}$/;
    if (phone && !phoneRegex.test(phone)) errors.phone = 'Số điện thoại không hợp lệ';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const checkExists = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/check-user/', {
        params: {
          username: form.username,
          email: form.email,
          phone: form.phone
        }
      });
      return res.data; // { username: true/false, email: true/false, phone: true/false }
    } catch (err) {
      console.error('Lỗi kiểm tra tồn tại:', err);
      return {};
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    // kiểm tra trùng
    const exists = await checkExists();
    const errors = {};
    if (exists.username) errors.username = 'Username đã tồn tại';
    if (exists.email) errors.email = 'Email đã tồn tại';
    if (exists.phone) errors.phone = 'Số điện thoại đã tồn tại';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    // submit form
    try {
      await axios.post('http://127.0.0.1:8000/register/', form);
      navigate('/login');
    } catch (err) {
      console.error('Lỗi server:', err);
      alert('Đăng ký thất bại, vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={containerStyle}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>Đăng ký</h2>

      {[
        { key: 'username', placeholder: 'Tên đăng nhập' },
        { key: 'email', placeholder: 'Email' },
        { key: 'phone', placeholder: 'Số điện thoại' },
        { key: 'last_name', placeholder: 'Họ' },
        { key: 'first_name', placeholder: 'Tên' },
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
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#45a049")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#2196F3")}
      >
        {loading ? 'Đang xử lý...' : 'Đăng ký'}
      </button>
    </form>
  );
}

export default Dangky;
