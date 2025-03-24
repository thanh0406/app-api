import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
const API_URL = import.meta.env.VITE_API_URL;

function Register() {
    const navigate = useNavigate();
    const { setEmail } = useAuth();
    const [user, setUser] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "", // Thêm trường confirmPassword
        role: "user",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        // Kiểm tra xem mật khẩu có khớp không
        if (user.password !== user.confirmPassword) {
            setError("Mật khẩu xác nhận không khớp.");
            return;
        }

        try {
            const response = await axios.post(`${API_URL}/api/register`, user);
            if (response.status === 200) {
                setSuccess("Đăng ký thành công!");
                await setTimeout(() => {}, 3000);
                setEmail(user.email);
                navigate("/verify-code");
            }
        } catch (error) {
            setError(error.response?.data?.message || "Lỗi server, vui lòng thử lại!");
        }
    };

    return (
        <div className="container mt-5">
            <h2>Đăng ký tài khoản</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Tên người dùng</label>
                    <input 
                        type="text" 
                        className="form-control" 
                        name="username" 
                        value={user.username} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
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
                <div className="mb-3">
                    <label className="form-label">Xác nhận mật khẩu</label>
                    <input 
                        type="password" 
                        className="form-control" 
                        name="confirmPassword" 
                        value={user.confirmPassword} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                <button type="submit" className="btn btn-success">Đăng ký</button>
                {" "}
                <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => navigate("/login")}
                >
                    Trở về
                </button>
            </form>
        </div>
    );
}

export default Register;
