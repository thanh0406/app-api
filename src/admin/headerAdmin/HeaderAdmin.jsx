import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function HeaderAdmin() {
    const { userInfo, logout } = useAuth();

    return (
        <div>
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <div className="container-fluid">
                    <a className="navbar-brand" href="#" onClick={(e) => e.preventDefault()}>
                        Web Admin
                    </a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent">
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle" href="#" onClick={(e) => e.preventDefault()} data-bs-toggle="dropdown">
                                    Danh mục
                                </a>
                                <ul className="dropdown-menu dropdown-menu-dark">
                                <li><Link className="dropdown-item" to="/admin/category-admin">Danh mục sản phẩm</Link></li>
                                <li><Link className="dropdown-item" to="/admin/category-topping-admin">Danh mục kèm theo</Link></li>
                                </ul>
                            </li>
                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle" href="#" onClick={(e) => e.preventDefault()} data-bs-toggle="dropdown">
                                    Sản phẩm
                                </a>
                                <ul className="dropdown-menu dropdown-menu-dark">
                                    <li><Link className="dropdown-item" to="/admin/product-admin">Tất cả</Link></li>
                                </ul>
                            </li>
                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle" href="#" onClick={(e) => e.preventDefault()} data-bs-toggle="dropdown">
                                    Kèm theo
                                </a>
                                <ul className="dropdown-menu dropdown-menu-dark">
                                    <li><Link className="dropdown-item" to="/admin/topping-admin">Tất cả</Link></li>
                                </ul>
                            </li>
                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle" href="#" onClick={(e) => e.preventDefault()} data-bs-toggle="dropdown">
                                    Tài khoản
                                </a>
                                <ul className="dropdown-menu dropdown-menu-dark">
                                    <li><a className="dropdown-item" href="#">Tài khoản</a></li>
                                </ul>
                            </li>
                        </ul>
                        {userInfo.isAuthenticated ? (
                            <div className="ms-3">
                                <span className="me-3">Chào, {userInfo.username}</span>
                                <button className="btn btn-danger" onClick={logout}>Đăng xuất</button>
                            </div>
                        ) : (
                            <Link className="btn btn-primary ms-3" to="/login">Đăng nhập</Link>
                        )}
                    </div>
                </div>
            </nav>
        </div>
    );
}

export default HeaderAdmin;
