import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRouteAdmin = ({ children }) => {
    const { userInfo } = useAuth();

    if (!userInfo.isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (userInfo.role !== "admin") {
        return <Navigate to="/Header-user" />;
    }

    return children;
};

export default PrivateRouteAdmin;
