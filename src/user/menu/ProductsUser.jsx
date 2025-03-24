import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";

function ProductUser() {
  const location = useLocation();
  const { product } = location.state || {};
  const { userInfo } = useAuth();
  const [cart, setCart] = useState([]);
  const [categoriesTopping, setCategoriesTopping] = useState([]);
  const [toppings, setToppings] = useState([]);
  const [categories, setCategories] = useState([]); // Thêm state cho danh mục sản phẩm
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [size, setSize] = useState("L");
  const [ice, setIce] = useState("binhthuong");
  const [sugar, setSugar] = useState(100);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [categoryRes, toppingRes, productCategoryRes] = await Promise.all([
          axios.get("http://localhost:8000/category-topping"),
          axios.get("http://localhost:8000/topping"),
          axios.get("http://localhost:8000/category"), // Lấy danh mục sản phẩm
        ]);
        console.log("CategoriesTopping từ API:", categoryRes.data);
        console.log("Toppings từ API:", toppingRes.data);
        console.log("Categories (danh mục sản phẩm) từ API:", productCategoryRes.data);
        setCategoriesTopping(categoryRes.data);
        setToppings(toppingRes.data);
        setCategories(productCategoryRes.data);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleToppingChange = (topping) => {
    setSelectedToppings((prev) =>
      prev.some((t) => t._id === topping._id)
        ? prev.filter((t) => t._id !== topping._id)
        : [...prev, topping]
    );
  };

  const handleAddToCart = async () => {
    if (!userInfo?.userId || !product) return;

    const productData = {
      productId: product._id,
      name: product.name,
      price: product.price,
      img: product.img,
      quantity: 1,
      size,
      ice,
      sugar,
      toppings: selectedToppings.map((t) => ({
        toppingId: t._id,
        name: t.nameTopping,
        price: t.priceTopping,
      })),
    };

    try {
      await axios.post(
        `http://localhost:8000/cart/${userInfo.userId}`,
        productData,
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      setCart((prevCart) => [...prevCart, productData]);
      setSelectedToppings([]);
      setSize("L");
      setIce("binhthuong");
      setSugar(100);
      setSuccessMessage("Thêm vào giỏ hàng thành công!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
    }
  };

  if (!product)
    return <p className="text-danger text-center mt-5">Không tìm thấy sản phẩm!</p>;
  if (loading) return <p className="text-center mt-5">Đang tải...</p>;

  // Tìm danh mục của sản phẩm dựa trên product.category (codeId)
  const productCategory = categories.find((cat) => cat.codeId === product.category);
  const productCategoryName = productCategory ? productCategory.name : null;

  // Lọc danh mục topping dựa trên tên danh mục của sản phẩm
  const filteredCategoriesTopping = productCategoryName
    ? categoriesTopping.filter(
        (cat) => cat.nameCategoryTopping.toLowerCase() === productCategoryName.toLowerCase()
      )
    : [];

  return (
    <div className="container my-5">
      <div className="row g-4 align-items-start">
        {/* Hình ảnh sản phẩm */}
        <div className="col-md-4 col-12 text-center">
          <img
            src={product.img || "https://via.placeholder.com/300"}
            alt={product.name}
            className="img-fluid rounded"
            style={{ maxHeight: "250px", objectFit: "cover" }}
          />
        </div>

        {/* Thông tin sản phẩm và tùy chọn */}
        <div className="col-md-8 col-12">
          <h2 className="mb-2 fw-bold">{product.name}</h2>
          <p className="text-danger fw-bold fs-4 mb-4">
            {Number(product.price).toLocaleString("vi-VN")} VND
          </p>

          {/* Chọn Topping */}
          <div className="mb-4">
            <h5 className="fw-semibold">Chọn Topping</h5>
            {filteredCategoriesTopping.length > 0 ? (
              filteredCategoriesTopping.map((category) => (
                <div key={category._id} className="mb-3">
                  <h6 className="fw-semibold text-muted">{category.nameCategoryTopping}</h6>
                  <div className="row">
                    {toppings
                      .filter((t) => t.categoryToppingId?._id === category._id)
                      .map((topping) => (
                        <div key={topping._id} className="col-6">
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id={`topping-${topping._id}`}
                              checked={selectedToppings.some((t) => t._id === topping._id)}
                              onChange={() => handleToppingChange(topping)}
                            />
                            <label
                              className="form-check-label"
                              htmlFor={`topping-${topping._id}`}
                            >
                              {topping.nameTopping} (+
                              {Number(topping.priceTopping).toLocaleString("vi-VN")} VND)
                            </label>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted">Không có topping nào cho danh mục này.</p>
            )}
          </div>

          {/* Chọn Size */}
          <div className="mb-4">
            <h5 className="fw-semibold">Chọn Size</h5>
            <div className="btn-group" role="group">
              {["L", "XL"].map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`btn ${size === option ? "btn-primary" : "btn-outline-primary"} me-2`}
                  onClick={() => setSize(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Chọn Đá */}
          <div className="mb-4">
            <h5 className="fw-semibold">Chọn Đá</h5>
            <div className="btn-group flex-wrap" role="group">
              {[
                { value: "khongda", label: "Không đá" },
                { value: "itda", label: "Ít đá" },
                { value: "binhthuong", label: "Bình thường" },
                { value: "nhieuda", label: "Nhiều đá" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`btn ${ice === option.value ? "btn-primary" : "btn-outline-primary"} me-2 mb-2`}
                  onClick={() => setIce(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chọn Đường */}
          <div className="mb-4">
            <h5 className="fw-semibold">Chọn Đường</h5>
            <div className="btn-group flex-wrap" role="group">
              {[0, 30, 50, 70, 100].map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`btn ${sugar === value ? "btn-primary" : "btn-outline-primary"} me-2 mb-2`}
                  onClick={() => setSugar(value)}
                >
                  {value}%
                </button>
              ))}
            </div>
          </div>

          {/* Nút Thêm vào giỏ hàng */}
          <button
            className="btn btn-success w-100 py-2 fw-semibold"
            onClick={handleAddToCart}
          >
            🛒 Thêm vào giỏ hàng
          </button>

          {/* Thông báo thành công */}
          {successMessage && (
            <div className="alert alert-success mt-3 text-center" role="alert">
              {successMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductUser;