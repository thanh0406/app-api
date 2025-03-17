import mongoose from "mongoose";

const toppingSchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  price: { type: Number, required: true },
  img: { type: String, required: true },
  codeToppingId: { type: String, required: true }
},
{ collection: "topping",  timestamps: true });

const Topping = mongoose.model("Topping", toppingSchema, "Topping");

export default Topping;

