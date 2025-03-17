import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectDB from "./server/db.js";
import Category from "./server/models/menu/Category.js";
import Product from "./server/models/menu/Product.js"
import User from "./server/models/user/User.js";
import Topping from "./server/models/topping/Topping.js";
import CategoryTopping from "./server/models/topping/CategoryTopping.js";
import mongoose from "mongoose";




const app = express();
app.use(express.json());
connectDB();
app.use(cors());
const SECRET_KEY = "login";




app.post("/api/register", async (req, res) => {
  try {
    const { email, username, password, role } = req.body;

    const existingUser = await User.findOne({ email: email });

    if (existingUser) return res.status(400).json({ message: "Tài khoản đã tồn tại!" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ email, username, password: hashedPassword, role, status: "disable" })

    await newUser.save();
    res.json({ message: "Đăng ký thành công!" });
  } catch (error) {
    console.log("error", error)
    res.status(500).json({ message: "Lỗi server!", error });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Tài khoản không tồn tại!" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Sai mật khẩu!" });

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role }, 
      SECRET_KEY, 
      { expiresIn: "1h" }
    );

    res.json({ token, username: user.username, role: user.role });
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
    res.status(500).json({ message: "Lỗi khi lấy sản phẩm", error: error.message });
  }
});

app.post("/products", async (req, res) => {
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

    res.status(201).json({ message: "Thêm sản phẩm thành công", product: newProduct });
  } catch (error) {
    console.error("Lỗi khi thêm sản phẩm:", error);
    res.status(500).json({ message: "Lỗi khi thêm sản phẩm", error: error.message });
  }
});

app.put("/products/:id", async (req, res) => {
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
      )
    ]);

    if (!category) {
      return res.status(404).json({ message: "Danh mục không tồn tại" });
    }
    if (!updatedProduct) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    res
      .status(200)
      .json({ message: "Cập nhật sản phẩm thành công", product: updatedProduct });
  } catch (error) {
    console.error("Lỗi khi cập nhật sản phẩm:", error);
    res.status(500).json({ message: "Lỗi khi cập nhật sản phẩm", error: error.message });
  }
});

app.delete("/products/:id", async (req, res) => {
  const productId = req.params.id;

  try {
    const deletedProduct = await Product.findByIdAndDelete(productId).lean();

    if (!deletedProduct) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    res.status(200).json({ message: "Xóa sản phẩm thành công", product: deletedProduct });
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm:", error);
    res.status(500).json({ message: "Lỗi khi xóa sản phẩm", error: error.message });
  }
});

app.get("/category", async (req, res) => {
  try {
    const categories = await Category.find().lean();
    res.status(200).json(categories);
  } catch (error) {
    console.error("Lỗi khi lấy danh mục:", error);
    res.status(500).json({ error: "Lỗi server", details: error.message });
  }
});

app.post("/category", async (req, res) => {
  try {
    console.log("Dữ liệu nhận được:", req.body); // Debug dữ liệu từ client

    const { name, codeId } = req.body;

    if (!name || !codeId) {
      return res.status(400).json({ error: "Tên và mã danh mục không được để trống!" });
    }
    
    const newCategory = new Category({
      name,
      codeId,

    });

    await newCategory.save();
    res.status(201).json({ message: "Thêm danh mục thành công!", category: newCategory });
  } catch (error) {
    console.error("Lỗi khi thêm danh mục:", error);
    res.status(500).json({ error: "Lỗi server", details: error.message });
  }
});

app.put("/category/:id", async (req, res) => {
  try {
    const { id } = req.params; 
    const { name, codeId } = req.body; 

    if (!name) {
      return res.status(400).json({ error: "Tên danh mục không được để trống!" });
    }

    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      return res.status(404).json({ error: "Danh mục không tồn tại!" });
    }
    
    const updatedCategory = await Category.findByIdAndUpdate(id, { name, codeId }, { new: true, lean: true });
    
    if (!updatedCategory) {
      return res.status(404).json({ error: "Danh mục không tồn tại!" });
    }

    res.status(200).json({ message: "Cập nhật danh mục thành công!", category: updatedCategory });
  } catch (error) {
    console.error("Lỗi khi cập nhật danh mục:", error);
    res.status(500).json({ error: "Lỗi server", details: error.message });
  }
});

app.delete("/category/:id", async (req, res) => {
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

app.post("/category-topping", async (req, res) => {
  try {
    const { name, codeToppingId } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!name || !codeToppingId) {
      return res.status(400).json({ error: "Tên và mã danh mục không được để trống!" });
    }

    // Kiểm tra trùng lặp
    const existingCategory = await CategoryTopping.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ error: "Tên danh mục đã tồn tại!" });
    }

    // Tạo danh mục mới
    const newCategoryTopping = await CategoryTopping.create({ name, codeToppingId });
    return res.status(201).json({ message: "Thêm danh mục thành công!", categoryTopping: newCategoryTopping });

  } catch (error) {
    console.error("Lỗi khi thêm category topping:", error);
    return res.status(500).json({ error: "Lỗi server", details: error.message });
  }
});

app.put("/category-topping/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, codeToppingId } = req.body;

    // Kiểm tra ID hợp lệ
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID không hợp lệ!" });
    }

    // Kiểm tra dữ liệu đầu vào
    if (!name || !codeToppingId) {
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc!" });
    }

    // Kiểm tra xem danh mục có tồn tại không
    const existingCategory = await CategoryTopping.findById(id);
    if (!existingCategory) {
      return res.status(404).json({ error: "Danh mục không tồn tại!" });
    }

    // Cập nhật danh mục
    existingCategory.name = name;
    existingCategory.codeToppingId = codeToppingId;
    await existingCategory.save();

    return res.status(200).json({ message: "Cập nhật thành công!", categoryTopping: existingCategory });

  } catch (error) {
    console.error("Lỗi cập nhật category topping:", error);
    return res.status(500).json({ error: "Lỗi server", details: error.message });
  }
});

app.delete("/category-topping/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra ID hợp lệ
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID không hợp lệ!" });
    }

    // Kiểm tra danh mục có tồn tại không
    const deletedCategoryTopping = await CategoryTopping.findByIdAndDelete(id);

    if (!deletedCategoryTopping) {
      return res.status(404).json({ error: "Danh mục không tồn tại!" });
    }

    return res.status(200).json({ message: "Xóa thành công!", id: deletedCategoryTopping._id });

  } catch (error) {
    console.error("Lỗi khi xóa category topping:", error);
    return res.status(500).json({ error: "Lỗi server", details: error.message });
  }
});

app.get("/topping", async (req, res) => {
  try {
    const toppings = await Topping.find().populate("codeToppingId", "name").lean();
    res.status(200).json(toppings);
  } catch (error) {
    res.status(500).json({ error: "Lỗi server", details: error.message });
  }
});

app.post("/topping", async (req, res) => {
  try {
    const { name, price, img, codeToppingId } = req.body;

    if (!name || !img || !price || !codeToppingId) {
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc!" });
    }

    const newTopping = await Topping.create({ name, price, img, codeToppingId });
    res.status(201).json({ message: "Thêm topping thành công!", topping: newTopping });

  } catch (error) {
    res.status(500).json({ error: "Lỗi server", details: error.message });
  }
});

app.put("/topping/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, img, codeToppingId } = req.body;

    const updatedTopping = await Topping.findByIdAndUpdate(
      id,
      { name, price, img, codeToppingId },
      { new: true, lean: true }
    );

    if (!updatedTopping) {
      return res.status(404).json({ error: "Topping không tồn tại!" });
    }

    res.status(200).json({ message: "Cập nhật thành công!", topping: updatedTopping });

  } catch (error) {
    res.status(500).json({ error: "Lỗi server", details: error.message });
  }
});

app.delete("/topping/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTopping = await Topping.findByIdAndDelete(id);

    if (!deletedTopping) {
      return res.status(404).json({ error: "Topping không tồn tại!" });
    }

    res.status(200).json({ message: "Xóa thành công!", topping: deletedTopping });

  } catch (error) {
    res.status(500).json({ error: "Lỗi server", details: error.message });
  }
});






app.listen(5000, () => console.log("Server 5000 "));
