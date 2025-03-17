import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [userInfo, setUserInfo] = useState({
        username: localStorage.getItem("username") || '',
        role: localStorage.getItem("role") || '',
        isAuthenticated: !!localStorage.getItem("token"),
        token: localStorage.getItem("token") || '',
    });

    useEffect(() => {
        const storedUserInfo = {
            username: localStorage.getItem("username") || '',
            role: localStorage.getItem("role") || '',
            isAuthenticated: !!localStorage.getItem("token"),
            token: localStorage.getItem("token") || '',
        };
        setUserInfo(storedUserInfo);
    }, []);

    const login = (userData) => {
        localStorage.setItem("username", userData.username);
        localStorage.setItem("role", userData.role);
        localStorage.setItem("token", userData.token);
        
        setUserInfo({
            username: userData.username,
            role: userData.role,
            isAuthenticated: true,
            token: userData.token
        });
    };

    const logout = () => {
        localStorage.removeItem("username");
        localStorage.removeItem("role");
        localStorage.removeItem("token");

        setUserInfo({
            username: '',
            role: '',
            isAuthenticated: false,
            token: ''
        });
    };

    return (
        <AuthContext.Provider value={{ userInfo, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
