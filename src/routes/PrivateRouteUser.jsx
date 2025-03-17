import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRouteUser = ({ children }) => {
    const { userInfo } = useAuth();

    if (!userInfo.isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (userInfo.role !== "user") {
        return <Navigate to="/header-admin" />;
    }

    return children;
};

export default PrivateRouteUser;
