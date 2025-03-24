import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";

const CategoryToppingAdmin = () => {
  const [categories, setCategories] = useState([]);
  const [categoryToppings, setCategoryToppings] = useState([]);
  const [formData, setFormData] = useState({ nameCategoryTopping: "", codeToppingId: "", categoryId: "" });
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterCategoryId, setFilterCategoryId] = useState("");
  const [filterCodeToppingId, setFilterCodeToppingId] = useState("");
  const token = localStorage.getItem("token");

  // Hàm fetchData để lấy dữ liệu từ API
  const fetchData = useCallback(async () => {
    if (!token) {
      toast.error("Vui lòng đăng nhập để tiếp tục!");
      return;
    }
    setLoading(true);
    try {
      const [categoryRes, categoryToppingRes] = await Promise.all([
        axios.get("http://localhost:8000/category"),
        axios.get("http://localhost:8000/category-topping"),
      ]);
      setCategories(categoryRes.data);
      setCategoryToppings(categoryToppingRes.data);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
      toast.error("Không thể tải dữ liệu danh mục!");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = useCallback((e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || !token) return;
    setLoading(true);

    if (!formData.codeToppingId.trim()) {
      toast.error("Vui lòng nhập mã danh mục hợp lệ!");
      setLoading(false);
      return;
    }

    try {
      const isDuplicate = categoryToppings.some(
        (c) =>
          c.codeToppingId.trim().toLowerCase() === formData.codeToppingId.trim().toLowerCase() &&
          c._id !== editingCategory?._id
      );

      if (isDuplicate) {
        toast.error("Mã danh mục đã tồn tại!");
        setLoading(false);
        return;
      }

      const url = editingCategory
        ? `http://localhost:8000/category-topping/${editingCategory._id}`
        : "http://localhost:8000/category-topping";
      const method = editingCategory ? "put" : "post";

      const response = await axios({
        method,
        url,
        data: formData,
        headers: { Authorization: `Bearer ${token}` },
      });

      // Cập nhật state tạm thời
      setCategoryToppings((prev) =>
        editingCategory
          ? prev.map((c) => (c._id === editingCategory._id ? response.data : c))
          : [...prev, response.data]
      );

      toast.success(editingCategory ? "Cập nhật danh mục thành công!" : "Thêm danh mục thành công!");
      setEditingCategory(null);
      setFormData({ nameCategoryTopping: "", codeToppingId: "", categoryId: "" });

      // Làm mới dữ liệu từ server
      await fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi xử lý danh mục!");
      console.error("Lỗi:", error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = useCallback((category) => {
    toast.info("Chuẩn bị chỉnh sửa danh mục", {
      onClose: () => {
        setEditingCategory(category);
        setFormData(category);
      },
      autoClose: 1500,
    });
  }, []);

  const handleDeleteCategory = async (id) => {
    toast(
      ({ closeToast }) => (
        <div>
          <p>Bạn có chắc chắn muốn xóa danh mục này?</p>
          <button
            className="btn btn-danger btn-sm me-2"
            onClick={async () => {
              try {
                await axios.delete(`http://localhost:8000/category-topping/${id}`, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                // Cập nhật state tạm thời
                setCategoryToppings((prev) => prev.filter((category) => category._id !== id));
                toast.success("Xóa danh mục thành công!");
                // Làm mới dữ liệu từ server
                await fetchData();
              } catch (error) {
                toast.error("Lỗi khi xóa danh mục!");
                console.error("Lỗi xóa danh mục:", error);
              }
              closeToast();
            }}
          >
            Xóa
          </button>
          <button className="btn btn-secondary btn-sm" onClick={closeToast}>
            Hủy
          </button>
        </div>
      ),
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
      }
    );
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setFormData({ nameCategoryTopping: "", codeToppingId: "", categoryId: "" });
    toast.info("Đã hủy chỉnh sửa danh mục");
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat._id === categoryId);
    return category ? category.name : "Không xác định";
  };

  const filteredCategoryToppings = useMemo(() => {
    return categoryToppings.filter((category) => {
      const matchesCategory = filterCategoryId ? category.categoryId === filterCategoryId : true;
      const matchesCode = filterCodeToppingId ? category.codeToppingId === filterCodeToppingId : true;
      return matchesCategory && matchesCode;
    });
  }, [categoryToppings, filterCategoryId, filterCodeToppingId]);

  const uniqueCodeToppingIds = useMemo(() => {
    return [...new Set(categoryToppings.map((cat) => cat.codeToppingId))];
  }, [categoryToppings]);

  return (
    <div className="container my-5">
      <h2 className="text-center mb-4" style={{ color: "#2c3e50", fontWeight: "600" }}>
        Quản Lý Danh Mục Topping
      </h2>

      {/* Form nhập liệu */}
      <div className="card p-4 mb-5 shadow-sm" style={{ borderRadius: "10px", border: "none" }}>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              className="form-control"
              type="text"
              name="nameCategoryTopping"
              placeholder="Tên danh mục"
              value={formData.nameCategoryTopping}
              onChange={handleChange}
              required
              style={{ borderRadius: "8px", padding: "10px" }}
            />
          </div>
          <div className="mb-3">
            <input
              className="form-control"
              type="text"
              name="codeToppingId"
              placeholder="Mã danh mục"
              value={formData.codeToppingId}
              onChange={handleChange}
              required
              style={{ borderRadius: "8px", padding: "10px" }}
            />
          </div>
          <div className="mb-3">
            <select
              className="form-control"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              required
              style={{ borderRadius: "8px", padding: "10px" }}
            >
              <option value="">Chọn danh mục sản phẩm</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
            style={{
              borderRadius: "8px",
              padding: "10px 20px",
              backgroundColor: "#3498db",
              border: "none",
              transition: "background-color 0.3s ease",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#2980b9")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#3498db")}
          >
            {loading ? "Đang xử lý..." : editingCategory ? "Cập nhật danh mục" : "Thêm danh mục"}
          </button>
          {editingCategory && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="btn btn-outline-secondary w-100 mt-2"
              style={{ borderRadius: "8px", padding: "10px 20px" }}
            >
              Hủy
            </button>
          )}
        </form>
      </div>

      {/* Danh sách */}
      <div className="card p-4 shadow-sm" style={{ borderRadius: "10px", border: "none" }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 style={{ color: "#34495e", fontWeight: "500" }}>Danh Sách Danh Mục</h3>
        </div>

        {/* Bộ lọc */}
        <div className="row mb-4">
          <div className="col-md-6 mb-3 mb-md-0">
            <select
              className="form-control"
              value={filterCategoryId}
              onChange={(e) => setFilterCategoryId(e.target.value)}
              style={{ borderRadius: "8px", padding: "10px" }}
            >
              <option value="">Tất cả danh mục sản phẩm</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-6">
            <select
              className="form-control"
              value={filterCodeToppingId}
              onChange={(e) => setFilterCodeToppingId(e.target.value)}
              style={{ borderRadius: "8px", padding: "10px" }}
            >
              <option value="">Tất cả mã danh mục</option>
              {uniqueCodeToppingIds.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bảng */}
        {loading ? (
          <p className="text-center text-muted">Đang tải dữ liệu...</p>
        ) : filteredCategoryToppings.length === 0 ? (
          <p className="text-center text-muted">Không có danh mục nào phù hợp.</p>
        ) : (
          <table className="table table-hover" style={{ borderRadius: "8px", overflow: "hidden" }}>
            <thead style={{ backgroundColor: "#ecf0f1", color: "#2c3e50" }}>
              <tr>
                <th>Tên danh mục</th>
                <th>Mã danh mục</th>
                <th>Danh mục sản phẩm</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategoryToppings.map((category) => (
                <tr key={category._id} style={{ transition: "background-color 0.2s" }}>
                  <td>{category.nameCategoryTopping}</td>
                  <td>{category.codeToppingId}</td>
                  <td>{getCategoryName(category.categoryId)}</td>
                  <td>
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="btn btn-outline-warning btn-sm me-2"
                      style={{ borderRadius: "6px" }}
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category._id)}
                      className="btn btn-outline-danger btn-sm"
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

export default CategoryToppingAdmin;