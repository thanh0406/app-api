import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectDB from "./db.js";
import User from "./models/user/User.js";
import VerifyCode from "./models/user/VerifyCode.js";
import Category from "./models/menu/Category.js";
import Product from "./models/menu/Product.js";
import Topping from "./models/topping/Topping.js";
import CategoryTopping from "./models/topping/CategoryTopping.js";
import Cart from "./models/cart/Cart.js";
import verifyToken from "./authMiddleware.js";

import { sendEmail } from "./mail.js";
import { generateRandomPassword } from "./utils.js";
import dayjs from "dayjs";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());
await connectDB();
app.use(cors());

const SECRET_KEY = process.env.JWT_SECRET;

app.post("/api/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;

    const existingUser = await User.findOne({ email: email });

    if (existingUser)
      return res.status(400).json({ message: "Tài khoản đã tồn tại!" });

    const code = generateRandomPassword(10);

    const mailTitle = `Xác nhận tài khoản`;
    const mailContent = `
      Mã xác nhận của bạn là: ${code}
    `;
    sendEmail(email, mailTitle, mailContent);
    const expiresAt = dayjs().add(15, "minute").toDate();

    // Xóa mã cũ nếu tồn tại
    await VerifyCode.deleteMany({ email });

    // Lưu vào database
    const newCode = new VerifyCode({
      code,
      email,
      isVerified: false,
      expiresAt,
    });

    await newCode.save();

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      username,
      password: hashedPassword,
      role: "user",
      status: "unverified",
    });

    await newUser.save();
    res.json({ message: "Kiểm tra mail đăng ký để xác thực !" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server!", error });
  }
});

app.post("/api/resend-code", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email không được để trống!" });
    }

    const existingUser = await User.findOne({ email: email });

    if (!existingUser)
      return res.status(400).json({ message: "Tài khoản không tồn tại!" });

    if (existingUser.status !== "unverified")
      return res.status(400).json({ message: "Tài khoản đã xác thực !" });

    // Xóa mã cũ nếu tồn tại
    await VerifyCode.deleteMany({ email });

    // Tạo mã mới
    const code = generateRandomPassword(10);
    const expiresAt = dayjs().add(15, "minute").toDate();

    // Lưu vào database
    const newCode = new VerifyCode({
      code,
      email,
      isVerified: false,
      expiresAt,
    });

    await newCode.save();

    // Gửi email xác thực
    const mailTitle = "Xác nhận tài khoản";
    const mailContent = `Mã xác nhận của bạn là: ${code}`;
    sendEmail(email, mailTitle, mailContent);

    res.json({
      message: "Mã xác thực mới đã được gửi, vui lòng kiểm tra email!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server!", error });
  }
});

app.post("/api/verify-code", async (req, res) => {
  try {
    const { email, code } = req.body;

    const verifyCode = await VerifyCode.findOne({ email, code });

    if (!verifyCode) {
      return res.status(400).json({ message: "Mã xác thực không chính xác!" });
    }

    const existingUser = await User.findOne({ email: email });

    if (!existingUser)
      return res.status(400).json({ message: "Tài khoản không tồn tại!" });

    if (existingUser.status !== "unverified")
      return res.status(400).json({ message: "Tài khoản đã xác thực !" });

    if (new Date() > verifyCode.expiresAt) {
      return res.status(400).json({ message: "Mã xác thực đã hết hạn!" });
    }

    // Cập nhật trạng thái xác thực
    verifyCode.isVerified = true;
    await verifyCode.save();

    existingUser.status = "active";
    existingUser.save();

    // Tạo JWT token
    const token = jwt.sign(
      {
        id: existingUser._id,
        username: existingUser.username,
        role: existingUser.role,
      },
      SECRET_KEY,
      { expiresIn: "1d" }
    );

    return res.json({
      _id: existingUser._id,
      email: existingUser.email,
      token,
      username: existingUser.username,
      role: existingUser.role,
    });
  } catch (error) {
    console.log("erro", error);
    res.status(500).json({ message: "Lỗi server!", error });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Tài khoản không tồn tại!" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Sai mật khẩu!" });

    if (user.status === "unverified")
      return res
        .status(400)
        .json({ error: "unverified", message: "Tài khoản chưa xác thực!" });

    if (user.status !== "active")
      return res.status(400).json({ message: "Tài khoản không hợp lệ!" });

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      SECRET_KEY,
      { expiresIn: "1d" }
    );

    return res.json({
      _id: user._id,
      email: user.email,
      token,
      username: user.username,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server!", error });
  }
});

app.get("/products", async (req, res) => {
  try {
    const products = await Product.find().populate("category", "name").lean();

    if (!products.length) {
      return res.status(404).json({ message: "Không có sản phẩm nào" });
    }

    res.status(200).json(products);
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm:", error);
    res
      .status(500)
      .json({ message: "Lỗi khi lấy sản phẩm", error: error.message });
  }
});

app.post("/products", verifyToken, async (req, res) => {
  const { name, price, img, categoryId } = req.body;

  if (!name || !price || !img || !categoryId) {
    return res.status(400).json({ message: "Thiếu thông tin sản phẩm" });
  }

  try {
    const category = await Category.findOne({ codeId: categoryId });
    if (!category) {
      return res.status(404).json({ message: "Danh mục không tồn tại" });
    }

    const newProduct = new Product({ name, price, img, category: categoryId });
    await newProduct.save();

    res
      .status(201)
      .json({ message: "Thêm sản phẩm thành công", product: newProduct });
  } catch (error) {
    console.error("Lỗi khi thêm sản phẩm:", error);
    res
      .status(500)
      .json({ message: "Lỗi khi thêm sản phẩm", error: error.message });
  }
});

app.put("/products/:id", verifyToken, async (req, res) => {
  const { name, price, img, categoryId } = req.body;
  const productId = req.params.id;

  if (!name || !price || !img || !categoryId) {
    return res.status(400).json({ message: "Thiếu thông tin sản phẩm" });
  }

  try {
    const [category, updatedProduct] = await Promise.all([
      Category.findOne({ codeId: categoryId }),
      Product.findByIdAndUpdate(
        productId,
        { name, price, img, category: categoryId },
        { new: true, lean: true }
      ),
    ]);

    if (!category) {
      return res.status(404).json({ message: "Danh mục không tồn tại" });
    }
    if (!updatedProduct) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    res.status(200).json({
      message: "Cập nhật sản phẩm thành công",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật sản phẩm:", error);
    res
      .status(500)
      .json({ message: "Lỗi khi cập nhật sản phẩm", error: error.message });
  }
});

app.delete("/products/:id", verifyToken, async (req, res) => {
  const productId = req.params.id;

  try {
    const deletedProduct = await Product.findByIdAndDelete(productId).lean();

    if (!deletedProduct) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    res
      .status(200)
      .json({ message: "Xóa sản phẩm thành công", product: deletedProduct });
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm:", error);
    res
      .status(500)
      .json({ message: "Lỗi khi xóa sản phẩm", error: error.message });
  }
});

app.get("/category", async (req, res) => {
  try {
    const categories = await Category.find().lean();
    console.log("📢 Danh mục từ MongoDB:", categories);
    res.status(200).json(categories);
  } catch (error) {
    console.error("Lỗi khi lấy danh mục:", error);
    res.status(500).json({ error: "Lỗi server", details: error.message });
  }
});

app.post("/category", verifyToken, async (req, res) => {
  try {
    console.log("Dữ liệu nhận được:", req.body); // Debug dữ liệu từ client

    const { name, codeId } = req.body;

    if (!name || !codeId) {
      return res
        .status(400)
        .json({ error: "Tên và mã danh mục không được để trống!" });
    }

    const newCategory = new Category({
      name,
      codeId,
    });

    await newCategory.save();
    res
      .status(201)
      .json({ message: "Thêm danh mục thành công!", category: newCategory });
  } catch (error) {
    console.error("Lỗi khi thêm danh mục:", error);
    res.status(500).json({ error: "Lỗi server", details: error.message });
  }
});

app.put("/category/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, codeId } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ error: "Tên danh mục không được để trống!" });
    }

    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      return res.status(404).json({ error: "Danh mục không tồn tại!" });
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name, codeId },
      { new: true, lean: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ error: "Danh mục không tồn tại!" });
    }

    res.status(200).json({
      message: "Cập nhật danh mục thành công!",
      category: updatedCategory,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật danh mục:", error);
    res.status(500).json({ error: "Lỗi server", details: error.message });
  }
});

app.delete("/category/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({ error: "Danh mục không tồn tại!" });
    }

    res.status(200).json({ message: "Xóa danh mục thành công!", category });
  } catch (error) {
    console.error("Lỗi khi xóa danh mục:", error);
    res.status(500).json({ error: "Lỗi server", details: error.message });
  }
});

app.get("/category-topping", async (req, res) => {
  try {
    const categories = await CategoryTopping.find().lean();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: "Lỗi server", details: error.message });
  }
});

app.post("/category-topping", verifyToken, async (req, res) => {
  try {
    const { nameCategoryTopping, codeToppingId, categoryId } = req.body;

    if (!nameCategoryTopping || !codeToppingId || !categoryId) {
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc!" });
    }

    // Kiểm tra trùng lặp
    const existingCategory = await CategoryTopping.findOne({
      $or: [{ nameCategoryTopping }, { codeToppingId }],
    });

    if (existingCategory) {
      return res
        .status(400)
        .json({ error: "Tên hoặc mã danh mục đã tồn tại!" });
    }

    // Tạo mới
    const newCategoryTopping = new CategoryTopping({
      nameCategoryTopping,
      codeToppingId,
      categoryId,
    });

    await newCategoryTopping.save();

    res.status(201).json({
      message: "Thêm danh mục thành công!",
      categoryTopping: newCategoryTopping,
    });
  } catch (error) {
    console.error("Lỗi khi thêm category topping:", error);
    res.status(500).json({ error: "Lỗi server", details: error.message });
  }
});

app.put("/category-topping/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nameCategoryTopping, codeToppingId, categoryId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID không hợp lệ!" });
    }

    if (!nameCategoryTopping || !codeToppingId || !categoryId) {
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc!" });
    }

    const existingCategory = await CategoryTopping.findById(id);
    if (!existingCategory) {
      return res.status(404).json({ error: "Danh mục không tồn tại!" });
    }

    // Kiểm tra trùng lặp (không tính chính nó)
    const duplicateCategory = await CategoryTopping.findOne({
      $or: [{ nameCategoryTopping }, { codeToppingId }],
      _id: { $ne: id },
    });

    if (duplicateCategory) {
      return res
        .status(400)
        .json({ error: "Tên hoặc mã danh mục đã tồn tại!" });
    }

    existingCategory.nameCategoryTopping = nameCategoryTopping;
    existingCategory.codeToppingId = codeToppingId;
    existingCategory.categoryId = categoryId;

    await existingCategory.save();

    res.status(200).json({
      message: "Cập nhật thành công!",
      categoryTopping: existingCategory,
    });
  } catch (error) {
    console.error("Lỗi cập nhật category topping:", error);
    res.status(500).json({ error: "Lỗi server", details: error.message });
  }
});

app.delete("/category-topping/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID không hợp lệ!" });
    }

    const deletedCategoryTopping = await CategoryTopping.findByIdAndDelete(id);

    if (!deletedCategoryTopping) {
      return res.status(404).json({ error: "Danh mục không tồn tại!" });
    }

    res
      .status(200)
      .json({ message: "Xóa thành công!", id: deletedCategoryTopping._id });
  } catch (error) {
    console.error("Lỗi khi xóa category topping:", error);
    res.status(500).json({ error: "Lỗi server", details: error.message });
  }
});

app.get("/topping", async (req, res) => {
  try {
    const toppings = await Topping.find()
      .populate("categoryToppingId", "nameCategoryTopping")
      .lean();

    res.status(200).json(toppings);
  } catch (error) {
    res.status(500).json({ error: "Lỗi server", details: error.message });
  }
});

app.post("/topping", verifyToken, async (req, res) => {
  try {
    const { nameTopping, priceTopping, categoryToppingId } = req.body;

    if (!nameTopping || !priceTopping || !categoryToppingId) {
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc!" });
    }

    // Kiểm tra trùng nameTopping và categoryToppingId cùng lúc
    const existingTopping = await Topping.findOne({
      nameTopping,
      categoryToppingId,
    });

    if (existingTopping) {
      return res.status(400).json({
        error: "Topping với tên này đã tồn tại trong danh mục này!",
      });
    }

    const newTopping = await Topping.create({
      nameTopping,
      priceTopping,
      categoryToppingId,
    });

    res
      .status(201)
      .json({ message: "Thêm topping thành công!", topping: newTopping });
  } catch (error) {
    res.status(500).json({ error: "Lỗi server", details: error.message });
  }
});

app.put("/topping/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nameTopping, priceTopping, categoryToppingId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID không hợp lệ!" });
    }

    const existingTopping = await Topping.findById(id);
    if (!existingTopping) {
      return res.status(404).json({ error: "Topping không tồn tại!" });
    }

    // Kiểm tra trùng nameTopping và categoryToppingId (không tính chính nó)
    const duplicateTopping = await Topping.findOne({
      nameTopping,
      categoryToppingId,
      _id: { $ne: id },
    });

    if (duplicateTopping) {
      return res.status(400).json({
        error: "Topping với tên này đã tồn tại trong danh mục này!",
      });
    }

    existingTopping.nameTopping = nameTopping;
    existingTopping.priceTopping = priceTopping;
    existingTopping.categoryToppingId = categoryToppingId;

    await existingTopping.save();

    res
      .status(200)
      .json({ message: "Cập nhật thành công!", topping: existingTopping });
  } catch (error) {
    res.status(500).json({ error: "Lỗi server", details: error.message });
  }
});

app.delete("/topping/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID không hợp lệ!" });
    }

    const deletedTopping = await Topping.findByIdAndDelete(id);

    if (!deletedTopping) {
      return res.status(404).json({ error: "Topping không tồn tại!" });
    }

    res
      .status(200)
      .json({ message: "Xóa thành công!", id: deletedTopping._id });
  } catch (error) {
    res.status(500).json({ error: "Lỗi server", details: error.message });
  }
});

app.get("/cart/:userId", verifyToken, async (req, res) => {
  try {
      const cart = await Cart.findOne({ userId: req.params.userId });
      if (!cart) return res.status(404).json({ message: "Cart not found" });
      res.json(cart);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});

app.post("/cart/:userId",verifyToken, async (req, res) => {
  try {
      const { productId, name, price, img, quantity, size, toppings, iceLevel, sugarLevel } = req.body;
      
      if (!productId || quantity <= 0) 
          return res.status(400).json({ message: "Invalid product data" });

      let cart = await Cart.findOne({ userId: req.params.userId });

      if (!cart) {
          cart = new Cart({ userId: req.params.userId, items: [] });
      }

      const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId.toString());
      if (itemIndex > -1) {
          cart.items[itemIndex].quantity += quantity;
      } else {
          cart.items.push({ productId, name, price, img, quantity, size, toppings, iceLevel, sugarLevel });
      }

      await cart.save();
      res.status(201).json(cart);
  } catch (error) {
      console.error("Lỗi Backend:", error);
      res.status(500).json({ message: error.message });
  }
});

app.put("/cart/:userId",verifyToken, async (req, res) => {
  try {
      const { productId, size, toppings, iceLevel, sugarLevel, quantity } = req.body;
      if (!productId || quantity < 0) return res.status(400).json({ message: "Invalid data" });

      const cart = await Cart.findOne({ userId: req.params.userId });
      if (!cart) return res.status(404).json({ message: "Cart not found" });

      // Tìm sản phẩm đúng thuộc tính
      const itemIndex = cart.items.findIndex(item =>
          item.productId.toString() === productId &&
          item.size === size &&
          JSON.stringify(item.toppings) === JSON.stringify(toppings) &&
          item.iceLevel === iceLevel &&
          item.sugarLevel === sugarLevel
      );

      if (itemIndex > -1) {
          if (quantity === 0) {
              cart.items.splice(itemIndex, 1); // Xóa sản phẩm nếu quantity = 0
          } else {
              cart.items[itemIndex].quantity = quantity;
          }
      } else {
          return res.status(404).json({ message: "Product not found in cart" });
      }

      await cart.save();
      res.json(cart);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});

app.delete("/cart/:userId/:productId", verifyToken, async (req, res) => {
  try {
      const { size, toppings, iceLevel, sugarLevel } = req.body;

      const cart = await Cart.findOne({ userId: req.params.userId });
      if (!cart) return res.status(404).json({ message: "Cart not found" });

      cart.items = cart.items.filter(item =>
          !(item.productId.toString() === req.params.productId &&
            item.size === size &&
            JSON.stringify(item.toppings) === JSON.stringify(toppings) &&
            item.iceLevel === iceLevel &&
            item.sugarLevel === sugarLevel)
      );

      await cart.save();
      res.json(cart);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});

app.get("/testaaa", verifyToken, async (req, res) => {
  try {
    // Your test logic here
    res.json({ message: "Test route is working" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/category/:categoryId/topping", async (req, res) => {
  try {
    const { categoryId } = req.params;

    console.log("🔍 Category ID:", categoryId);

    // Kiểm tra danh mục có tồn tại không
    const category = await Category.findById(categoryId);
    if (!category) {
      console.log("❌ Không tìm thấy danh mục");
      return res.status(404).json({ error: "Danh mục sản phẩm không tồn tại" });
    }

    console.log("✅ Danh mục tìm thấy:", category);

    // Lấy danh sách topping trong CategoryTopping
    const categoryToppings = await CategoryTopping.find({ categoryId });

    console.log("🍩 Danh sách topping:", categoryToppings);
    res.status(200).json(categoryToppings);
  } catch (error) {
    console.error("❌ Lỗi server:", error.message);
    res.status(500).json({ error: "Lỗi server", details: error.message });
  }
});

app.post("/category/:categoryId/topping", async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, codeToppingId } = req.body;

    // Kiểm tra danh mục có tồn tại không
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: "Danh mục sản phẩm không tồn tại" });
    }

    // Tạo danh mục topping mới
    const newCategoryTopping = new CategoryTopping({
      name,
      codeToppingId,
      categoryId,
    });

    await newCategoryTopping.save();
    res.status(201).json({
      message: "Thêm danh mục topping thành công!",
      categoryTopping: newCategoryTopping,
    });
  } catch (error) {
    res.status(500).json({ error: "Lỗi server", details: error.message });
  }
});

app.put("/category/:categoryId/topping/:toppingId", async (req, res) => {
  try {
    const { categoryId, toppingId } = req.params;
    const { name, codeToppingId } = req.body;

    // Kiểm tra xem danh mục có tồn tại không
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: "Danh mục sản phẩm không tồn tại" });
    }

    // Kiểm tra danh mục topping có tồn tại không
    const categoryTopping = await CategoryTopping.findOne({
      _id: toppingId,
      categoryId,
    });
    if (!categoryTopping) {
      return res.status(404).json({
        error: "Danh mục topping không tồn tại trong danh mục sản phẩm này",
      });
    }

    // Cập nhật danh mục topping
    categoryTopping.name = name || categoryTopping.name;
    categoryTopping.codeToppingId =
      codeToppingId || categoryTopping.codeToppingId;
    await categoryTopping.save();

    res.status(200).json({
      message: "Cập nhật danh mục topping thành công!",
      categoryTopping,
    });
  } catch (error) {
    res.status(500).json({ error: "Lỗi server", details: error.message });
  }
});

app.delete("/category/:categoryId/topping/:toppingId", async (req, res) => {
  try {
    const { categoryId, toppingId } = req.params;

    // Kiểm tra xem danh mục có tồn tại không
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: "Danh mục sản phẩm không tồn tại" });
    }

    // Kiểm tra xem danh mục topping có tồn tại không
    const categoryTopping = await CategoryTopping.findOne({
      _id: toppingId,
      categoryId,
    });
    if (!categoryTopping) {
      return res.status(404).json({
        error: "Danh mục topping không tồn tại trong danh mục sản phẩm này",
      });
    }

    // Xóa tất cả topping liên quan nếu cần
    await Topping.deleteMany({ categoryToppingId: toppingId });

    // Xóa danh mục topping
    await CategoryTopping.deleteOne({ _id: toppingId });

    res.status(200).json({ message: "Xóa danh mục topping thành công!" });
  } catch (error) {
    res.status(500).json({ error: "Lỗi server", details: error.message });
  }
});

app.listen(8000, () => console.log("Server 8000 "));
