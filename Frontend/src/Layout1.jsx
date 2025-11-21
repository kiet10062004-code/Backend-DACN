import React from 'react';
import { Link } from 'react-router-dom';

function Layout1({ children }) {
  return (
    <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

      <div style={{ margin: '20px 0' }}>
        <Link to="/">
          <img
            src="/More_len.png"
            alt="Logo MoreLen"
            style={{
              width: '120px',   
              height: '120px',
              objectFit: 'cover',
              borderRadius: '12px',
            }}
          />
        </Link>
      </div>

      <main style={{ width: '100%', flex: 1 }}>
        {children}
      </main>
      
    </div>
  );
}

export default Layout1;
