import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Cart() {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

    const updateQuantity = (id, delta) => {
      setCartItems(prev =>
        prev.map(item => {
          if (item.id === id) {
            const newQuantity = item.quantity + delta;
            if (newQuantity > item.stock) {
              alert(`Chỉ còn ${item.stock} sản phẩm trong kho!`);
              return { ...item, quantity: item.stock };
            }
            return { ...item, quantity: Math.max(1, newQuantity) };
          }
          return item;
        })
      );
    };


  const removeItem = id => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

 

  return (
 <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
  <h2 style={{ marginBottom: '20px' }}>Giỏ hàng</h2>

  {cartItems.length === 0 ? (
    <p>Giỏ hàng trống! Vào trang <Link style={{textDecoration:'none', color:'#4CAF50'}} to="/products">Sản phẩm</Link> mua hàng</p>
  ) : (
    <>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
        <thead style={{ background: '#f5f5f5' }}>
          <tr>
            <th style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>Sản phẩm</th>
            <th style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>Giá</th>
            <th style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>Số lượng</th>
            <th style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>Tổng</th>
            <th style={{ padding: '10px', borderBottom: '1px solid #ccc' }}></th>
          </tr>
        </thead>
        <tbody>
          {cartItems.map(item => (
            <tr key={item.id} style={{ borderBottom: '1px solid #eee', verticalAlign: 'middle' }}>
              <td style={{ padding: '10px' }}>{item.name}</td>
              <td style={{ padding: '10px' }}>{item.price.toLocaleString()} VND</td>
              <td style={{ padding: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                <button onClick={() => updateQuantity(item.id, -1)} style={{ padding: '4px 8px' }}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, 1)} style={{ padding: '4px 8px' }}>+</button>
              </td>
              <td style={{ padding: '10px' }}>{(item.price * item.quantity).toLocaleString()} VND</td>
              <td style={{ padding: '10px' }}>
                <button onClick={() => removeItem(item.id)} style={{ padding: '4px 8px', background: '#f44336', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: '20px', textAlign: 'right' }}>
        <h3>Tổng cộng: {total.toLocaleString()} VND</h3>
        <Link to="/thanhtoan">
          <button
            style={{
              marginTop: '10px',
              padding: '10px 20px',
              background: '#4CAF50',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Thanh toán
          </button>
        </Link>
      </div>
    </>
  )}
</div>

  );
}

export default Cart;