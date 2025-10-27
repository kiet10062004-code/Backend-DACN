import React from 'react';
import { Link } from 'react-router-dom';
import AvatarDefault from './assets/Avatar.jpg';

function Layout({ children, isLoggedIn, avatarUrl, fullName, handleLogout }) {
  return (
    <div style={{ width: '100%', minHeight: '100vh', overflowX: 'hidden' }}>
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
        <div>
          <Link to="/" style={{ marginRight: '15px', textDecoration: 'none', color: '#000' }}>
            Trang chủ
          </Link>
          <Link to="/products" style={{ marginRight: '15px', textDecoration: 'none', color: '#000' }}>
            Sản phẩm
          </Link>
          <Link to="/tra-cuu" style={{ marginRight: '15px', textDecoration: 'none', color: '#000' }}>
            Tra cứu
          </Link>
          <Link to="/cart" style={{ marginRight: '15px', textDecoration: 'none', color: '#000' }}>
            Giỏ hàng
          </Link>
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
              {/* Hiển thị Họ + Tên bên trái avatar */}
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
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '84px 20px 20px',
          boxSizing: 'border-box',
        }}
      >
        {children}
      </main>
    </div>
  );
}

export default Layout;
