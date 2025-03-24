import mongoose from "mongoose";

const categorytoppingSchema = new mongoose.Schema({
  nameCategoryTopping: {
    type: String,
    required: true,
    unique: true,
  },
  codeToppingId:{
    type: String,
    required: true,
    unique: true,
  },
  categoryId: {  
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Category"
  }
}, { timestamps: false,    collection: "categoryTopping",   }); 

const CategoryTopping = mongoose.model("CategoryTopping", categorytoppingSchema, "CategoryTopping");

export default CategoryTopping;
