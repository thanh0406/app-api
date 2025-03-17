import { connect } from "mongoose";

const connectDB = async () => {
  try {
    await connect("mongodb+srv://vythanh2004:1234@admin-api.gqj4v9a.mongodb.net/admin-api?retryWrites=true&w=majority&appName=admin-api", {
    });
    console.log("✅ MongoDB is connect");
  } catch (error) {
    console.error("❌ Lỗi kết nối MongoDB:", error);
  }
};

export default connectDB;
