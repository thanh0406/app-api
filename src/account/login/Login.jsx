import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Login() {
    const { login, userInfo } = useAuth();
    const navigate = useNavigate();
    const [user, setUser] = useState({
        email: "",
        password: ""
    });

    useEffect(() => {
        if (userInfo.isAuthenticated) {
            if (userInfo.role === "admin") {
                navigate("/header-admin"); 
            } else {
                navigate("/header-user"); 
            }
        }
    }, [userInfo.isAuthenticated, userInfo.role]);

    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:5000/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(user),
            });

            const data = await response.json();

            if (response.ok) {
                login({ 
                    email: user.email, 
                    token: data.token, 
                    username: data.username, 
                    role: data.role // Thêm role vào login
                });

                if (data.role === "admin") {
                    navigate("/header-admin"); // Chuyển hướng admin
                } else {
                    navigate("/header-user"); // Chuyển hướng user
                }
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Lỗi đăng nhập:", error);
            alert("Đã xảy ra lỗi! Vui lòng thử lại.");
        }
    };

    return (
        <div className="container mt-5">
            <h2>Đăng nhập</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input 
                        type="email" 
                        className="form-control" 
                        name="email" 
                        value={user.email} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Mật khẩu</label>
                    <input 
                        type="password" 
                        className="form-control" 
                        name="password" 
                        value={user.password} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                <button type="submit" className="btn btn-primary">Đăng nhập</button>
            </form>

            <p className="mt-3">
                Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
            </p>
        </div>
    );
}

export default Login;
