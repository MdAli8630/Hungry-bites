
const mongoose = require("mongoose")

const WishlistSchema = new mongoose.Schema({
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

var Wishlist = new mongoose.model("Whislist",WishlistSchema);
module.exports = Wishlist;





