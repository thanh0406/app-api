import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

function CategoryDropdown() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
        console.log("Fetching from:", "http://localhost:8000/products"); // Log URL API
        const response = await axios.get("http://localhost:8000/products");
        console.log("Dữ liệu sản phẩm từ API:", response.data); // Log dữ liệu nhận được

        const filteredProducts =
            id === "all"
                ? response.data
                : response.data.filter((p) => p.category?._id === id || p.category === id);
        setProducts(filteredProducts);
    } catch (error) {
        setError("Không thể tải sản phẩm. Vui lòng thử lại sau!");
        console.error("Lỗi khi tải sản phẩm:", error);
    } finally {
        setLoading(false);
    }
}, [id]);


  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleBuyNow = (product) => {
    navigate(`/user/product-user/${product._id}`, { state: { product } });
  };

  return (
    <div className="container mt-5 mb-5">
      <h2
        className="text-center mb-5"
        style={{
          color: "#2c3e50",
          fontWeight: "700",
          fontSize: "2.5rem",
          fontFamily: "'Poppins', sans-serif",
        }}
      >{id === "all" ? "Tất Cả Sản Phẩm" : id}
      </h2>


      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p className="text-muted mt-2">Đang tải sản phẩm...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger text-center" role="alert">
          {error}
          <button
            className="btn btn-link p-0 ms-2"
            onClick={fetchProducts}
            style={{ textDecoration: "underline" }}
          >
            Thử lại
          </button>
        </div>
      ) : products.length > 0 ? (
        <div className="row g-4">
          {products.map((product) => (
            <div key={product._id} className="col-lg-3 col-md-4 col-sm-6">
              <div
                className="card shadow-sm h-100 border-0"
                style={{
                  borderRadius: "15px",
                  overflow: "hidden",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-10px)";
                  e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
                }}
              >
                <img
                  src={product.img}
                  className="card-img-top"
                  alt={product.name}
                  style={{
                    height: "200px",
                    objectFit: "cover",
                    transition: "transform 0.3s ease",
                  }}
                  onError={(e) => (e.target.src = "https://via.placeholder.com/200")}
                  onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
                  onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
                />
                <div className="card-body d-flex flex-column p-3">
                  <h5
                    className="card-title mb-2"
                    style={{
                      color: "#34495e",
                      fontWeight: "600",
                      fontSize: "1.1rem",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {product.name}
                  </h5>
                  <p className="card-text text-danger fw-bold mb-3">
                    {Number(product.price).toLocaleString("vi-VN")} VND
                  </p>
                  <button
                    className="btn btn-primary mt-auto"
                    onClick={() => handleBuyNow(product)}
                    style={{
                      borderRadius: "8px",
                      backgroundColor: "#3498db",
                      border: "none",
                      padding: "10px",
                      fontWeight: "500",
                      transition: "background-color 0.3s ease, transform 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#2980b9";
                      e.target.style.transform = "scale(1.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "#3498db";
                      e.target.style.transform = "scale(1)";
                    }}
                  >
                    Mua ngay
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5">
          <svg
            width="100"
            height="100"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#95a5a6"
            strokeWidth="2"
            className="mb-3"
          >
            <path d="M3 3h18v18H3z" />
            <path d="M9 9l6 6M15 9l-6 6" />
          </svg>
          <p className="text-muted" style={{ fontSize: "1.2rem" }}>
            Không có sản phẩm nào trong danh mục này.
          </p>
        </div>
      )}
    </div>
  );
}

export default CategoryDropdown;