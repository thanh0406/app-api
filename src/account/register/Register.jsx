import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Register() {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        username: "",
        email: "",
        password: "",
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

        try {
            const response = await axios.post("http://localhost:5000/api/register", user);
            if (response.status === 200) {
                setSuccess("Đăng ký thành công!");
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