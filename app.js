const express = require('express')
const app = express()
const bodyParser = require("body-parser");
const cors = require("cors");
//var bcrypt = require('bcryptjs');
require("./database/databaseConn")
const AdminLogin = require("./models/adminLogin")
const Products = require("./models/product")
const Category = require("./models/category")
const MenuItem = require("./models/metuItem")
const Rating = require("./models/rating")
const AddToCart = require("./models/addToCart")
const Wishlist = require("./models/wishlist")
const multer = require("multer");
//const fs = require("fs");
const path = require("path");
app.use(cors());
 app.use(bodyParser.urlencoded({ extended: false }));
 app.use(bodyParser.json({ limit: '50mb' }))
 //app.use(express.json({limit: '50mb'}));

app.get("/owner",(req,res)=>{
    res.send("Hello World")
})
//////////////////////////////////////////

const fs = require("fs");

/////////////////////////////////////////////////////////////////////
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images')
    },
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})



///--------------------------   -POST Request API BOX --   ------------------------------//
 
//user signup 
app.post("/signup", async (req, res) => {
    const {name,username,email, password,type} = req.body
    if (!name  || !email || !password || !type ) {
       return res.status(301).json({ message: "Please require all field" })
    }
    try {
        const findUser = await AdminLogin.findOne({ email: email })
        if (findUser) {
            return res
                .status(422)
                .json({ message: " username already exists" });
        }
        const user = await new AdminLogin({name, username,email, password,type })
        if(type!=="user"){
            return res
            .status(422)
            .json({ message: "Invalid Type" });
        }
        const userRegister = await user.save()
        if (userRegister) {
            res.status(201).json({ data: user, message: "User Signup successfully" });
        }
    } catch (err) {
       res.status(400).send(err)
    }

})

//login
app.post("/login",async(req,res)=>{
   const {email,password} = req.body;
    if(!req.body.email ||!req.body.password ){
       return res.status(301).json({message:"Please fill username/password" })
    }
    try{
           const category = await Category.find({})
        const data = await AdminLogin.findOne({ email:email}).populate('product_id')
              if(data){
               // var match =await  bcrypt.compare(password,data.password)
                    if(password===data.password){
                        res.status(201).send({data:data,
                             message: "Login Successfully ", 
                            // data:{ type:data?.type, 
                            //     name:data.name,
                            //     username:data.username,
                            //     email:data.email,
                            //     _id:data?._id,
                            //     // all_category:result,
                            //     product_id:data?.product_id?._id?data?.product_id?._id:"",
                            //     product_name:data?.product_id?.name,
                            //     product_status:data?.product_id?.status
                            // }
                          
                        })
                    }else{
                        res.send({ message: "password  didn't match" })
                    }

              }else{
                res.status(302).send({ message: "User not register " })
              }
    }
    catch(error){
        res.status(400).send(error.message)
    }
})

//update password method
 app.post("/update_password",async(req,res)=>{
     try{
         const email = req.body.email
          const  password = req.body.password
   
          const data = await AdminLogin.findOne({email:email})
            if(data){

            const adminData =  await AdminLogin.findOneAndUpdate({email:email},{$set:{
                password:password
               }})
               res.status(201).send({success:true,message:"Password has been Updated!"})
            }else{
                res.status(201).send({success:false,message:"Owner Id Not found!"})
            }
     }catch(error){
         res.status(400).send(error.message)
     }
 })

 
//Product
app.post("/products",async(req,res)=>{
       const {name,email,password,type,Category_type,
        subscription,address,phone_no,cat_id,status,sort_order,
        shop_name,city,land_mark,opening_day,opening_time,
        closing_time,profile
    } = req.body;
       if(!name ||!email|| !password ||!type || !Category_type || !subscription || !address || !phone_no || !cat_id || !status || !sort_order || !shop_name || !city || !land_mark || !opening_day || !opening_time || !closing_time){
       return res.status(301).json({message:"Please all field required" })
       }
       try{
         const upload = multer({ storage: storage }).array("profile")
        upload(req, res, function(err) {
            console.log("File uploaded");
        
        })
        let buffer;
        let arr1 =[]
        if(req.body.profile){
           await  req.body.profile.forEach((profile,index,arr)=>{
                 buffer =profile && Buffer.from(profile, "base64");
                arr1.push(buffer)
             })
         }
         let imageList=[];
            if(type!=="admin"){
                return res
                .status(422)
                .json({ message: "Invalid Type" });
            }
         await  arr1.forEach((profile,index,arr)=>{
               const date = new Date()
               let ms = date.getMilliseconds();
                const imageName=profile?"hungry_bites"+ms+index+".png" : null
               
                imageList.push(imageName)
                profile && fs.writeFile(`public/images/${imageName}`, profile, "base64", function(err) {
                   console.log(err); 
                 });
            })

           const data = await new Products({name,Category_type,address,phone_no,cat_id,status,sort_order,
            shop_name,city,land_mark,opening_day,opening_time,closing_time,profile:imageList})
              const category = await Category.findById(cat_id)
              await category?.product_id?.push(data)
const productId = data._id;
console.log("====>",productId)
            const findUser = await AdminLogin.findOne({ email: email })
        if (findUser) {
            return res
                .status(422)
                .json({ message: " username already exists" });
        }
                await data.save((err)=>{
                     if(!err){
                         res.status(201).send({message:"Product Added Succesfully",products:data})
                          const admins = new AdminLogin({name,email,cat_id,password,type,subscription,status,products_id:productId})
                          
                          admins.save()
                           
                     }else{
                         res.send(err)
                     }
                 })

                  await category?.save()
       }catch(error){
          res.status(400).send(error.message)
       }
})

app.use('/category', express.static('public/images'));
//Category
   app.post("/category",async(req,res)=>{
   

          const {name,status,profile}=req.body
        
           if(!name || !status || !profile){
            return res.status(301).json({message:"Please all field required" })
           }
        const upload = multer({ storage: storage }).single("profile")
        upload(req, res, function(err) {
            console.log("File uploaded");
            //res.end('File is uploaded')
        })
        const buffer = profile && Buffer.from(profile, "base64");
        //    }
           try{
            const date = new Date()
            let ms = date.getMilliseconds();
             const imageName=profile? "hungry_bites"+ms+".jpg": null
             profile && fs.writeFile(`public/images/${imageName}`, buffer, "base64", function(err) {
                console.log(err); 
              });
               const category= await new Category({name,status,profile:imageName})
               await category.save((err) => {
                if (err) {
                    res.send(err)
                } else {
                    res.status(201).json({message:"Category Added Successfully",data:category})
                }
            })

           }catch(err){
               res.send(err.message)
           }
})

//Menu Item for product
app.post("/menu_item",async(req,res)=>{
    const {item_name,item_details,price,discount,profile,product_id,cat_id} = req.body
            if(!item_name || !item_details || !price || !product_id || !cat_id){
                return res.status(301).json({message:"Please all field required" })
            }
            const upload = multer({ storage: storage }).single("profile")
            upload(req, res, function(err) {
                console.log("File uploaded");
            })
            const buffer =profile && Buffer.from(profile, "base64");

    try{

        const date = new Date()
        let ms = date.getMilliseconds();
         const imageName= profile? "hungry_bites"+ms+".jpg" : null
         profile && fs.writeFile(`public/images/${imageName}`, buffer, "base64", function(err) {
            console.log(err);
          });
        const menuItem = await new MenuItem({item_name,item_details,price,discount,profile:imageName,product_id,cat_id})
         const product = await Products.findById(product_id)
            await product?.menu_item?.push(menuItem)
            await product?.keywords?.push(item_name)

           await menuItem.save((err)=>{
                if(err){
                    res.status(400).send(err)
                }else{
                    res.status(201).send({message:"MenuItem Added Successfully",data:menuItem})
                }
            })

           await product?.save()

    }catch(error){
        res.status(400).send(error)
    }
})

//Rating
app.post("/rating",async(req,res)=>{
    const {product_id,menu_item_id,rating,user_id}=req.body;
           try{
               const data = await new Rating({product_id,menu_item_id,rating,user_id})
                  const product = await Products.findById(product_id)
                       await product?.rating?.push(data)
                       
                       const menuItem = await MenuItem.findById(menu_item_id)
                       await menuItem?.rating?.push(data)
                                     
                   
               await data.save((err)=>{
                if(err){
                    res.status(400).send(err.message)
                }else{
                    res.status(201).send({message:"Rating Added Successfully",data:data})
                }
            })
            await product?.save()
            await menuItem?.save()

           }catch(error){
               res.status(400).send(error.message)
           }
})

//add To Cart
app.post("/add-to-cart",async(req,res)=>{
    const {user_id,product}=req.body;

    try{
    const data = await AddToCart.findOne({user_id:user_id})
      if(data){

      const adminData =  await AddToCart.findOneAndUpdate({user_id:user_id},{$set:{
        product:product
         }})
         res.status(201).send({success:true,message:"Product has been Updated!"})
      }else{
        const addToCart = await new AddToCart({user_id,product})
        const user = await AdminLogin.findById(user_id)
        await user?.add_to_cart?.push(addToCart)
  
        await addToCart.save((err)=>{
          if(err){
              res.status(400).send(err.message)
          }else{
              res.status(201).send({message:"Add To Cart Successfully",addToCart:addToCart})
          }
      })
  
      await user?.save()
      }  
      }catch(err){
        res.status(400).send(err.message)
      }
})

//--------------------wishlist--------------------
app.post("/wishlist",async(req,res)=>{
    const {user_id,product}=req.body;

    try{
    const data = await Wishlist.findOne({user_id:user_id})
      if(data){

      const adminData =  await Wishlist.findOneAndUpdate({user_id:user_id},{$set:{
        product:product
         }})
         res.status(201).send({success:true,message:"Wishlist has been Updated!"})
      }else{
        const wishlist = await new Wishlist({user_id,product})
        // const user = await AdminLogin.findById(user_id)
        // await user?.add_to_cart?.push(addToCart)
        await wishlist.save((err)=>{
          if(err){
              res.status(400).send(err.message)
          }else{
              res.status(201).send({message:"Add Wishlist Successfully",wishlist:wishlist})
          }
      })
  
    //   await user?.save()
      }  
      }catch(err){
        res.status(400).send(err.message)
      }
})

//--------------------------------------------------Get Request API BOX ------------------------------------->
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  app.get("/find-wishlist/:id",async(req,res)=>{
    try{
        // const id = req.params.id
        const result = await Wishlist.find({"user_id":req.params.id}).populate('product.product_id')
             res.status(201).send({data:result})
          }catch(error){
        res.status(400).send(error.message)
    }
  })

app.get("/user_find-add-to-cart/:id",async(req,res)=>{

    try{
        // const id = req.params.id
        const result = await AddToCart.find({"user_id":req.params.id}).populate('product.product_id')
   console.log(">>>>result",result)
             res.status(201).send({data:result})

    }catch(error){
        res.status(400).send(error)
    }
})

//single find add to cart
app.get("/find-single-add-tocart/:id",async(req,res)=>{
    try{
         const id = req.params.id
        const result = await AddToCart.findById(id).populate('product.product_id')
   console.log(">>>>result",result)
             res.status(201).send({data:result})

    }catch(error){
        res.status(400).send(error)
    }
})
//all fetch add to cart
app.get("/find-all-add-tocart",async(req,res)=>{
    try{
         //const id = req.params.id
        const result = await AddToCart.find({}).populate('product.product_id')
   console.log(">>>>result",result)
             res.status(201).send({data:result})

    }catch(error){
        res.status(400).send(error)
    }
})
////////////////////////////////////////////////////////////////////////////////////////////////////////////
//-------------------------------------------
const imagerurl=['public/images/image_2022_12_12T06_13_21_468Z.png','public/images/image_2022_12_12T06_13_21_468Z.png','public/images/image_2022_12_12T06_10_15_814Z.png']
app.get("/icon",(req,res)=>{
 res.send(imagerurl)
})
//get category----
app.get("/find-category",async(req,res)=>{

    try{
        const findCategory = await Category.find({}).populate('product_id')
             res.status(201).send({data:findCategory})

    }catch(error){
        res.status(400).send(error)
    }
})
// get category with Id
app.get("/find-category/:id",async(req,res)=>{

    try{
        const id = req.params.id
        const findCategory = await Category.findById(id).populate('product_id')
        console.log("-findCategory-->",findCategory)
             res.status(201).send({data:findCategory})

    }catch(error){
        res.status(400).send(error)
    }
})

// get product-----
app.get("/find-products",async(req,res)=>{
    try{
        const findProduct = await Products.find({}).populate('menu_item')
        res.status(201).send({data:findProduct})

    }catch(error){
        res.status(400).send(error)
    }
})
//get product----- with Id
app.get("/find-products/:id",async(req,res)=>{
    try{
        const id = req.params.id
        const findProduct = await Products.findById(id).populate('menu_item')
        res.status(201).send({data:findProduct})

    }catch(error){
        res.status(400).send(error)
    }
})

//get Menu Items ------
  app.get("/find-menuItem",async(req,res)=>{
    try{
        const findMenuItem = await MenuItem.find({})
        res.status(201).send({data:findMenuItem})

    }catch(error){
        res.status(400).send(error)
    }
})

//get Menu Items ------with id
app.get("/find-menuItem/:id",async(req,res)=>{
    try{

        const id = req.params.id
        const findMenuItem = await MenuItem.findById(id).populate('')
        res.status(201).send({data:findMenuItem})

    }catch(error){
        res.status(400).send(error)
    }
})
//------------------------------------------- Update Request API BOX ----------------------------------------->>>

//Update Category
app.post("/update-category",async(req,res)=>{
    try{
        const {name,status,profile}=req.body
           const cat_id = req.body.cat_id
         
           const buffer =profile && Buffer.from(profile, "base64");
            const date = new Date()
               let ms = date.getMilliseconds();
                const imageName=profile?"hungry_bites"+ms+".jpg":null
                profile && fs.writeFile(`public/images/${imageName}`, buffer, "base64", function(err) {
                   console.log(err); 
                 });

        const data = await Category.findById({_id:cat_id})
             profile &&  fs.unlink("public/images/" + data.profile, (err) => {
                console.log(err);
               });

        if(data){
        const category =  await Category.findByIdAndUpdate({_id:cat_id},{$set:{
            name:name,
            status:status,
            profile:profile?imageName:data.profile,
        

           }})
           res.status(201).send({success:true,message:"Menu Item has been Updated! successfully"})
        }else{
            res.status(201).send({success:false,message:"Item Id Not found!"})
        }
    }catch(error){
        res.status(400).send(error.message)
    }
})

// update Menu Item
 app.post("/update-menu_item",async(req,res)=>{
    try{
        const {item_name,item_details,price,discount,profile,product_id,cat_id} = req.body
        const  item_id = req.body.item_id
        const buffer = profile && Buffer.from(profile, "base64");
       
            const date = new Date()
            let ms = date.getMilliseconds();
             const imageName=profile?"hungry_bites"+ms+".jpg":null
             profile && fs.writeFile(`public/images/${imageName}`, buffer, "base64", function(err) {
                console.log(err);
              });

         const data = await MenuItem.findById({_id:item_id})
         profile &&  fs.unlink("public/images/" + data.profile, (err) => {
            console.log(err);
        });
           if(data){
              const adminData =  await MenuItem.findByIdAndUpdate({_id:item_id},{$set:{
               item_name:item_name,
               item_details:item_details,
               price:price,
               profile:profile?imageName:data.profile

              }})
              res.status(201).send({success:true,message:"Menu Item has been Updated! successfully"})
           }else{
               res.status(201).send({success:false,message:"Item Id Not found!"})
           }

    }catch(error){
        res.status(400).send(error.message)
    }
})

// Update Product 
app.post("/update-product",async(req,res)=>{
    try{
        const {name,Category_type,address,phone_no,cat_id,status,sort_order,shop_name,city,land_mark,opening_day,opening_time, closing_time,profile} = req.body;
               const product_id =req.body.product_id
               const admin_id =req.body.admin_id

               let buffer;
               let arr1 =[]
               if(profile){
                  await  profile.forEach((profile,index,arr)=>{
                        buffer = profile && Buffer.from(profile, "base64");
                       arr1.push(buffer)
                    })
                }
                let imageList=[];
                  
                await  arr1.forEach((profile,index,arr)=>{
                      const date = new Date()
                      let ms = date.getMilliseconds();
                       const imageName=profile? "hungry_bites"+ms+index+".png" : null
                       imageList.push(imageName)
                       profile && fs.writeFile(`public/images/${imageName}`, profile, "base64", function(err) {
                          console.log(err); 
                        });
                   })


  
         const data = await Products.findById({_id:product_id})
         profile && fs.unlink("public/images/" + data.profile, (err) => {
            console.log(err);
        });
         if(data){
            
         const adminData =  await Products.findByIdAndUpdate({_id:product_id},{$set:{
            name:name,
            Category_type:Category_type,
            address:address,
            phone_no:phone_no,
            cat_id:cat_id,
            status:status,
            sort_order:sort_order,
            shop_name:shop_name,
            city:city,
            land_mark:land_mark,
            opening_day:opening_day,
            opening_time:opening_time,
            closing_time:closing_time,
          profile:profile?imageList:data.profile
            }})
            res.status(201).send({success:true,message:"Product has been Updated Successfully!"})
         }else{
             res.status(201).send({success:false,message:"Product Id Not found!"})
         }

    }catch(error){
        res.status(400).send(error.message)
    }
})


//----------------------------------------------------------------delete Request API Box--------------------->
 app.delete("/delete-wishlist/:id",async(req,res)=>{
      try{
        const delete_wishlist= await Wishlist.deleteMany({"user_id":req.params.id})
        console.log("delete_wishlist>>>",delete_wishlist)
        if(!req.params.id){
            return   res.status(400).send({message:"Pass Id"})
        }
        res.status(201).send({message:"wishlist Delete Successfully"})
      }catch(err){
        res.status(400).send(err.message)
      }
 })



//Delete product and category inside product Id and admin and menuItem
   app.delete("/delete_products-category/:id",async(req,res)=>{
     try{

        const delete_product= await Products.findByIdAndDelete(req.params.id)
        const delete_menuItem= await MenuItem.deleteMany({"product_id":req.params.id})
        const deleteAdmin= await AdminLogin.deleteOne({"product_id":req.params.id})
       


        const delete_category= await Category.updateMany({},{$pull:{product_id:{$in:[req.params.id]}}})
          if(!req.params.id){
              return   res.status(400).send({message:"Pass Id"})
          }
          res.status(201).send({message:"Product Delete Successfully"})

    }catch(err){
        res.status(400).send(err.message)
    }
})

//Menu Item Delete
app.delete("/delete-menuItem/:id",async(req,res)=>{
    try{

        const delete_menuItem= await MenuItem.findByIdAndDelete({_id:req.params.id})
        
        const delete_menuId= await Products.updateMany({},{$pull:{menu_item:{$in:[req.params.id]}}})
        console.log("delete_menuItem>>>>",delete_menuItem)
       
          if(!req.params.id){
              return   res.status(400).send({message:"Pass Id"})
          }
          res.status(201).send({message:"MenuItem Delete Successfully"})

    }catch(error){
        res.status(400).send(error.message)
    }
})

//delete category and category inside product also delete
const allProduct=[];
app.delete("/delete_category-with-insideProduct/:id",async(req,res)=>{
      try{
        const delete_Category= await Category.findByIdAndDelete(req.params.id)
        const delete_product= await Products.deleteMany({"cat_id":req.params.id})
        const delete_MenuItem= await MenuItem.deleteMany({"cat_id":req.params.id})
          if(!req.params.id){
              return   res.status(400).send({message:"Pass Id"})
          }
          res.status(201).send({message:"Category Delete Successfully"})
      }
      catch(error){
          res.status(301).send(error.message)
      }
})

module.exports=app;


























//////////////////////////////////////////////////
//delete category and category inside product also delete
// app.delete("/delete_category-with-insideProduct/:id",async(req,res)=>{
//     try{
//       const productList = await Products.find({})
//       const data = await Category.find({"product_id":req.params.id})
//       productList.forEach(x=>{
//             console.log(">>>x>>xx",x?._id)
//             allProduct.push(x?._id)
//                    let productId = x?._id.valueOf()
//             let matchingId =data.filter(x=>x.product_id.includes(productId));
//             console.log("----matchingId>",matchingId)
//       })

//          console.log("<<<allProduct<<",allProduct)

//      // const delete_Category= await Category.findByIdAndDelete(req.params.id)
//      // const delete_product= await Products.deleteOne({"cat_id":req.params.id})
//      // const delete_product= await Products.updateMany({},{$pull:{cat_id:{$in:{id}}}})
//         console.log(">>>delete_Category>>>",delete_Category)
//         console.log(">>>delete_product>>>",delete_product)
     
//       //   if(!req.params.id){
//       //       return   res.status(400).send({message:"Pass Id"})
//       //   }
//         res.status(201).send(data)

//     }
//     catch(error){
//         res.status(301).send(error)
//     }
// })
