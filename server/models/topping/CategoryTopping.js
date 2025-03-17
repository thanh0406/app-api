import mongoose from "mongoose";

const categorytoppingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  codeToppingId:{
    type: String,
    required: true,
    unique: true,
  }
}, { timestamps: false,    collection: "categoryTopping",   }); 


const CategoryTopping = mongoose.model("CategoryTopping", categorytoppingSchema, "CategoryTopping");

export default CategoryTopping;
