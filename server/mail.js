import nodemailer from 'nodemailer';
import dotenv from "dotenv";
dotenv.config();
// const MAIL_PASS = process.env.MAIL_PASS;


// Cấu hình Nodemailer với Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',  // Sử dụng Gmail service
  auth: {
    user: 'myappwater123@gmail.com',  // Địa chỉ email Gmail của bạn
    pass: "ewug xykw mnrr pufo",  // Mật khẩu Gmail hoặc mật khẩu ứng dụng (nếu bạn bật xác thực 2 yếu tố)
  },
});

export const sendEmail = async (mail, title, content) => {
  // Cấu hình email gửi đi
  const mailOptions = {
    from: 'myappwater123@gmail.com', // Địa chỉ email người gửi
    to: mail, // Địa chỉ email người nhận
    subject: title, // Tiêu đề email
    text: content, // Nội dung email
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log('Email đã được gửi thành công!');
  } catch (error) {
    console.error('Lỗi khi gửi email:', error);
  }
};
