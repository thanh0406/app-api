import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function CategoryDropdown() {
    const { id } = useParams();
    const navigate = useNavigate(); 
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get("http://localhost:5000/products");
                const filteredProducts = id === "all" ? response.data : response.data.filter((p) => p.category.toString() === id);
                setProducts(filteredProducts);
            } catch (error) {
                setError("Lỗi khi tải sản phẩm!");
                console.error("Lỗi:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [id]);

    const handleBuyNow = (product) => {
        navigate(`/user/product-user/${product._id}`, { state: { product } });
    };

    return (
        <div className="container mt-4">
            <h2 className="text-center">Danh mục</h2>
            {loading ? (
                <p className="text-center">Đang tải...</p>
            ) : error ? (
                <p className="text-danger text-center">{error}</p>
            ) : products.length > 0 ? (
                <div className="row">
                    {products.map((product) => (
                        <div key={product._id} className="col-lg-3 col-md-4 col-sm-6 mb-4">
                            <div className="card shadow-sm">
                                <img src={product.img} className="card-img-top" alt={product.name} />
                                <div className="card-body">
                                    <h5 className="card-title">{product.name}</h5>
                                    <p className="card-text text-danger fw-bold">{product.price} VND</p>
                                    <button className="btn btn-primary" onClick={() => handleBuyNow(product)}>Mua ngay</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center">Không có sản phẩm nào.</p>
            )}
        </div>
    );
}

export default CategoryDropdown;
