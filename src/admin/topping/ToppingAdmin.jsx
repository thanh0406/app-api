import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const ToppingAdmin = () => {
  
  // State lưu trữ danh sách sản phẩm
  const [topping, setTopping] = useState([]);
  // State lưu trữ danh sách danh mục sản phẩm
  const [categoriesTopping, setCategoriesTopping] = useState([]);
  // State lưu trữ dữ liệu nhập từ form
  const [formData, setFormData] = useState({ name: "", price: "", img: "", codeToppingId: "" });
  // State để theo dõi sản phẩm đang được chỉnh sửa
  const [editingTopping, setEditingTopping] = useState(null);
  // State để kiểm soát hiển thị trạng thái tải dữ liệu
  const [loading, setLoading] = useState(true);
  // State lưu trữ danh mục được chọn để lọc sản phẩm
  const [selectedCodeToppingId, setSelectedToppingCodeId] = useState("");

  // useEffect để tải dữ liệu sản phẩm và danh mục từ API khi component được mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resTopping = await axios.get("http://localhost:5000/topping");
        if (resTopping.status === 200) setTopping(resTopping.data);
  
        const resCategories = await axios.get("http://localhost:5000/Category-topping");
        if (resCategories.status === 200) setCategoriesTopping(resCategories.data);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);
  

    // Xử lý thay đổi trong input form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

      // Kiểm tra trùng lặp sản phẩm (không phân biệt chữ hoa/thường)
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

    // Kiểm tra trùng lặp sản phẩm (không phân biệt chữ hoa/thường)
    const isDuplicate = topping.some(
        (p) => p.name.trim().toLowerCase() === formData.name.trim().toLowerCase() &&
               p._id !== editingTopping?._id // Bỏ qua nếu đang chỉnh sửa sản phẩm này
    );
    if (isDuplicate) {
        alert("Sản phẩm đã tồn tại!");
        return;
    }

    try {
        if (editingTopping) {
            // Cập nhật sản phẩm
            const response = await axios.put(`http://localhost:5000/topping/${editingTopping._id}`, formData);
            setTopping((prev) => prev.map((p) => (p._id === editingTopping._id ? response.data.topping : p)));
            setEditingTopping(null);
        } else {
            // Thêm sản phẩm mới
            const response = await axios.post("http://localhost:5000/topping", formData);
            setTopping((prev) => [...prev, response.data.topping]);
            alert("Thêm sản phẩm thành công");
        }

        // Reset form
        setFormData({ name: "", price: "", img: "", codeToppingId: "" });

        // Kiểm tra nếu có input file mới reset
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = null;

    } catch (error) {
        console.error("Lỗi xử lý sản phẩm:", error);
    }
};


  const handleEditTopping = (topping) => {
    if (window.confirm("Bạn có chắc muốn chỉnh sửa danh mục này?")){
    setEditingTopping(topping);
    setFormData({ name: topping.name, price: topping.price, img: topping.img, codeToppingId: topping.codeToppingId || "" });
  }};

  const handleCancelEdit = () => {
    setEditingTopping(null);
    setFormData({ name: "", price: "", img: "", codeToppingId: "" });
  };
  const handleDeleteTopping = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa danh mục này?"))
      return;
    try {
      await axios.delete(`http://localhost:5000/topping/${id}`);
      setTopping((prev) => prev.filter((p) => p._id !== id));
    } catch (error) {
      alert("Lỗi khi xóa sản phẩm!");
      console.error("Lỗi xóa sản phẩm:", error);
    }
  };
  const handleSelectCodeId = (codeToppingId) => {
    setSelectedToppingCodeId(codeToppingId);
  };
  const filteredTopping = selectedCodeToppingId
    ? topping.filter((topping) => topping.codeToppingId  === selectedCodeToppingId)
    : topping;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Trang Quản Lý Sản Phẩm</h2>
      <form className="card p-4 mb-4" onSubmit={handleSubmit}>
        <div className="mb-3">
          <input type="text" className="form-control" name="name" placeholder="Tên sản phẩm" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <input type="number" className="form-control" name="price" placeholder="Giá" value={formData.price} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <select className="form-control" name="codeToppingId" value={formData.codeToppingId} onChange={handleChange} required>
            <option value="">Chọn danh mục</option>
            {categoriesTopping.map((cat) => (
                <option key={cat._id} value={cat.codeToppingId}>{cat.codeToppingId}</option>
              ))}
          </select>
        </div>
        <div className="mb-3">
          <input type="file" className="form-control" accept="image/*" onChange={handleImageChange} />
          {formData.img && <img src={formData.img} alt="Preview" width="100" className="mt-2" />}
        </div>
        <button type="submit" className="btn btn-primary">{editingTopping ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}</button>
        {editingTopping && <button type="button" className="btn btn-secondary mt-3" onClick={() => handleCancelEdit(null)}>Hủy</button>}
      </form>

      <h3>Danh sách sản phẩm</h3>
      <div className="dropdown mb-3">
        <button className="btn btn-primary dropdown-toggle" type="button" id="dropdownMenu2" data-bs-toggle="dropdown" aria-expanded="false">
          Danh mục sản phẩm
        </button>
        <ul className="dropdown-menu" aria-labelledby="dropdownMenu2">
          <li>
            <button className="dropdown-item" type="button" onClick={() => handleSelectCodeId("")}>
              Tất cả
            </button>
          </li>
          {Array.from(new Set(categoriesTopping.map(c => c.codeToppingId))).map((codeToppingId) => (
            <li key={codeToppingId}>
              <button className="dropdown-item" type="button" onClick={() => handleSelectCodeId(codeToppingId)}>
                {codeToppingId}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {loading ? <p>Đang tải dữ liệu...</p> : (
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Hình ảnh</th>
              <th>Tên sản phẩm</th>
              <th>Giá</th>
              <th>Danh mục</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredTopping.map((topping) => (
              <tr key={topping._id}>
                <td><img src={topping.img} alt={topping.name} width="50" /></td>
                <td>{topping.name}</td>
                <td>{topping.price} VND</td>
                <td>{categoriesTopping.find((cat) => cat.codeToppingId === topping.categoryTopping)?.name || "Không xác định"}</td>
                <td>
                  <button className="btn btn-primary btn-sm me-2" onClick={() => handleEditTopping(topping)}>Sửa</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDeleteTopping(topping._id)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ToppingAdmin;