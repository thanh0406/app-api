import { useEffect, useState } from "react";
import axios from "axios";



const CategoryToppingAdmin = () => {
    // State lưu trữ danh sách danh mục
    const [categories, setCategories] = useState([]);

    // State lưu trữ dữ liệu form nhập vào (Tên danh mục & Mã danh mục)
    const [formData, setFormData] = useState({ name: "", codeToppingId: "" });

    // State lưu danh mục đang chỉnh sửa
    const [editingCategory, setEditingCategory] = useState(null);

    // State kiểm soát trạng thái loading khi thêm/sửa danh mục
    const [loading, setLoading] = useState(false);

    // State lưu mã danh mục được chọn để lọc danh mục
    const [selectedCodeId, setSelectedCodeId] = useState("");

    // Lấy danh sách danh mục từ API khi component được tải lần đầu
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get("http://localhost:5000/category-topping");
                setCategories(response.data);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách danh mục:", error);
            }
        };
        fetchCategories();
    }, []);

    // Cập nhật state khi người dùng nhập vào input
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    // Xử lý thêm hoặc chỉnh sửa danh mục
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return; // Nếu đang xử lý thì không cho phép gửi tiếp
        setLoading(true);

        try {
            // Kiểm tra trùng lặp codeId (bỏ qua chính nó nếu đang chỉnh sửa)
            const isDuplicate = categories.some(
                (c) => c.codeToppingId.trim().toLowerCase() === formData.codeToppingId.trim().toLowerCase() && c._id !== editingCategory?._id
            );

            if (isDuplicate) {
                alert("Mã danh mục đã tồn tại!");
                setLoading(false);
                return;
            }

            const url = editingCategory
                ? `http://localhost:5000/category-topping/${editingCategory._id}` // API cập nhật danh mục
                : "http://localhost:5000/category-topping"; // API thêm danh mục mới
            const method = editingCategory ? "put" : "post";
            const response = await axios[method](url, formData);

            setCategories((prev) =>
                editingCategory
                    ? prev.map((c) => (c._id === editingCategory._id ? response.data : c)) // Cập nhật danh mục trong danh sách
                    : [...prev, { ...formData, _id: response.data._id }] // Thêm danh mục mới vào danh sách
            );

            alert(editingCategory ? "Cập nhật danh mục thành công!" : "Thêm danh mục thành công!");
            setEditingCategory(null);
            setFormData({ name: "", codeToppingId: "" }); // Reset form
        } catch (error) {
            alert("Lỗi khi xử lý danh mục!");
            console.error("Lỗi:", error.response?.data || error);
        } finally {
            setLoading(false);
        }
    };


    // Xử lý khi nhấn nút sửa danh mục
    const handleEditCategory = (category) => {
        if (window.confirm("Bạn có chắc muốn chỉnh sửa danh mục này?")) {
            setEditingCategory(category);
            setFormData({ name: category.name, codeToppingId: category.codeToppingId });
        }
    };

    // Hủy chỉnh sửa danh mục
    const handleCancelEdit = () => {
        setEditingCategory(null);
        setFormData({ name: "", codeToppingId: "" });
    };

    // Xóa danh mục
    const handleDeleteCategory = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return;
        try {
            await axios.delete(`http://localhost:5000/category-topping/${id}`);
            setCategories((prev) => prev.filter((category) => category._id !== id)); // Xóa danh mục khỏi danh sách
            alert("Xóa danh mục thành công!");
        } catch (error) {
            alert("Lỗi khi xóa danh mục!");
            console.error("Lỗi xóa danh mục:", error);
        }
    };

    // Lọc danh mục theo mã danh mục (codeId)
    const handleSelectCodeId = (codeToppingId) => {
        setSelectedCodeId(codeToppingId);
    };

    // Danh sách danh mục sau khi lọc theo mã danh mục
    const filteredCategories = selectedCodeId
        ? categories.filter((category) => category.codeToppingId === selectedCodeId)
        : categories;

    return (
        <div className="container my-4">
            <h2 className="text-center text-primary">Trang Quản Lý Danh mục</h2>

            {/* Form thêm/sửa danh mục */}
            <form className="card p-3 shadow-sm" onSubmit={handleSubmit}>
                <input
                    className="form-control mb-3"
                    type="text"
                    name="name"
                    placeholder="Tên danh mục"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
                <input
                    className="form-control mb-3"
                    type="text"
                    name="codeToppingId" // Đổi từ "codeId" thành "codeToppingId"
                    placeholder="Mã danh mục"
                    value={formData.codeToppingId}
                    onChange={handleChange}
                    required
                />

                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "Đang xử lý..." : editingCategory ? "Cập nhật danh mục" : "Thêm danh mục"}
                </button>
                {editingCategory && (
                    <button type="button" onClick={handleCancelEdit} className="btn btn-secondary mt-3">
                        Hủy
                    </button>
                )}
            </form>

            {/* Danh sách danh mục */}
            <div className="mt-4">
                <h3>Danh sách danh mục</h3>

                {/* Dropdown Lọc theo mã danh mục (codeId) */}
                <div className="dropdown mb-3">
                    <button className="btn btn-primary dropdown-toggle" type="button" id="dropdownMenu2" data-bs-toggle="dropdown" aria-expanded="false">
                        Mã danh mục
                    </button>
                    <ul className="dropdown-menu" aria-labelledby="dropdownMenu2">
                        <li>
                            <button className="dropdown-item" type="button" onClick={() => handleSelectCodeId("")}>
                                Tất cả
                            </button>
                        </li>
                        {Array.from(new Set(categories.map((c) => c.codeToppingId))).map((codeToppingId) => (
                            <li key={codeToppingId}>
                                <button className="dropdown-item" type="button" onClick={() => handleSelectCodeId(codeToppingId)}>
                                    {codeToppingId}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {loading ? (
                    <p className="text-center">Đang tải dữ liệu...</p>
                ) : filteredCategories.length === 0 ? (
                    <p className="text-center text-muted">Không có danh mục nào.</p>
                ) : (
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>Tên danh mục</th>
                                <th>Mã danh mục</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCategories.map((category) => (
                                <tr key={category._id}>
                                    <td>{category.name}</td>
                                    <td>{category.codeToppingId}</td>
                                    <td>
                                        <button onClick={() => handleEditCategory(category)} className="btn btn-warning btn-sm me-2">
                                            Sửa
                                        </button>
                                        <button onClick={() => handleDeleteCategory(category._id)} className="btn btn-danger btn-sm">
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