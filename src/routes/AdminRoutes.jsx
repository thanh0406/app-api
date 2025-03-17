import React from "react";
import { Routes, Route } from "react-router-dom";
import HeaderAdmin from "../admin/headerAdmin/HeaderAdmin";
import ProductAdmin from "../admin/menuAdmin/ProductAdmin";
import CategoryAdmin from "../admin/category/CategoryAdmin";
import ToppingAdmin from "../admin/topping/ToppingAdmin";
import HomeAdmin from "../admin/homeAdmin/HomeAdmin";
import CategoryToppingAdmin from "../admin/category/CategoryToppingAdmin";

const AdminRoutes = () => {
    return (
        <>
            <HeaderAdmin />
            <Routes>
                <Route path="/home-admin" element={<HomeAdmin />} />
                <Route path="/category-admin" element={<CategoryAdmin />} />
                <Route path="/product-admin" element={<ProductAdmin />} />
                <Route path="/topping-admin" element={<ToppingAdmin />} />
                <Route path="/category-topping-admin" element={<CategoryToppingAdmin/>} />
                <Route path="/topping-admin" element={<ToppingAdmin/>} />

            </Routes>
        </>
    );
};

export default AdminRoutes;
