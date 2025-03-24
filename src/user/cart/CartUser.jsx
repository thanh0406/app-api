import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

function CartUser() {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { userInfo, logout } = useAuth();

    const fetchCart = async () => {
        if (!userInfo?.userId) {
            setError("Vui lòng đăng nhập để xem giỏ hàng!");
            return;
        }
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8000/cart/${userInfo.userId}`, {
                headers: { Authorization: `Bearer ${userInfo.token}` },
            });
            const cartData = response.data?.items || [];
            console.log("Dữ liệu cart từ server:", response.data);
            setCartItems(cartData);
        } catch (err) {
            if (err.response?.status === 403) {
                setError("Phiên đăng nhập hết hạn hoặc bạn không có quyền truy cập. Vui lòng đăng nhập lại!");
                setTimeout(() => {
                    logout();
                    window.location.href = "/login";
                }, 2000);
            } else {
                setError("Không thể tải giỏ hàng: " + (err.response?.data?.message || err.message));
            }
            setCartItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, [userInfo]);

    const calculateItemTotal = (item) => {
        const toppingsPrice = item.toppings.reduce((sum, topping) => sum + topping.price, 0);
        return (item.price + toppingsPrice) * item.quantity;
    };

    const totalPrice = Array.isArray(cartItems)
        ? cartItems.reduce((total, item) => total + calculateItemTotal(item), 0)
        : 0;

    const updateQuantity = async (item, newQuantity) => {
        if (newQuantity < 0 || !userInfo?.userId) return;
        setLoading(true);
        try {
            await axios.put(
                `http://localhost:8000/cart/${userInfo.userId}`,
                {
                    productId: item.productId,
                    size: item.size,
                    toppings: item.toppings,
                    iceLevel: item.iceLevel, // Sửa từ ice thành iceLevel
                    sugarLevel: item.sugarLevel, // Sửa từ sugar thành sugarLevel
                    quantity: newQuantity,
                },
                { headers: { Authorization: `Bearer ${userInfo.token}` } }
            );
            setCartItems((prevItems) =>
                prevItems.map((cartItem) =>
                    cartItem.productId === item.productId &&
                    cartItem.size === item.size &&
                    JSON.stringify(cartItem.toppings) === JSON.stringify(item.toppings) &&
                    cartItem.iceLevel === item.iceLevel &&
                    cartItem.sugarLevel === item.sugarLevel
                        ? { ...cartItem, quantity: newQuantity }
                        : cartItem
                )
            );
        } catch (err) {
            setError("Không thể cập nhật số lượng: " + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const removeItem = async (item) => {
        if (!userInfo?.userId) return;
        setLoading(true);
        try {
            await axios.delete(`http://localhost:8000/cart/${userInfo.userId}/${item.productId}`, {
                headers: { Authorization: `Bearer ${userInfo.token}` },
                data: {
                    size: item.size,
                    toppings: item.toppings,
                    iceLevel: item.iceLevel, // Sửa từ ice thành iceLevel
                    sugarLevel: item.sugarLevel, // Sửa từ sugar thành sugarLevel
                },
            });
            setCartItems((prevItems) =>
                prevItems.filter(
                    (cartItem) =>
                        !(
                            cartItem.productId === item.productId &&
                            cartItem.size === item.size &&
                            JSON.stringify(cartItem.toppings) === JSON.stringify(item.toppings) &&
                            cartItem.iceLevel === item.iceLevel &&
                            cartItem.sugarLevel === item.sugarLevel
                        )
                )
            );
        } catch (err) {
            setError("Không thể xóa sản phẩm: " + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const getIceLabel = (iceValue) => {
        // Ánh xạ các giá trị hợp lệ
        const iceOptions = {
            khongda: "Không đá",
            itda: "Ít đá",
            binhthuong: "Bình thường",
            nhieuda: "Nhiều đá",
            "100%": "Bình thường", // Xử lý giá trị "100%" từ server
            "": "Không chọn", // Xử lý giá trị rỗng
        };
        return iceOptions[iceValue] || iceValue || "Không chọn"; // Mặc định nếu không có giá trị
    };

    const getSugarLabel = (sugarValue) => {
        // Xử lý giá trị sugarLevel, bỏ ký hiệu % nếu rỗng
        if (!sugarValue || sugarValue === "") return "Không chọn";
        return `${sugarValue.replace("%", "")}%`; // Loại bỏ ký hiệu % từ dữ liệu và thêm lại khi hiển thị
    };

    if (loading) return <p className="text-center">Đang tải giỏ hàng...</p>;
    if (error) return <p className="text-danger text-center">{error}</p>;

    return (
        <div className="container my-5">
            <h2 className="mb-4">🛒 Giỏ hàng của bạn</h2>
            {cartItems.length > 0 ? (
                <>
                    <ul className="list-group mb-4">
                        {cartItems.map((item, index) => (
                            <li
                                key={`${item.productId}-${index}`}
                                className="list-group-item d-flex align-items-start justify-content-between"
                            >
                                <div className="d-flex">
                                    <img
                                        src={item.img || "https://via.placeholder.com/50"}
                                        alt={item.name}
                                        width="50"
                                        className="me-3 rounded"
                                    />
                                    <div>
                                        <strong>{item.name}</strong>
                                        <p className="mb-1">Giá: {item.price.toLocaleString()} VND</p>
                                        <p className="mb-1">Size: {item.size}</p>
                                        <p className="mb-1">Đá: {getIceLabel(item.iceLevel)}</p>
                                        <p className="mb-1">Đường: {getSugarLabel(item.sugarLevel)}</p>
                                        {item.toppings.length > 0 && (
                                            <p className="mb-1">
                                                Topping:{" "}
                                                {item.toppings
                                                    .map((t) => `${t.name} (+${t.price.toLocaleString()} VND)`)
                                                    .join(", ")}
                                            </p>
                                        )}
                                        <p className="mb-0 text-danger">
                                            Tổng: {calculateItemTotal(item).toLocaleString()} VND
                                        </p>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center">
                                    <input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => updateQuantity(item, parseInt(e.target.value))}
                                        className="form-control mx-2"
                                        style={{ width: "60px" }}
                                        min="0"
                                        disabled={loading}
                                    />
                                    <button
                                        onClick={() => removeItem(item)}
                                        className="btn btn-danger"
                                        disabled={loading}
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <h4 className="text-danger">Tổng cộng: {totalPrice.toLocaleString()} VND</h4>
                </>
            ) : (
                <p className="text-muted text-center">🛍️ Giỏ hàng trống</p>
            )}
        </div>
    );
}

export default CartUser;