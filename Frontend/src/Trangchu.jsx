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
          <h1>Chào mừng đến với Shop Len ABC</h1>
          <p>Chất lượng - Ấm áp - Sáng tạo</p>
        </div>
      </section>

      <section className="ads-box">
        <h2>🔥 Khuyến mãi đặc biệt tháng này 🔥</h2>
        <p>Mua 2 tặng 1 cho tất cả sản phẩm len cao cấp!</p>
      </section>

      <section className="section-container">
        <h2 className="section-title">Top sản phẩm bán chạy</h2>

        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <div className="product-grid">
            {topProducts.map(product => (
              <div key={product.id} className="product-card">
                <Link to={`/product/${product.id}`}>
                  <img src={product.image} alt={product.name} />
                </Link>
                <h3>{product.name}</h3>
                <p className="product-price">{Number(product.price).toLocaleString("vi-VN")} VND</p>
                <span className="product-sold">Đã bán: {product.sold}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="section-container category-container">
        <h2 className="section-title">Danh mục sản phẩm</h2>
        <div className="category-grid">
          {categories.filter(cat => !cat.parent).map(cat => (
            <div key={cat.id} className="category-card">
              <img src={cat.image || "/images/category-placeholder.jpg"} alt={cat.name} />
              <p>{cat.name}</p>
            </div>
          ))}
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
          <h3>📞 Hỗ trợ 24/7</h3>
          <p>Luôn đồng hành cùng khách hàng</p>
        </div>
      </section>



    </div>
  );
}

export default Home;
