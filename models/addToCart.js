
const mongoose = require("mongoose")

const AddToCartSchema = new mongoose.Schema({
    user_id:{
        type: 'ObjectId',
        ref: 'AdminLogin',
    },
   product:[
   {
    product_id:{
        type: 'ObjectId',
        ref: 'Product',
     },
     product_quantity:{
           type:Number
     }
   }
   ]

})

var AddToCart = new mongoose.model("AddToCart",AddToCartSchema);
module.exports = AddToCart;





