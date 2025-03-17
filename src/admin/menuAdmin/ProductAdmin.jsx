import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-image-crop/dist/ReactCrop.css";
const ProductAdmin = () => {
  
  // State lưu trữ danh sách sản phẩm
  const [products, setProducts] = useState([]);
  // State lưu trữ danh sách danh mục sản phẩm
  const [categories, setCategories] = useState([]);
  // State lưu trữ dữ liệu nhập từ form
  const [formData, setFormData] = useState({ name: "", price: "", img: "", categoryId: "" });
  // State để theo dõi sản phẩm đang được chỉnh sửa
  const [editingProduct, setEditingProduct] = useState(null);
  // State để kiểm soát hiển thị trạng thái tải dữ liệu
  const [loading, setLoading] = useState(true);
  // State lưu trữ danh mục được chọn để lọc sản phẩm
  const [selectedCodeId, setSelectedCodeId] = useState("");

  // useEffect để tải dữ liệu sản phẩm và danh mục từ API khi component được mount
  useEffect(() => {
    axios.get("http://localhost:5000/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Lỗi lấy danh sách sản phẩm:", err));

    axios.get("http://localhost:5000/Category")
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Lỗi lấy danh sách danh mục:", err))
      .finally(() => setLoading(false));
  }, []);

    // Xử lý thay đổi trong input form
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

    // Kiểm tra trùng lặp sản phẩm (không phân biệt chữ hoa/thường)
    const isDuplicate = products.some(
        (p) => p.name.trim().toLowerCase() === formData.name.trim().toLowerCase() &&
               p._id !== editingProduct?._id // Bỏ qua nếu đang chỉnh sửa sản phẩm này
    );
    if (isDuplicate) {
        alert("Sản phẩm đã tồn tại!");
        return;
    }

    try {
        if (editingProduct) {
            // Cập nhật sản phẩm
            const response = await axios.put(`http://localhost:5000/products/${editingProduct._id}`, formData);
            setProducts((prev) => prev.map((p) => (p._id === editingProduct._id ? response.data.product : p)));
            setEditingProduct(null);
        } else {
            // Thêm sản phẩm mới
            const response = await axios.post("http://localhost:5000/products", formData);
            setProducts((prev) => [...prev, response.data.product]);
            alert("Thêm sản phẩm thành công");
        }

        // Reset form
        setFormData({ name: "", price: "", img: "", categoryId: "" });

        // Kiểm tra nếu có input file mới reset
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = null;

    } catch (error) {
        console.error("Lỗi xử lý sản phẩm:", error);
    }
};


  const handleEditProduct = (product) => {
    if (window.confirm("Bạn có chắc muốn chỉnh sửa danh mục này?")){
    setEditingProduct(product);
    setFormData({ name: product.name, price: product.price, img: product.img, categoryId: product.category || "" });
  }};
  // Hủy chỉnh sửa danh mục
  const handleCancelEdit = () => {
    setEditingProduct(null);
    setFormData({ name: "", price: "", img: "", categoryId: "" });
  };
  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa danh mục này?"))
      return;
    try {
      await axios.delete(`http://localhost:5000/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (error) {
      alert("Lỗi khi xóa sản phẩm!");
      console.error("Lỗi xóa sản phẩm:", error);
    }
  };
  const handleSelectCodeId = (codeId) => {
    setSelectedCodeId(codeId);
  };
  const filteredProducts = selectedCodeId
    ? products.filter((product) => product.category === selectedCodeId)
    : products;

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
          <select className="form-control" name="categoryId" value={formData.categoryId} onChange={handleChange} required>
            <option value="">Chọn danh mục</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.codeId}>{cat.codeId}</option> // Hiển thị codeId thay vì name
            ))}
          </select>

        </div>
        <div className="mb-3">
          <input type="file" className="form-control" accept="image/*" onChange={handleImageChange} />
          {formData.img && <img src={formData.img} alt="Preview" width="100" className="mt-2" />}
        </div>
        <button type="submit" className="btn btn-primary">{editingProduct ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}</button>
        {editingProduct && <button type="button" className="btn btn-secondary mt-3" onClick={() => handleCancelEdit(null)}>Hủy</button>}
      </form>

      <h3>Danh sách sản phẩm</h3>
      {/* Dropdown Lọc theo mã danh mục (codeId) */}
      <div className="dropdown mb-3">
        <button class="btn btn-primary dropdown-toggle" type="button" id="dropdownMenu2" data-bs-toggle="dropdown" aria-expanded="false">
          Danh mục sản phẩm
        </button>
        <ul className="dropdown-menu" aria-labelledby="dropdownMenu2">
          <li>
            <button className="dropdown-item" type="button" onClick={() => handleSelectCodeId("")}>
              Tất cả
            </button>
          </li>
          {Array.from(new Set(categories.map(c => c.codeId))).map((codeId) => (
            <li key={codeId}>
              <button className="dropdown-item" type="button" onClick={() => handleSelectCodeId(codeId)}>
                {codeId}
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
            {filteredProducts.map((product) => (
              <tr key={product._id}>
                <td><img src={product.img} alt={product.name} width="50" /></td>
                <td>{product.name}</td>
                <td>{product.price} VND</td>
                <td>{categories.find((cat) => cat.codeId === product.category)?.name || "Không xác định"}</td>
                <td>
                  <button className="btn btn-primary btn-sm me-2" onClick={() => handleEditProduct(product)}>Sửa</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDeleteProduct(product._id)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ProductAdmin;