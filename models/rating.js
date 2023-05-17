
const mongoose = require("mongoose")

const RatingSchema = new mongoose.Schema({
    product_id:{
        type:String
    },
    menu_item_id:{
          type:String
     },
     rating:{
        type:String
      },
      user_id:{
        type:String
      },

})

var Rating = new mongoose.model("Rating",RatingSchema);
module.exports = Rating;





