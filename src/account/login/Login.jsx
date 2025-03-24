import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
const API_URL = import.meta.env.VITE_API_URL;

function Login() {
  const { login, setEmail, userInfo } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState({
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

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
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      const data = await response.json();

      if (response.ok) {
        login({
          id: data._id,
          email: data.email,
          token: data.token,
          username: data.username,
          role: data.role,
        });

        setErrorMessage("");

        if (data.role === "admin") {
          navigate("/header-admin");
        } else {
          navigate("/header-user");
        }
      } else {
        if (data.error === "unverified") {
          setEmail(user.email);
          navigate("/verify-code");
        } else {
          setErrorMessage(data.message);
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi! Vui lòng thử lại.");
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
        {errorMessage && <div className="text-danger pb-2">{errorMessage}</div>}
        <button type="submit" className="btn btn-primary">
          Đăng nhập
        </button>
      </form>
      <p className="mt-3">
        Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
      </p>
    </div>
  );
}

export default Login;
