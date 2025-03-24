import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  codeId:{
    type: String,
    required: true,
    unique: true,
  },

}, { timestamps: false,    collection: "category",   }); 


const Category = mongoose.model("Category", categorySchema, "Category");

export default Category;
