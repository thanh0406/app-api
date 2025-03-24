import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";


const AuthContext = createContext();

// Hàm kiểm tra token hợp lệ
const isValidToken = (token) => {
    try {
        const decoded = jwtDecode(token);
        return decoded.exp * 1000 > Date.now(); // Kiểm tra xem token có hết hạn không
    } catch (error) {
        console.error("lỗi",error);
        return false;
    }
};

export const AuthProvider = ({ children }) => {
    const [userInfo, setUserInfo] = useState({
        userId: localStorage.getItem("id") || '',
        username: localStorage.getItem("username") || '',
        role: localStorage.getItem("role") || '',
        isAuthenticated: isValidToken(localStorage.getItem("token")),  // ✅ Kiểm tra token
        token: localStorage.getItem("token") || '',
        email: localStorage.getItem("email") || '',
    });

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUserInfo = {
            userId: localStorage.getItem("id") || '',
            username: localStorage.getItem("username") || '',
            role: localStorage.getItem("role") || '',
            isAuthenticated: isValidToken(token),
            token: token || '',
            email: localStorage.getItem("email") || '',
        };
        setUserInfo(storedUserInfo);
    }, [localStorage.getItem("token")]); // ✅ Chạy lại khi token thay đổi

    const login = (userData) => {
        localStorage.setItem("id", userData.id);
        localStorage.setItem("username", userData.username);
        localStorage.setItem("role", userData.role);
        localStorage.setItem("token", userData.token);
        localStorage.setItem("email", userData.email);
        
        setUserInfo({
            userId: userData.id,  // ✅ Đúng key
            email: userData.email,
            token: userData.token,
            username: userData.username,
            role: userData.role,
            isAuthenticated: isValidToken(userData.token),
        });
    };

    const logout = () => {
        localStorage.removeItem("id"); 
        localStorage.removeItem("username");
        localStorage.removeItem("role");
        localStorage.removeItem("token");
        localStorage.removeItem("email");

        setUserInfo({
            userId: '', 
            username: '',
            role: '',
            isAuthenticated: false,
            token: '',
            email: '',
        });
    };

    const setEmail = (email) => {
        localStorage.setItem("email", email);
        setUserInfo((prev) => ({ ...prev, email }));
    };

    return (
        <AuthContext.Provider value={{ userInfo, login, logout, setEmail }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
