import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
const API_URL = import.meta.env.VITE_API_URL;

function VerifyCode() {
    const navigate = useNavigate();
    const { userInfo, login } = useAuth();
    const [code, setCode] = useState("");  // Mã code xác thực
    const [error, setError] = useState(""); // Lỗi nếu mã không đúng
    const [success, setSuccess] = useState(""); // Thông báo thành công
    const [sending, setSending] = useState(false); // Trạng thái gửi lại mã

    const handleChange = (e) => {
        setCode(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            const response = await axios.post(`${API_URL}/api/verify-code`, { email: userInfo.email, code });
            const data = response.data;
            if (response.status === 200) {
                setSuccess("Mã xác thực thành công!");
                // Chuyển hướng sau khi xác thực thành công
                login({ 
                    id: data._id, 
                    email: data.email, 
                    token: data.token, 
                    username: data.username, 
                    role: data.role 
                });
                navigate("/header-user"); 
            }
        } catch (error) {
            setError(error.response?.data?.message || "Mã xác thực không hợp lệ.");
        }
    };

    const handleResendCode = async () => {
        setSending(true);
        setError("");
        setSuccess("");
        try {
            const response = await axios.post(`${API_URL}/api/resend-code`, { email: userInfo.email });
            if (response.status === 200) {
                setSuccess("Mã xác thực mới đã được gửi vào email của bạn!");
            }
        } catch (error) {
            setError(error.response?.data?.message || "Lỗi khi gửi lại mã xác thực.");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="container mt-5">
            <h2>Nhập mã xác thực</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Mã xác thực</label>
                    <input 
                        type="text" 
                        className="form-control" 
                        name="code" 
                        value={code} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                <button type="submit" className="btn btn-success">Xác thực</button>
                {" "}
                <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => navigate("/login")}
                >
                    Quay lại
                </button>
            </form>

            {/* Nút gửi lại mã */}
            <div className="mt-3">
                <button 
                    type="button" 
                    className="btn btn-warning"
                    onClick={handleResendCode}
                    disabled={sending} // Vô hiệu hóa nút khi đang gửi lại mã
                >
                    {sending ? "Đang gửi..." : "Gửi lại mã xác thực"}
                </button>
            </div>
        </div>
    );
}

export default VerifyCode;
