import React, { useEffect, useState } from "react";
import axios from 'axios';
import { Link } from "react-router-dom";

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeParent, setActiveParent] = useState(null);
  const [loading, setLoading] = useState(true);
    
  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/Category/')
      .then(res => {
        setCategories(res.data);
        const lenCategory = res.data.find(c => c.name.toLowerCase() === 'len');
        if (lenCategory) {
          setActiveParent(lenCategory.id);
          setSelectedCategory(lenCategory.id);
        }
      })
      .catch(err => console.error('Lỗi khi lấy danh mục', err));
  }, []);

  useEffect(() => {
    if (selectedCategory === null) return;
    setLoading(true);
    const url = `http://127.0.0.1:8000/api/Product/?category=${selectedCategory}&include_children=true`;
    axios.get(url)
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : res.data.results || [];
        setProducts(data);
      })
      .catch(err => console.error('Lỗi khi lấy sản phẩm', err))
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  const parentCategories = categories.filter(c => c.parent === null || c.parent === undefined);
  const childCategories = categories.filter(c => {
    if (typeof c.parent === 'object') {
      return c.parent?.id === activeParent;
    }
    return c.parent === activeParent;
  });

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existing = cart.find(item => item.id === product.id);
    const totalQuantity = existing ? existing.quantity + 1 : 1;

    if (totalQuantity > product.stock) {
      alert(`Chỉ còn ${product.stock} sản phẩm trong kho!`);
      return;
    }

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`Đã thêm "${product.name}" vào giỏ hàng!`);
  };

  const ProductSkeleton = () => (
    <li style={{
      border: '1px solid #eee',
      padding: '12px',
      borderRadius: '8px',
      background: '#fff',
      animation: 'pulse 1.5s infinite ease-in-out'
    }}>
      <div style={{ background: '#e5e7eb', height: '160px', borderRadius: '6px', marginBottom: '10px' }} />
      <div style={{ background: '#e5e7eb', height: '16px', width: '80%', borderRadius: '4px', marginBottom: '8px' }} />
      <div style={{ background: '#e5e7eb', height: '16px', width: '60%', borderRadius: '4px' }} />
    </li>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: '220px', padding: '5px', borderRight: '1px solid #ddd' }}>
        <div>
          <h3 style={{background: '#DEC6C6', height:'30px',alignItems:"center",alignContent: "center", display: "flex", justifyContent:"center"}}>Danh mục sản phẩm</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {parentCategories.map(category => (
              <li key={category.id}>
                <button
                  onClick={() => {
                    setActiveParent(category.id);
                    setSelectedCategory(category.id);
                  }}
                  style={{
                    background: activeParent === category.id ? '#e6f0ff' : 'transparent',
                    border: 'none',
                    padding: '10px',
                    cursor: 'pointer',
                    width: '100%',
                    fontWeight: activeParent === category.id ? 'bold' : 'normal',
                    borderRadius: '4px',
                    textAlign: 'left'
                  }}
                >
                  {category.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main style={{ flex: 1, padding: '30px' }}>
        {childCategories.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {childCategories.map(sub => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedCategory(sub.id)}
                  style={{
                    padding: '8px 16px',
                    background: selectedCategory === sub.id ? '#4a90e2' : '#f0f0f0',
                    color: selectedCategory === sub.id ? '#fff' : '#333',
                    border: '1px solid #ccc',
                    borderRadius: '20px',
                    cursor: 'pointer'
                  }}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <ul style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '24px',
          listStyle: 'none',
          padding: 0
        }}>
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
          ) : products.length === 0 ? (
            <p>Không có sản phẩm nào.</p>
          ) : (
            products.map(product => (
              <li key={product.id} style={{
                border: '1px solid #ddd',
                padding: '12px',
                borderRadius: '8px',
                background: '#fff',
                boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
              }}>
                <Link to={`/product/${product.id}`}>
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{
                      width: '100%',
                      height: '190px',
                      objectFit: 'cover',
                      borderRadius: '6px',
                      marginBottom: '10px'
                    }}
                  />
                </Link>
                <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>{product.name}</h3>
                </Link>
                <p>Còn <span>{product.stock}</span> sản phẩm<br></br></p>
                <p style={{ fontWeight: 'bold', color: '#d0021b' }}>
                  <span>{Number(product.price).toLocaleString('vi-VN')} VND</span>
                </p>

                <button
                  onClick={() => addToCart(product)}
                  style={{
                    marginTop: '10px',
                    padding: '8px 12px',
                    background: 'grey',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  Thêm vào giỏ hàng
                </button>
              </li>
            ))
          )}
        </ul>
      </main>

      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.4; }
            100% { opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}

export default Products;
