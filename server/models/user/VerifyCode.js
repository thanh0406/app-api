import mongoose from "mongoose";

// Tạo schema cho VerifyCode
const verifyCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true, // Đảm bảo mã code là duy nhất
    },
    email: {
      type: String,
      required: true,
      lowercase: true, // Đảm bảo email luôn ở dạng chữ thường
    },
    isVerified: {
      type: Boolean,
      default: false, // Mặc định là chưa được xác thực
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true, // Tự động tạo các trường createdAt, updatedAt
  }
);

// Tạo model từ schema
const VerifyCode = mongoose.model("VerifyCode", verifyCodeSchema);

export default VerifyCode;
