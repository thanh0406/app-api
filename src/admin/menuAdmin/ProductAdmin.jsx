import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-image-crop/dist/ReactCrop.css";
import { toast } from "react-toastify";

const ProductAdmin = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    img: "",
    categoryId: "",
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCodeId, setSelectedCodeId] = useState("");
  const token = localStorage.getItem("token");

  const fetchData = useCallback(async () => {
    console.log("Token:", token);
    if (!token) {
      toast.error("Vui lòng đăng nhập để tiếp tục!");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Tách biệt các request để tránh lỗi lan truyền
      let productsRes, categoriesRes;

      // Gọi API /category
      try {
        categoriesRes = await axios.get("http://localhost:8000/category");
        console.log("Categories từ API:", categoriesRes.data);
        setCategories([...(categoriesRes.data || [])]);
        console.log("Categories ngay sau setCategories:", categoriesRes.data);
      } catch (err) {
        console.error("Lỗi lấy categories:", err.response ? err.response.data : err.message);
        toast.error("Không thể tải danh mục!");
      }

      // Gọi API /products
      try {
        const headers = { Authorization: `Bearer ${token}` };
        productsRes = await axios.get("http://localhost:8000/products", { headers });
        console.log("Products từ API:", productsRes.data);
        setProducts(productsRes.data || []);
      } catch (err) {
        console.error("Lỗi lấy products:", err.response ? err.response.data : err.message);
        toast.error("Không thể tải sản phẩm! Kiểm tra endpoint /products.");
      }
    } catch (err) {
      console.error("Lỗi tổng quát:", err.response ? err.response.data : err.message);
      toast.error("Không thể tải dữ liệu!");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  console.log("Categories trong state trước khi render:", categories);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, img: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("Vui lòng đăng nhập để tiếp tục!");
      return;
    }

    const isDuplicate = products.some(
      (p) =>
        p.name.trim().toLowerCase() === formData.name.trim().toLowerCase() &&
        p._id !== editingProduct?._id
    );
    if (isDuplicate) {
      toast.error("Sản phẩm đã tồn tại!");
      return;
    }

    setLoading(true);
    try {
      const payload = { ...formData, category: formData.categoryId };
      const headers = { Authorization: `Bearer ${token}` };
      if (editingProduct) {
        await axios.put(
          `http://localhost:8000/products/${editingProduct._id}`,
          payload,
          { headers }
        );
        toast.success("Cập nhật sản phẩm thành công!");
        setEditingProduct(null);
      } else {
        await axios.post("http://localhost:8000/products", payload, { headers });
        toast.success("Thêm sản phẩm thành công!");
      }
      setFormData({ name: "", price: "", img: "", categoryId: "" });
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = null;
      await fetchData();
    } catch (error) {
      console.error("Lỗi xử lý sản phẩm:", error.response ? error.response.data : error.message);
      toast.error("Lỗi xử lý sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product) => {
    if (window.confirm("Bạn có chắc muốn chỉnh sửa sản phẩm này?")) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price,
        img: product.img,
        categoryId: product.category || "",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setFormData({ name: "", price: "", img: "", categoryId: "" });
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
    if (!token) {
      toast.error("Vui lòng đăng nhập để tiếp tục!");
      return;
    }

    setLoading(true);
    try {
      await axios.delete(`http://localhost:8000/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Xóa sản phẩm thành công!");
      await fetchData();
    } catch (error) {
      console.error("Lỗi xóa sản phẩm:", error.response ? error.response.data : error.message);
      toast.error("Lỗi khi xóa sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCodeId = (codeId) => {
    setSelectedCodeId(codeId);
  };

  const filteredProducts = selectedCodeId
    ? products.filter((product) => product.category === selectedCodeId)
    : products;

  return (
    <div className="container my-5">
      <h2 className="text-center mb-4" style={{ color: "#2c3e50", fontWeight: "600" }}>
        Quản Lý Sản Phẩm
      </h2>

      <div className="card p-4 mb-5 shadow-sm" style={{ borderRadius: "10px", border: "none" }}>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              name="name"
              placeholder="Tên sản phẩm"
              value={formData.name}
              onChange={handleChange}
              required
              style={{ borderRadius: "8px", padding: "10px" }}
            />
          </div>
          <div className="mb-3">
            <input
              type="number"
              className="form-control"
              name="price"
              placeholder="Giá (VND)"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              style={{ borderRadius: "8px", padding: "10px" }}
            />
          </div>
          <div className="mb-3">
            {loading ? (
              <p>Đang tải danh mục...</p>
            ) : (
              <select
                className="form-control"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                required
                style={{ borderRadius: "8px", padding: "10px" }}
              >
                <option value="">Chọn danh mục</option>
                {categories.length > 0 ? (
                  categories.map((category) => {
                    console.log("Đang render category trong dropdown:", category);
                    return (
                      <option key={category._id} value={category.codeId}>
                        {category.name}
                      </option>
                    );
                  })
                ) : (
                  <option value="">Không có danh mục nào</option>
                )}
              </select>
            )}
          </div>
          <div className="mb-3">
            <input
              type="file"
              className="form-control"
              accept="image/*"
              onChange={handleImageChange}
              style={{ borderRadius: "8px", padding: "10px" }}
            />
            {formData.img && (
              <img
                src={formData.img}
                alt="Preview"
                width="100"
                className="mt-2 rounded"
                style={{ border: "1px solid #ddd" }}
              />
            )}
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
            style={{
              borderRadius: "8px",
              padding: "10px",
              backgroundColor: "#3498db",
              border: "none",
              transition: "background-color 0.3s ease",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#2980b9")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#3498db")}
          >
            {loading
              ? "Đang xử lý..."
              : editingProduct
              ? "Cập nhật sản phẩm"
              : "Thêm sản phẩm"}
          </button>
          {editingProduct && (
            <button
              type="button"
              className="btn btn-outline-secondary w-100 mt-2"
              onClick={handleCancelEdit}
              style={{ borderRadius: "8px", padding: "10px" }}
            >
              Hủy
            </button>
          )}
        </form>
      </div>

      <div className="card p-4 shadow-sm" style={{ borderRadius: "10px", border: "none" }}>
        <h3 className="mb-4" style={{ color: "#34495e", fontWeight: "500" }}>
          Danh Sách Sản Phẩm
        </h3>

        <div className="mb-4">
          <select
            className="form-control"
            value={selectedCodeId}
            onChange={(e) => handleSelectCodeId(e.target.value)}
            style={{ borderRadius: "8px", padding: "10px" }}
          >
            <option value="">Tất cả danh mục</option>
            {Array.from(new Set(categories.map((c) => c.codeId))).map((codeId) => {
              console.log("Đang render category trong dropdown lọc:", { codeId });
              return (
                <option key={codeId} value={codeId}>
                  {categories.find((cat) => cat.codeId === codeId)?.name || codeId}
                </option>
              );
            })}
          </select>
        </div>

        {loading ? (
          <p className="text-center text-muted">Đang tải dữ liệu...</p>
        ) : filteredProducts.length === 0 ? (
          <p className="text-center text-muted">Không có sản phẩm nào.</p>
        ) : (
          <table className="table table-hover" style={{ borderRadius: "8px", overflow: "hidden" }}>
            <thead style={{ backgroundColor: "#ecf0f1", color: "#2c3e50" }}>
              <tr>
                <th>Hình ảnh</th>
                <th>Tên sản phẩm</th>
                <th>Giá</th>
                <th>Danh mục</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product._id} style={{ transition: "background-color 0.2s" }}>
                  <td>
                    <img src={product.img} alt={product.name} width="50" className="rounded" />
                  </td>
                  <td>{product.name}</td>
                  <td>{Number(product.price).toLocaleString("vi-VN")} VND</td>
                  <td>
                    {categories.find((cat) => cat.codeId === product.category)?.name ||
                      "Không xác định"}
                  </td>
                  <td>
                    <button
                      className="btn btn-outline-warning btn-sm me-2"
                      onClick={() => handleEditProduct(product)}
                      style={{ borderRadius: "6px" }}
                    >
                      Sửa
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDeleteProduct(product._id)}
                      style={{ borderRadius: "6px" }}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ProductAdmin;