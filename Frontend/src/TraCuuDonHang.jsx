import React, { useState } from 'react';
import axios from 'axios';

function TraCuuDonHang() {
  const [keyword, setKeyword] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!keyword) {
      alert("Vui lòng nhập số điện thoại hoặc email");
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/orders/search/', {
        params: { keyword }
      });
      setOrders(res.data);
    } catch (err) {
      console.error('Lỗi khi tra cứu đơn hàng:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  return (
<div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
  <h2 style={{ marginBottom: '20px' }}>Tra cứu đơn hàng</h2>

  <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
    <input
      type="text"
      placeholder="Nhập số điện thoại hoặc email"
      value={keyword}
      onChange={e => setKeyword(e.target.value)}
      style={{
        padding: '8px 12px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        flex: '1 1 250px',
      }}
    />
    <button
      onClick={handleSearch}
      style={{
        padding: '8px 16px',
        background: "#007bff",
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      Tra cứu
    </button>
  </div>

  {loading && <p>Đang tìm kiếm...</p>}

  {searched && !loading && orders.length === 0 && <p>Không có đơn hàng nào</p>}

  {orders.length > 0 && (
    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
      <thead style={{ background: '#f5f5f5' }}>
        <tr>
          <th style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>Mã đơn</th>
          <th style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>Trạng thái</th>
          <th style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>Ngày tạo</th>
          <th style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>Tổng tiền</th>
        </tr>
      </thead>
      <tbody>
        {orders.map(order => (
          <tr key={order.id} style={{ borderBottom: '1px solid #eee', transition: 'background 0.2s' }} 
              onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <td style={{ padding: '10px' }}>#{order.id}</td>
            <td style={{ padding: '10px' }}>{order.status_display}</td>
            <td style={{ padding: '10px' }}>{new Date(order.created_at).toLocaleString()}</td>
            <td style={{ padding: '10px' }}> <span>{Number(order.total_price).toLocaleString('vi-VN')} VND</span></td>
          </tr>               

        ))}
      </tbody>
    </table>
  )}
</div>

  );
}

export default TraCuuDonHang;