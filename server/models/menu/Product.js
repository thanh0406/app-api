import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    img: { type: String, required: true },
    category: {type: String,required: true,}
}, { collection: "products",  timestamps: true });

const Product = mongoose.model("Product", productSchema, "Product");

export default Product;
