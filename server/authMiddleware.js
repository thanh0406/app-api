import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { permissionList } from "./permissionList.js"; // Import danh sách quyền

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1]; // Lấy token sau "Bearer "
    
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded; // Lưu thông tin user vào request

        console.log("Decoded User:", decoded);

        // Lấy route từ URL
        const routeSegments = req.path.split("/").filter(segment => segment !== "");
        const routeName = routeSegments[0]; 
        const method = req.method.toUpperCase();

        // Kiểm tra quyền trong danh sách
        const hasPermission = permissionList.some(permission =>
            permission.routeName === routeName &&
            permission.method.toUpperCase() === method &&
            permission.role.includes(decoded.role)
        );

        if (!hasPermission) {
            return res.status(403).json({ message: "Forbidden: You do not have permission" });
        }

        next(); // Nếu hợp lệ, tiếp tục request
    } catch (error) {
        console.error("JWT Error:", error);
        return res.status(403).json({ message: "Invalid or expired token" });
    }
};

export default verifyToken;
