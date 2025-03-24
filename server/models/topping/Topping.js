import mongoose from "mongoose";

const toppingSchema = new mongoose.Schema({
  nameTopping: { type: String, required: true }, 
  priceTopping: { type: Number, required: true },
  categoryToppingId: {  
    type: mongoose.Schema.Types.ObjectId,
    ref: "CategoryTopping",
    required: true
  }
},
{ collection: "topping",  timestamps: true });

const Topping = mongoose.model("Topping", toppingSchema, "Topping");

export default Topping;

