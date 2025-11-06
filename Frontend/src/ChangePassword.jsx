import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ChangePassword() {
  const [form, setForm] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
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

  const inputContainerStyle = { display: "flex", flexDirection: "column", marginBottom: "15px" };
  const inputStyle = { padding: "10px 12px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "14px", outline: "none", width: "100%", boxSizing: "border-box" };
  const buttonStyle = { width: '100%', padding: '12px', background: '#2196F3', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '15px' };
  const errorStyle = { color: 'red', fontSize: '0.85em', marginTop: '4px' };

  const validateForm = () => {
    const errors = {};
    const { old_password, new_password, confirm_password } = form;

    if (!old_password) errors.old_password = 'Vui lòng nhập mật khẩu cũ';
    if (!new_password) errors.new_password = 'Vui lòng nhập mật khẩu mới';
    if (new_password && (new_password.length < 6 || new_password.length > 18)) 
      errors.new_password = 'Mật khẩu mới phải từ 6 đến 18 ký tự';
    if (new_password !== confirm_password) errors.confirm_password = 'Xác nhận mật khẩu không trùng khớp';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setMessage('');
    try {
      const access = localStorage.getItem('access_token');
      if (!access) {
        setMessage('Bạn cần đăng nhập để đổi mật khẩu');
        setLoading(false);
        return;
      }

      await axios.post('http://127.0.0.1:8000/api/change-password/', {
        old_password: form.old_password,
        new_password: form.new_password
      }, {
        headers: { Authorization: `Bearer ${access}` }
      });

      setMessage('Đổi mật khẩu thành công!');
      setForm({ old_password: '', new_password: '', confirm_password: '' });
        navigate('/login');


    } catch (err) {
      if (err.response && err.response.status === 400) {
        setMessage('Mật khẩu cũ không đúng');
      } else {
        setMessage('Lỗi server. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={containerStyle}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>Đổi mật khẩu</h2>

      {[
        { key: 'old_password', placeholder: 'Mật khẩu cũ', type: 'password' },
        { key: 'new_password', placeholder: 'Mật khẩu mới', type: 'password' },
        { key: 'confirm_password', placeholder: 'Xác nhận mật khẩu', type: 'password' }
      ].map(({ key, placeholder, type }) => (
        <div key={key} style={inputContainerStyle}>
          <input
            type={type}
            placeholder={placeholder}
            value={form[key]}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            style={inputStyle}
          />
          {fieldErrors[key] && <div style={errorStyle}>{fieldErrors[key]}</div>}
        </div>
      ))}

      {message && <div style={{ color: message.includes('thành công') ? 'green' : 'red', marginBottom: '10px' }}>{message}</div>}

      <button type="submit" style={buttonStyle} disabled={loading}>
        {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
      </button>
       <div
            style={{
              color: "#2196F3",
              cursor: "pointer",
              fontSize: "0.9em",
              paddingTop: "10px",
            }}
            onClick={() => navigate("/profile")}
          >
            Quay lại
          </div>
    </form>
  );
}

export default ChangePassword;
