import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Home() {
  const [products, setProducts] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/Category/")
      .then(res => setCategories(res.data))
      .catch(err => console.error(err));

    axios.get("http://127.0.0.1:8000/api/Product/?include_children=true")
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : res.data.results || [];
        setProducts(data);
        setTopProducts([...data].sort((a, b) => b.sold - a.sold).slice(0, 8));
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home-container">

      <section className="banner">
      <img src="http://localhost:8000/media/products/image 37.png" alt="Banner" />

        <div className="banner-text">
          <h1>Chào mừng đến với MoreLen</h1>
          <p>THÊM LEN - THÊM VUI</p>
        </div>
      </section>
      <section className="image-gallery">
        <img src="/image 37.png" alt="Ảnh 1" />
        <img src="/image 32.png" alt="Ảnh 3" />
      </section>
      <section className="image-quangcao">
        <img src="/image 35.png" alt="Ảnh 1" />
      </section>

      <section className="section-container best-product-container">
        <h2 className="section-title">Top sản phẩm bán chạy</h2>

        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <>
            <div className="product-grid">
              {topProducts.map(product => (
                <div key={product.id} className="product-card">
                  <Link to={`/product/${product.id}`}>
                    <img src={product.image} alt={product.name} />
                  </Link>
                  <h3>{product.name}</h3>
                  <p className="product-price">{Number(product.price).toLocaleString("vi-VN")} VND</p>
                </div>
              ))}
            </div>

        <div style={{ textAlign: "center", marginTop: "25px" }}>
          <Link
            to="/products"
            style={{
              display: "inline-block",
              padding: "12px 28px",
              background: "#5dd1f7ff",
              color: "white",
              fontWeight: "600",
              borderRadius: "30px",
              textDecoration: "none",
              transition: "0.3s",
            }}
          >
            Xem thêm sản phẩm
          </Link>
        </div>
      </>
    )}
  </section>

      <div className="banner-container">
        <img src="/image 29.png" alt="Quảng cáo" className="banner-img" />
      </div>

      <section className="section-container category-container full-width">
        <h2 className="section-title">Danh mục sản phẩm</h2>

        <div className="category-grid">

          <div className="category-card">
            <img src="/handmade.jpg" alt="Handmade" />
            <p>Sản phẩm thủ công</p>
          </div>

          <div className="category-card">
            <img src="/len.jpg" alt="Len" />
            <p>Len</p>
          </div>

          <div className="category-card">
            <img src="/kimmoc.jpg" alt="Kim móc" />
            <p>Kim móc</p>
          </div>

        </div>
      </section>


      <section className="commit-section">
        <div>
          <h3>✅ Chất lượng</h3>
          <p>Nguyên liệu tự nhiên cao cấp</p>
        </div>
        <div>
          <h3>🚚 Giao hàng nhanh</h3>
          <p>Giao trong 48h toàn quốc</p>
        </div>
        <div>
          <h3>💳 Giá cả hợp lý</h3>
          <p>Vừa túi tiền khách hàng</p>
        </div>
      </section>

    </div>
  );
}
export default Home;
