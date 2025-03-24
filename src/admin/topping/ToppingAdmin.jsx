import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";

const ToppingAdmin = () => {
  const [toppings, setToppings] = useState([]);
  const [categoriesTopping, setCategoriesTopping] = useState([]);
  const [formData, setFormData] = useState({
    nameTopping: "",
    priceTopping: "",
    categoryToppingId: "",
  });
  const [editingTopping, setEditingTopping] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const token = localStorage.getItem("token");

  const fetchData = useCallback(async () => {
    if (!token) {
      toast.error("Vui lòng đăng nhập để tiếp tục!");
      return;
    }
    setLoading(true);
    try {
      const [toppingRes, categoryRes] = await Promise.all([
        axios.get("http://localhost:8000/topping"),
        axios.get("http://localhost:8000/category-topping"),
      ]);
      console.log("Toppings từ API:", toppingRes.data);
      console.log("CategoriesTopping từ API:", categoryRes.data);
      setToppings(toppingRes.data);
      setCategoriesTopping(categoryRes.data);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      toast.error("Không thể tải dữ liệu!");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || !token) return;
    setLoading(true);

    try {
      console.log("Payload gửi đi:", formData); // Debug payload
      if (editingTopping) {
        const response = await axios.put(
          `http://localhost:8000/topping/${editingTopping._id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success(response.data.message);
        setEditingTopping(null);
      } else {
        const response = await axios.post(
          "http://localhost:8000/topping",
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success(response.data.message);
      }

      setFormData({
        nameTopping: "",
        priceTopping: "",
        categoryToppingId: "",
      });
      await fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || "Lỗi khi xử lý topping!");
      console.error("Lỗi:", error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTopping = (topping) => {
    setEditingTopping(topping);
    setFormData({
      nameTopping: topping.nameTopping,
      priceTopping: topping.priceTopping,
      categoryToppingId: topping.categoryToppingId._id || topping.categoryToppingId,
    });
  };

  const handleCancelEdit = () => {
    setEditingTopping(null);
    setFormData({
      nameTopping: "",
      priceTopping: "",
      categoryToppingId: "",
    });
    toast.info("Đã hủy chỉnh sửa");
  };

  const handleDeleteTopping = (id) => {
    if (!token) {
      toast.error("Vui lòng đăng nhập để tiếp tục!");
      return;
    }
    toast(
      ({ closeToast }) => (
        <div>
          <p>Bạn có chắc chắn muốn xóa topping này?</p>
          <button
            className="btn btn-danger btn-sm me-2"
            onClick={async () => {
              try {
                await axios.delete(`http://localhost:8000/topping/${id}`, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                setToppings((prev) => prev.filter((topping) => topping._id !== id));
                toast.success("Xóa topping thành công!");
                await fetchData();
              } catch (error) {
                toast.error(error.response?.data?.error || "Lỗi khi xóa topping!");
                console.error("Lỗi xóa topping:", error);
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

  const filteredToppings = selectedCategoryId
    ? toppings.filter(
        (topping) =>
          topping.categoryToppingId?._id === selectedCategoryId ||
          topping.categoryToppingId === selectedCategoryId
      )
    : toppings;

  return (
    <div className="container my-5">
      <h2 className="text-center mb-4" style={{ color: "#2c3e50", fontWeight: "600" }}>
        Quản Lý Topping
      </h2>

      <div className="card p-4 mb-5 shadow-sm" style={{ borderRadius: "10px", border: "none" }}>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              name="nameTopping"
              placeholder="Tên topping"
              value={formData.nameTopping}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="number"
              className="form-control"
              name="priceTopping"
              placeholder="Giá topping"
              value={formData.priceTopping}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <select
              className="form-control"
              name="categoryToppingId"
              value={formData.categoryToppingId}
              onChange={handleChange}
              required
            >
              <option value="">Chọn danh mục topping</option>
              {categoriesTopping.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.nameCategoryTopping}
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
              padding: "10px",
              backgroundColor: "#3498db",
              border: "none",
              transition: "background-color 0.3s ease",
            }}
          >
            {loading
              ? "Đang xử lý..."
              : editingTopping
              ? "Cập nhật topping"
              : "Thêm topping"}
          </button>
          {editingTopping && (
            <button
              type="button"
              className="btn btn-outline-secondary w-100 mt-2"
              onClick={handleCancelEdit}
            >
              Hủy
            </button>
          )}
        </form>
      </div>

      <div className="card p-4 shadow-sm" style={{ borderRadius: "10px", border: "none" }}>
        <h3 className="mb-4" style={{ color: "#34495e", fontWeight: "500" }}>
          Danh Sách Topping
        </h3>
        <div className="mb-4">
          <select
            className="form-control"
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
          >
            <option value="">Tất cả danh mục</option>
            {categoriesTopping.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.nameCategoryTopping}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="text-center text-muted">Đang tải dữ liệu...</p>
        ) : filteredToppings.length === 0 ? (
          <p className="text-center text-muted">Không có topping nào.</p>
        ) : (
          <table className="table table-hover">
            <thead style={{ backgroundColor: "#ecf0f1", color: "#2c3e50" }}>
              <tr>
                <th>Tên topping</th>
                <th>Giá</th>
                <th>Danh mục</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredToppings.map((topping) => (
                <tr key={topping._id}>
                  <td>{topping.nameTopping}</td>
                  <td>{topping.priceTopping} VND</td>
                  <td>
                    {topping.categoryToppingId?.nameCategoryTopping ||
                      categoriesTopping.find((cat) => cat._id === topping.categoryToppingId)?.nameCategoryTopping ||
                      "Không xác định"}
                  </td>
                  <td>
                    <button
                      className="btn btn-outline-warning btn-sm me-2"
                      onClick={() => handleEditTopping(topping)}
                    >
                      Sửa
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDeleteTopping(topping._id)}
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

export default ToppingAdmin;