import React, { useState, useEffect } from "react";
import axios from "axios";

function Thanhtoan() {
  const [cartItems, setCartItems] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) {
      setCartItems(JSON.parse(saved));
    }
  }, []);

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const validatePhone = (phone) => {
    const regex = /^0\d{9,10}$/; // 10-11 số, bắt đầu bằng 0
    return regex.test(phone);
  };

  const handleSubmit = async () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Vui lòng nhập họ tên!";
    if (!formData.address) newErrors.address = "Vui lòng nhập địa chỉ!";
    if (!formData.phone) newErrors.phone = "Vui lòng nhập số điện thoại!";
    else if (!validatePhone(formData.phone))
      newErrors.phone = "Số điện thoại không hợp lệ. Ví dụ: 0912345678";

    if (cartItems.length === 0) newErrors.cart = "Giỏ hàng trống!";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return; // có lỗi -> dừng

    try {
      setLoading(true);
      let orderRes;

      try {
        // Gọi API tạo Order lần đầu
        orderRes = await axios.post(
          "http://127.0.0.1:8000/api/Order/",
          {
            customer_name: formData.name,
            customer_address: formData.address,
            customer_phone: formData.phone,
            total_price: total,
            status: "pending",
            payment_method: "momo",
            items: cartItems.map(item => ({
              product: item.id,
              quantity: item.quantity,
              price: item.price
            }))
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`
            }
          }
        );
      } catch (err) {
        if (err.response?.status === 401) {
          try {
            const refreshRes = await axios.post(
              "http://127.0.0.1:8000/api/token/refresh/",
              { refresh: localStorage.getItem("refresh_token") }
            );
            localStorage.setItem("access_token", refreshRes.data.access);

            orderRes = await axios.post(
              "http://127.0.0.1:8000/api/Order/",
              {
                customer_name: formData.name,
                customer_address: formData.address,
                customer_phone: formData.phone,
                total_price: total,
                status: "pending",
                payment_method: "momo",
                items: cartItems.map(item => ({
                  product: item.id,
                  quantity: item.quantity,
                  price: item.price
                }))
              },
              {
                headers: {
                  Authorization: `Bearer ${refreshRes.data.access}`
                }
              }
            );
          } catch (refreshErr) {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            window.location.href = "/login";
            return;
          }
        } else {
          console.error("Lỗi khi tạo Order:", err);
          setErrors({ submit: "Không thể tạo đơn hàng!" });
          return;
        }
      }

      const order = orderRes.data;
      const orderId = order.id;

      const momoRes = await axios.post(
        `http://127.0.0.1:8000/momo/create/${orderId}/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`
          }
        }
      );

      if (momoRes.data?.payUrl) {
        window.location.href = momoRes.data.payUrl;
      } else {
        setErrors({ submit: "Không thể khởi tạo thanh toán MoMo!" });
      }

      localStorage.removeItem("cart");
      setCartItems([]);
      setFormData({ name: "", address: "", phone: "" });
      setErrors({});
    } catch (err) {
      console.error("❌ Lỗi khi thanh toán:", err.response?.data || err.message);
      setErrors({ submit: "Tạo thanh toán thất bại, vui lòng thử lại!" });
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    padding: "10px 12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    width: "100%",
    fontSize: "14px",
    outline: "none"
  };

  const errorStyle = {
    color: "red",
    fontSize: "12px",
    marginTop: "4px"
  };

  return (
    <div style={{ padding: "30px", maxWidth: "700px", margin: "0 auto", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ marginBottom: "20px", color: "#333" }}>Thông tin thanh toán</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginBottom: "30px" }}>
        <div>
          <input
            type="text"
            placeholder="Họ tên"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            style={inputStyle}
          />
          {errors.name && <div style={errorStyle}>{errors.name}</div>}
        </div>
        <div>
          <input
            type="text"
            placeholder="Địa chỉ"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            style={inputStyle}
          />
          {errors.address && <div style={errorStyle}>{errors.address}</div>}
        </div>
        <div>
          <input
            type="text"
            placeholder="Số điện thoại"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            style={inputStyle}
          />
          {errors.phone && <div style={errorStyle}>{errors.phone}</div>}
        </div>
      </div>

      <h3 style={{ marginBottom: "15px", color: "#333" }}>Giỏ hàng</h3>
      {cartItems.length === 0 ? (
        <p>Không có sản phẩm nào trong giỏ hàng.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
          <thead style={{ background: "#f5f5f5" }}>
            <tr>
              <th style={{ padding: "10px", borderBottom: "1px solid #ddd", textAlign: "left" }}>Sản phẩm</th>
              <th style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>Số lượng</th>
              <th style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>Giá</th>
              <th style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>Tổng</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item) => (
              <tr key={item.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "10px" }}>{item.name}</td>
                <td style={{ padding: "10px", textAlign: "center" }}>{item.quantity}</td>
                <td style={{ padding: "10px", textAlign: "right" }}>{item.price.toLocaleString()} VND</td>
                <td style={{ padding: "10px", textAlign: "right" }}>{(item.price * item.quantity).toLocaleString()} VND</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {errors.cart && <div style={errorStyle}>{errors.cart}</div>}

      <h3 style={{ textAlign: "right", marginBottom: "20px", color: "black" }}>
        Tổng cộng: {total.toLocaleString()} VND
      </h3>

      {errors.submit && <div style={{ ...errorStyle, textAlign: "center", marginBottom: "10px" }}>{errors.submit}</div>}

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          width: "100%",
          padding: "12px",
          background: loading ? "#aaa" : "#2196F3",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          fontSize: "16px",
          fontWeight: "bold",
          cursor: loading ? "not-allowed" : "pointer",
          transition: "background 0.3s"
        }}
      >
        {loading ? "Đang xử lý..." : "Thanh toán"}
      </button>
    </div>
  );
}

export default Thanhtoan;
