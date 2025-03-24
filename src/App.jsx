import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./account/login/Login";
import Register from "./account/register/Register";
import PrivateRouteAdmin from "./routes/PrivateRouteAdmin";
import PrivateRouteUser from "./routes/PrivateRouteUser";
import HeaderAdmin from "./admin/headerAdmin/HeaderAdmin";
import HeaderUser from "./user/HeaderUser/HeaderUser";
import AdminRoutes from "./routes/AdminRoutes";
import UserRoutes from "./routes/UserRoutes";
import VerifyCode from "./account/verify/Verify";
import { ToastContainer } from 'react-toastify';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Route dành riêng cho user */}
                    <Route path="/header-user" element={<PrivateRouteUser><HeaderUser /></PrivateRouteUser>} />
                    <Route path="user/*" element={<PrivateRouteUser><UserRoutes /></PrivateRouteUser>} />
                    {/* Route dành riêng cho admin */}
                    <Route path="/header-admin" element={<PrivateRouteAdmin><HeaderAdmin /></PrivateRouteAdmin>} />
                    <Route path="admin/*" element={<PrivateRouteAdmin><AdminRoutes /></PrivateRouteAdmin>} />

                    {/* Các route công khai */}
                    <Route path="/register" element={<Register />} />
                    <Route path="/verify-code" element={<VerifyCode />} />
                    <Route path="/login" element={<Login />} />
                </Routes>
                <ToastContainer />
            </Router> 
        </AuthProvider> 
    );
}

export default App;
