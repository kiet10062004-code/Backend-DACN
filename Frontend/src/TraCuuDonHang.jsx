import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DELIVERY_CHOICES = {
  not_delivered: "Chưa giao",
  delivering: "Đang giao",
  delivered: "Đã giao",
};

function TraCuuDonHang() {
  const [keyword, setKeyword] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null); 
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('darkMode') === 'true';
    setDarkMode(saved);
  }, []);

  useEffect(() => {
    if (darkMode) document.body.classList.add('dark-mode');
    else document.body.classList.remove('dark-mode');
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

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
      <h2>Tra cứu đơn hàng</h2>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Nhập số điện thoại hoặc email"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc', flex: '1 1 250px' }}
        />
        <button
          onClick={handleSearch}
          style={{ padding: '8px 16px', background: "#79b4cdff", color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Tra cứu
        </button>
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{ padding: '8px 16px', background: darkMode ? "#333" : "#eee", color: darkMode ? "#fff" : "#333", border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </div>

      {loading && <p>Đang tìm kiếm...</p>}
      {searched && !loading && orders.length === 0 && <p>Không có đơn hàng nào</p>}

      {orders.length > 0 && (
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          textAlign: 'center',
          marginBottom: '20px',
          color: darkMode ? '#eee' : '#000',
          background: darkMode ? '#1e1f24' : '#fff',
        }}>
          <thead style={{ background: darkMode ? '#2c2e35' : '#f5f5f5' }}>
            <tr>
              <th style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>Mã đơn</th>
              <th style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>Tên người đặt</th>
              <th style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>Địa chỉ</th>
              <th style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>SĐT</th>
              <th style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>Thanh toán</th>
              <th style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>Ngày đặt</th>
              <th style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>Tổng tiền</th>
              <th style={{ padding: '10px', borderBottom: '1px solid #ccc' }}></th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr
                key={order.id}
                style={{ borderBottom: '1px solid #eee', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = darkMode ? '#2a2c33' : '#fafafa'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '10px' }}>{order.id}</td>
                <td style={{ padding: '10px' }}>{order.customer_name}</td>
                <td style={{ padding: '10px' }}>{order.customer_address}</td>
                <td style={{ padding: '10px' }}>{order.customer_phone}</td>
                <td style={{ padding: '10px' }}>{order.status_display}</td>
                <td style={{ padding: '10px' }}>{new Date(order.created_at).toLocaleString()}</td>
                <td style={{ padding: '10px' }}>{Number(order.total_price).toLocaleString('vi-VN')} VND</td>
                <td style={{ padding: '10px' }}>
                  <button
                    onClick={() => setSelectedOrder(order)}
                    style={{ padding: '6px 12px', background: '#bbaadfff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Xem chi tiết
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedOrder && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: darkMode ? '#2c2e35' : '#fff',
            color: darkMode ? '#eee' : '#000',
            padding: '20px', borderRadius: '8px',
            width: '90%', maxWidth: '600px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }}>
            <h3>Chi tiết đơn hàng {selectedOrder.id}</h3>
            <hr />
            <p><b>Trạng thái:</b> {DELIVERY_CHOICES[selectedOrder.delivery_status]}</p>
            <p><b>Shipper:</b> {selectedOrder.shipper_name || 'Chưa có'}</p>
            <p><b>SĐT Shipper:</b> {selectedOrder.shipper_phone || 'Chưa có'}</p>
            <p><b>Thời gian giao:</b> {selectedOrder.delivery_start ? new Date(selectedOrder.delivery_start).toLocaleString() : 'Chưa có'}</p>
            <p><b>Thời gian dự kiến giao xong:</b> {selectedOrder.delivery_end ? new Date(selectedOrder.delivery_end).toLocaleString() : 'Chưa có'}</p>

            <h4>Sản phẩm:</h4>
            <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
              {selectedOrder.order_details && selectedOrder.order_details.length > 0 ? (
                selectedOrder.order_details.map((item, idx) => (
                  <li key={idx}>
                    {item.product?.name || 'Sản phẩm'} - SL: {item.quantity} - {Number(item.total_price).toLocaleString('vi-VN')} VND
                  </li>
                ))
              ) : (
                <li>Không có sản phẩm</li>
              )}
            </ul>


            <p><b>Tổng tiền:</b> {Number(selectedOrder.total_price).toLocaleString('vi-VN')} VND</p>

            <button
              onClick={() => setSelectedOrder(null)}
              style={{ marginTop: '20px', padding: '8px 16px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      <style>{`
        body.dark-mode {
          background: #181a1e;
          color: #eee;
        }
        body.dark-mode input, body.dark-mode select, body.dark-mode button {
          color: #eee;
          background: #2c2e35;
          border: 1px solid #444;
        }
      `}</style>
    </div>
  );
}

export default TraCuuDonHang;
