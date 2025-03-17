import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

function ProductUser() {
    const location = useLocation();
    const { product } = location.state || {};  // Lấy sản phẩm từ state

    const [cart, setCart] = useState([]); // Trạng thái giỏ hàng, có thể lưu vào localStorage hoặc Context nếu muốn lưu trữ toàn cục

    if (!product) {
        return <p>Không có dữ liệu sản phẩm</p>;
    }

    const addToCart = () => {
        // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
        const existingProduct = cart.find(item => item._id === product._id);
        if (existingProduct) {
            alert('Sản phẩm đã có trong giỏ hàng');
        } else {
            setCart([...cart, product]);
            alert('Sản phẩm đã được thêm vào giỏ hàng');
        }
    };

    return (
        <div className="container">
            <h2>{product.name}</h2>
            <img src={product.img} alt={product.name} />
            <p>{product.description}</p>
            <p className="text-danger">{product.price} VND</p>

            {/* Nút Thêm vào giỏ hàng */}
            <button className="btn btn-success" onClick={addToCart}>
                Thêm vào giỏ hàng
            </button>

            {/* Hiển thị giỏ hàng (Chỉ để kiểm tra, có thể bỏ qua nếu không cần) */}
            <div>
                <h4>Giỏ hàng:</h4>
                <ul>
                    {cart.map((item, index) => (
                        <li key={index}>
                            {item.name} - {item.price} VND
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default ProductUser;
