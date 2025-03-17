import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

function HeaderUser() {
    const { userInfo, logout } = useAuth();
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                const response = await axios.get("http://localhost:5000/category");
                if (isMounted) setCategories(response.data);
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu:", error);
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleCategoryClick = (categoryId) => {
        navigate(`/user/category-dropdown-user/${categoryId}`);
    };

    return (
        <div>
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <div className="container-fluid">
                    <Link className="navbar-brand" to="/admin/home-admin">
                        <img src="/photo/1.png" alt="Logo" style={{ height: "40px" }} />
                    </Link>

                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="navbarContent">
                        <form className="d-flex me-auto">
                            <input className="form-control me-2" type="search" placeholder="Tìm kiếm..." />
                            <button className="btn btn-outline-success" type="submit">Tìm</button>
                        </form>

                        <div className="d-flex">
                            <button className="btn btn-light me-3">
                                <img src="/photo/2.png" alt="Tin nhắn" width="40" height="40" />
                            </button>
                            <button className="btn btn-light me-3">
                                <img src="/photo/3.jpg" alt="Giỏ hàng" width="40" height="40" />
                            </button>
                        </div>

                        {userInfo?.isAuthenticated ? (
                            <div>
                                <span className="me-3">Chào, {userInfo.username}</span>
                                <button className="btn btn-danger" onClick={logout}>Đăng xuất</button>
                            </div>
                        ) : (
                            <Link className="btn btn-primary ms-3" to="/login">Đăng nhập</Link>
                        )}
                    </div>
                </div>
            </nav>

            <nav className="navbar navbar-expand-lg navbar-light bg-primary">
                <div className="container-fluid">
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#categoryMenu">
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse justify-content-center" id="categoryMenu">
                        <div className="nav-item dropdown">
                            <a
                                className={`nav-link dropdown-toggle ${categories.length === 0 ? "disabled" : ""}`}
                                href="#"
                                onClick={(e) => e.preventDefault()}
                                data-bs-toggle="dropdown">
                                Danh mục
                            </a>

                            <ul className="dropdown-menu dropdown-menu-dark">
                                <button className="dropdown-item" onClick={() => navigate("/user/category-dropdown-user/all")}>
                                    Tất cả sản phẩm
                                </button>
                                {categories.map((category) => (
                                    <li key={category.codeId}>
                                        <button className="dropdown-item" onClick={() => handleCategoryClick(category.codeId)}>
                                            {category.name}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    );
}

export default HeaderUser;