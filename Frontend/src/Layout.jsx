import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AvatarDefault from './assets/Avatar.jpg';
import axios from "axios";
import { MdHome, MdStore, MdSearch, MdShoppingCart } from 'react-icons/md';

function Layout({ children, isLoggedIn, avatarUrl, fullName, handleLogout }) {

  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]); 

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearch(value);

    if (value.trim() === "") {
      setSuggestions([]);
      return;
    }

    try {
      const res = await axios.get(`http://localhost:8000/api/product/search/?q=${value}`);

      console.log("API trả về:", res.data);

      if (Array.isArray(res.data)) {
        setSuggestions(res.data);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.log("Search error:", error);
    }
  };


  return (
<div style={{ width: '100%', minHeight: '100vh',display: 'flex',flexDirection: 'column',  overflowX: 'hidden' }}>
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '64px',
          padding: '0 20px',
          background: '#eee',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxSizing: 'border-box',
          zIndex: 1000,
          borderBottom: '1px solid #ddd',
        }}
      >
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
      
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img
            src="/More_len.png"
            alt="Logo"
            style={{ height: "46px", width: "46px", borderRadius: "6px", objectFit: "cover" }}
          />
        </Link>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none', color: '#000' }}>
          <MdHome size={20} />
          Trang chủ
        </Link>

        <Link to="/products" style={{ display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none', color: '#000' }}>
          <MdStore size={20} />
          Sản phẩm
        </Link>

        <Link to="/tra-cuu" style={{ display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none', color: '#000' }}>
          <MdSearch size={20} />
          Tra cứu
        </Link>

        <Link to="/cart" style={{ display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none', color: '#000', marginLeft: 'auto' }}>
          <MdShoppingCart size={20} />
          Giỏ hàng
        </Link>

        <div className="search-container">
          <input
            type="text"
            placeholder="Tìm sản phẩm..."
            value={search}
            onChange={handleSearch}
            autoComplete="off"
          />

          {suggestions.length > 0 && (
            <div className="suggestions">
              {suggestions.map((item) => (
                <Link to={`/product/${item.id}`} key={item.id} className="suggestion-item">
                  <img src={`http://localhost:8000${item.image}`} alt={item.name} />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>


        <div>
          {!isLoggedIn ? (
            <>
              <Link to="/register" style={{ marginRight: '15px', textDecoration: 'none', color: '#000' }}>
                Đăng ký
              </Link>
              <Link to="/login" style={{ textDecoration: 'none', color: '#000' }}>
                Đăng nhập
              </Link>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

              {fullName && (
                <span style={{ fontWeight: 'bold', marginRight: '8px' }}>
                  {fullName}
                </span>
              )}

              <Link to="/profile" style={{ textDecoration: 'none', color: '#000' }}>
                <img
                  src={avatarUrl || AvatarDefault}
                  alt="avatar"
                  style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                />
              </Link>

              <button
                onClick={handleLogout}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  color: 'black',
                  background: '#fff',
                }}
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </nav>

      <main
        style={{
          flex :1,
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '84px 20px 20px',
          boxSizing: 'border-box',
        }}
      >
        {children}
      </main>
      <footer className="footer">
        <div className="footer-content">

          <div className="footer-col">
            <h3>Shop MoreLen</h3>
            <p>THÊM LEN - THÊM VUI</p>
            <div className="social-links">
            </div>
          </div>

          <div className="footer-col">
            <h4>Liên kết nhanh</h4>
            <ul>
              <li><a href="/">Trang chủ</a></li>
              <li><a href="/products">Sản phẩm</a></li>
              <li><a href="/about">Giới thiệu</a></li>
              <li><a href="/contact">Liên hệ</a></li>
            </ul>
          </div>

          {/* <div className="footer-col">
            <h4>Chính sách</h4>
            <ul>
              <li><a>Chính sách đổi trả</a></li>
              <li><a>Chính sách bảo hành</a></li>
              <li><a>Hướng dẫn mua hàng</a></li>
              <li><a>FAQ</a></li>
            </ul>
          </div> */}

          <div className="footer-col">
            <h4>Thanh toán</h4>
              <img src="/Logo-MoMo-Square.webp" style={{width:'40px', height:'40px',alignItems:'center',display:'flex',justifyContent:'center'}} />
          </div>

        </div>

        <div className="footer-bottom">
          © 2025 Shop Len ABC — All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default Layout;
