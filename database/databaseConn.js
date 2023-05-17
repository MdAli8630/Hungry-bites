var mongoose = require("mongoose")
mongoose.connect("mongodb://localhost:27017/Capture")
.then(()=>{
    console.log("DataBase is Connected ")
})

.catch((error)=>{
    console.log(error)
})

module.exports=mongoose;