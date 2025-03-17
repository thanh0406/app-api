import React from "react";
import { Routes, Route } from "react-router-dom";
import HeaderUser from "../user/HeaderUser/HeaderUser";
import ProductUser from "../user/menu/ProductsUser";
import CategoryDropdown from "../user/dropdown/CategoryDropdown";

const UserRoutes = () => {
    return (
        <>
            <HeaderUser />
            <Routes>
            <Route path="/product-user/:id" element={<ProductUser />} />
            <Route path="/category-dropdown-user/:id" element={<CategoryDropdown />} />
            </Routes>
        </>
    );
};

export default UserRoutes;

