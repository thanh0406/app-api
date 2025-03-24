import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
            name: { type: String, required: true },
            price: { type: Number, required: true },
            img: { type: String, required: true },
            quantity: { type: Number, required: true, default: 1 },
            size: { type: String, required: true, default: "M" },
            toppings: [
                {
                    toppingId: { type: mongoose.Schema.Types.ObjectId, ref: "Topping" },
                    name: { type: String, required: true },
                    price: { type: Number, required: true }
                }
            ],
            iceLevel: { type: String, required: true, default: "100%" },
            sugarLevel: { type: String, required: true, default: "100%" }
        }
    ]
});

const Cart = mongoose.model("Cart", cartSchema, "Cart");

export default Cart;
