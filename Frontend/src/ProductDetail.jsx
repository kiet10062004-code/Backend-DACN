import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom"; // thêm Link để click vào sản phẩm liên quan
import axios from "axios";

export default function ProductDetail() {
  const { id } = useParams(); // id sản phẩm từ URL
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Lấy thông tin sản phẩm
  useEffect(() => {
    axios.get(`http://127.0.0.1:8000/api/Product/${id}/`)
      .then(res => setProduct(res.data))
      .catch(err => console.error("Lỗi khi lấy sản phẩm", err));
  }, [id]);

  // Lấy sản phẩm liên quan cùng danh mục
  useEffect(() => {
    if (!product) return;
    axios.get(`http://127.0.0.1:8000/api/Product/?category=${product.category.id}`)
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : res.data.results || [];
        // Loại bỏ sản phẩm hiện tại khỏi danh sách liên quan
        const related = data.filter(p => p.id !== product.id);
        setRelatedProducts(related);
      })
      .catch(err => console.error("Lỗi khi lấy sản phẩm liên quan", err));
  }, [product]);

    const addToCart = () => {
      if (!product) return;
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      const existing = cart.find(item => item.id === product.id);
      const totalQuantity = existing ? existing.quantity + quantity : quantity;

      if (totalQuantity > product.stock) {
        alert(`Chỉ còn ${product.stock} sản phẩm trong kho!`);
        return;
      }

      if (existing) {
        existing.quantity += quantity;
      } else {
        cart.push({ ...product, quantity });
      }
      localStorage.setItem("cart", JSON.stringify(cart));
      alert(`Đã thêm ${quantity} "${product.name}" vào giỏ hàng!`);
    };


  if (!product) return <p>Đang tải sản phẩm...</p>;

  return (
    <div style={{ padding: "30px" }}>
      <div style={{ display: "flex", gap: "40px" }}>
        <img
          src={product.image}
          alt={product.name}
          style={{ width: "400px", height: "400px", objectFit: "cover", borderRadius: "8px" }}
        />
        <div style={{ maxWidth: "600px" }}>
          <h1>{product.name}</h1>
          <p style={{ fontWeight: "bold", color: "#d0021b", fontSize: "1.2rem" }}>
              <span>{Number(product.price).toLocaleString('vi-VN')} VND</span>
          </p>
          <p>{product.description}</p>

            {/* Chỉnh số lượng */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: "#eee",
                cursor: "pointer",
                fontSize: "18px"
              }}
            >
              −
            </button>

            <input
              type="number"
              min="1"
              max={product.stock} // ✅ Giới hạn theo tồn kho
              value={quantity}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val >= 1 && val <= product.stock) {
                  setQuantity(val);
                } else if (val > product.stock) {
                  setQuantity(product.stock);
                } else {
                  setQuantity(1);
                }
              }}
              style={{
                width: "50px",
                textAlign: "center",
                fontSize: "16px",
                padding: "6px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                alignItems: "center",
                display: "flex",
                justifyContent: "center"
              }}
            />

            <button
              onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: "#eee",
                cursor: "pointer",
                fontSize: "18px"
              }}
            >
              +
            </button>
          </div>

          <button
            onClick={addToCart}
            style={{
              padding: "10px 16px",
              background: "grey",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              marginTop: "20px"
            }}
          >
            Thêm vào giỏ hàng
          </button>
        </div>
      </div>

      {/* Sản phẩm liên quan */}
      {relatedProducts.length > 0 && (
        <div style={{ marginTop: "50px" }}>
          <h2>Sản phẩm liên quan</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: "20px", marginTop: "20px" }}>
            {relatedProducts.map(p => (
              <div key={p.id} style={{ border: "1px solid black", padding: "10px", borderRadius: "6px", textAlign: "center",backgroundColor:'white' }}>
                <Link to={`/product/${p.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <img src={p.image} alt={p.name} style={{ width: "100%", height: "140px", objectFit: "cover", borderRadius: "4px" }} />
                  <h4 style={{ fontSize: "0.9rem", margin: "10px 0 5px 0" ,textDecoration : "none" }}>{p.name}</h4>
                </Link>
                <p style={{ color: "#d0021b", fontWeight: "bold" }}><span>{Number(product.price).toLocaleString('vi-VN')} VND</span></p>
                <button
                      onClick={() => {
                        const cart = JSON.parse(localStorage.getItem("cart")) || [];
                        const existing = cart.find(item => item.id === p.id);
                        const totalQuantity = existing ? existing.quantity + 1 : 1;

                        if (totalQuantity > p.stock) {
                          alert(`Chỉ còn ${p.stock} sản phẩm trong kho!`);
                          return;
                        }

                        if (existing) existing.quantity += 1;
                        else cart.push({ ...p, quantity: 1 });

                        localStorage.setItem("cart", JSON.stringify(cart));
                        alert(`Đã thêm "${p.name}" vào giỏ hàng!`);
                      }}

                  style={{ padding: "6px 10px", background: "grey", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
                >
                  Thêm vào giỏ
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
