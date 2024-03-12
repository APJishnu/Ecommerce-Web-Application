const { query } = require('express');
const { Product } = require('../config/connection');
const { Cart } = require('../config/connection');
const { Order } = require('../config/connection');
const mongoose = require('mongoose');
const ObjectId=mongoose.Types.ObjectId;
const Razorpay = require('razorpay');

var instance = new Razorpay({
  key_id: 'rzp_test_37TZNY8cnWgUm8',
  key_secret: 'rLzmuUsQPyPWfUC7N9qA8N2O',
});

module.exports = {
// Modify the addProduct function to return a promise
addProduct: async (product, img) => {
  try {
    const newProduct = new Product({
      name: product.name,
      category: product.category,
      price: product.price,
      description: product.description,
      image: img.filename, // Use the filename of the uploaded image
    });

    const savedProduct = await newProduct.save();
    console.log("New Product Added:", savedProduct);
    return savedProduct._id; // Return the ID of the saved product
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
},
  getAllProducts: async (allproducts) => {
    try {
      let products;
      if (allproducts) {
        products = await Product.find().exec();
      } else {
        products = await Product.find().limit(8).exec();
      }
      const productsWithAverageRating = products.map((product) => ({
        ...product.toObject(),
        averageRating: product.calculateAverageRating(),
      }));
      return productsWithAverageRating;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },
  

  deleteProduct:async (proId) => {
    try {
      const result = await Product.deleteOne({ _id: proId });
      console.log(`Deleted ${result.deletedCount} document`);

     
    } catch (error) {
      console.error('Error deleting admin document:', error);
    
    }
  },
  getProductDetails: async (productId) => {
    try {
      const product = await Product.findOne({ _id: productId });
      console.log("Product:", product);
      return product;
    } catch (error) {
      console.error('Error fetching product details:', error);
      throw error;
    }
  },
  
  // updateDetails function using promises
  updateDetails: async (productId, productDetails, newImage) => {
    try {
      let updateObject = {
        name: productDetails.name,
        category: productDetails.category,
        price: productDetails.price,
        description: productDetails.description,
      };
      if (newImage) {
        updateObject.image = newImage.filename; // Update the image field
      }
  
      const updatedProduct = await Product.findByIdAndUpdate(
        { _id: productId },
        { $set: updateObject },
        { returnOriginal: false }
      );
  
      console.log('Updated Product:', updatedProduct);
      return updatedProduct;
    } catch (error) {
      console.error('Error updating product details:', error);
      throw error;
    }
  },



addToCart :async (proId, userId, callback) => {
  try {
    let userCart = await Cart.findOne({ user: userId });

    if (userCart) {
      let proExist = userCart.products.find(products => products.item.equals(proId));

      if (proExist) {
        // If the product exists in the cart, increment its quantity
        await Cart.updateOne(
          { user: userId, 'products.item': proId },
          { $inc: { 'products.$.quantity': 1 } }
        );
      } else {
        // If the product doesn't exist in the cart, add it with quantity 1
        await Cart.updateOne(
          { user: userId },
          { $push: { products: { item: proId, quantity: 1 } } }
        );
      }

      userCart = await Cart.findOne({ user: userId });
      callback(userCart);
    } else {
      // If the user doesn't have a cart yet, create a new cart with the product
      await Cart.insertMany({
        user: userId,
        products: [{ item: proId, quantity: 1 }],
      });
      userCart = await Cart.findOne({ user: userId });
      callback(userCart);
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    callback(null, error);
  }
},


getCartProducts: (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(userId)
      const cartItems = await Cart.aggregate([
        {
          $match: { user:ObjectId.createFromHexString(userId) }
        },
        {
          $unwind: '$products'
        },
        {
          $project: {
            item: '$products.item',
            quantity: '$products.quantity'
          }
        },
        {
          $lookup: {
            from: 'products', // Use 'Product' as the collection name
            localField: 'item',
            foreignField: '_id',
            as: 'product'
          }
        },
        {
          $project: {
            item: 1,
            quantity: 1,
            product: { $arrayElemAt: ['$product', 0] }
          }
        }
      ]);

      console.log('Aggregate Result in getCartProducts:', cartItems);

      if (cartItems) {
        resolve(cartItems);
      } else {
        console.log('CartItems is null or empty');
        resolve([]);
      }
    } catch (error) {
      console.error('Error in getCartProducts:', error);
      reject(error);
    }
  });
},


getCartCount :  (userId)=>{

  return new Promise(async(resolve,reject)=>{

  let count = 0 ;
  let cart = await Cart.findOne({user:(userId) }) 

  if(cart){
    count = cart.products.length
    console.log(count)

    resolve(count)
  }else{
    resolve(count)
  }
 

  })
  
},
ChangeProductQuantity:(details)=>{
  try{
  details.count=parseInt(details.count)
  details.quantity=parseInt(details.quantity)
    
  
  return new Promise(async(resolve,reject)=>{

    if(details.count==-1 && details.quantity==1){

    Cart.updateOne({_id:details.cart},
        {
          $pull:{products:{item:details.product}}
        }
        ).then((response)=>{
          resolve({removeProduct:true})
        })
    }else{
       
      Cart.updateOne(
      { _id:details.cart,'products.item': details.product },
      { $inc: { 'products.$.quantity': details.count } }
    ).then((response)=>{
      resolve({status:true})
    });
    }


  })
} catch (error) {
  console.error('Error loading to cart:', error);
  reject(null, error);
}
    

},

deleteCartProduct:(details)=>{
 
  console.log("hai",details)
  return new Promise(async(resolve,reject)=>{
     
    const cart = await Cart.findOne({ _id: details.cart });

    // Use filter to remove the item from the products array
    const updatedProducts = cart.products.filter((p) => !p.item.equals(details.product));

    // Update the products array in the Cart document
    const newProduct=await Cart.updateOne({ _id: details.cart }, { $set: { products: updatedProducts } });
      
    resolve(newProduct)  // Return the updated quantity
    
  })
},


getTotalAmount :(userId,prodId)=>{

  return new Promise(async(resolve,reject)=>{
    try{

    const total = await Cart.aggregate([
      {
        $match: { user: ObjectId.createFromHexString(userId) }
      },
      {
        $unwind: '$products'
      },
      {
        $project:{
          item:'$products.item',  
          quantity:'$products.quantity'
        }
      },
      {
        $lookup:{
          from:'products',
          localField:'item',
          foreignField:'_id',
          as:'product'
        }
      },
      {
        $addFields: {
          product: { $arrayElemAt: ['$product', 0] },
          price: {
            $toDouble: {
              $replaceAll: {
                input: { $arrayElemAt: ['$product.price', 0] },
                find: ',',
                replacement: ''
              }
            }
          }
        }
      },
      {
        $project: {
          item: 1,
          quantity: 1,
          price: 1
        }
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: { $multiply: ['$quantity', '$price'] } // Multiply quantity with price
          }
        }
      }
      
    ]).exec();

    console.log('Aggregate Result:total', total);

    // Check if cartItems is not null and not empty
    if (total && total.length > 0) {
      resolve(total[0].total);
    } else {
      console.log('Cart is empty or total is null');
      resolve(null); // Return null when cart is empty or total is null
    }

  } catch (error) {
    console.error('Error loading to cart:', error);
    reject(null, error);
  }
})


},

placeOrder: (order,userId,products,total,productId)=>{
  return new Promise(async(resolve,reject)=>{
    console.log(order,products,total)
    if(productId){
      let product = await Product.findById(productId);
      
      let price = parseInt(product.price);
      let status  = order['PaymentMethod'] === 'COD'?'placed':'pending'
    let orderObj = new Order({
      deliveryDetails:{
          name:order.Name,
          mobile:order.Mobile,
          address:order.Address,
          pincode:order.Pincode,
      },
      userId:ObjectId.createFromHexString(userId),
      paymentMethod:order['PaymentMethod'],
      products: { item:new ObjectId(productId), quantity: 1 },
      totalAmount:price,
      status:status,
      date: new Date()
    });

    orderObj.save().then(async(response)=>{
      resolve(response._id)
    })

    }else{

      let status  = order['PaymentMethod'] === 'COD'?'placed':'pending'
    let orderObj = new Order({
      deliveryDetails:{
          name:order.Name,
          mobile:order.Mobile,
          address:order.Address,
          pincode:order.Pincode,
      },
      userId:ObjectId.createFromHexString(userId),
      paymentMethod:order['PaymentMethod'],
      products:products,
      totalAmount:total,
      status:status,
      date: new Date()
    });

    orderObj.save().then(async(response)=>{

     await Cart.deleteOne({user:userId})
      resolve(response._id)
    })

    }

    
})

},

getCartProductList:(userId)=>{
 
  return new Promise(async(resolve,reject)=>{

    console.log(userId)
    let cart = await Cart.findOne({user:userId});
    console.log(cart)
    resolve(cart.products)
  })
},

orderDetails: (userId)=>{

  return new Promise(async(resolve,reject)=>{
    console.log(userId)
    let order = await Order.find({ userId: ObjectId.createFromHexString(userId)}).exec();
    console.log(order);
    resolve(order)

  })
},
orderedProducts: (proId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let product = await Order.aggregate([
        {
          $match: { _id: new ObjectId(proId) } // Use mongoose.Types.ObjectId to convert proId to ObjectId
        },
        {
          $unwind: '$products'
        },
        {
          $project: {
            item: '$products.item',
            quantity: '$products.quantity'
          }
        },
        {
          $lookup: {
            from: 'products', // Use 'products' as the collection name
            localField: 'item',
            foreignField: '_id',
            as: 'product'
          }
        },
        {
          $project: {
            item: 1,
            quantity: 1,
            product: { $arrayElemAt: ['$product', 0] }
          }
        },
      ]);

      console.log(product);

      resolve(product);
    } catch (error) {
      console.error('Error in orderedProducts:', error);
      reject(error);
    }
  });
},

searchProducts: async (query) => {
  try {
    const regex = new RegExp(query, 'i');
    const products = await this.find({ searchableName: regex }).lean();
    return products;
  } catch (error) {
    console.error('Error fetching product details:', error);
    throw error;
  }
},

addRating: async (productId, details, userId) => {
  try {
    // Find the product by its ID
    const product = await Product.findById(productId);

    if (!product) {
      throw new Error('Product not found');
    }

    // Check if the user has already rated the product
    const existingRating = product.ratings.find(
      (rating) => rating.user.toString() === userId
    );

    if (existingRating) {
      
    }else{
      product.ratings.push({
        user: userId,
        stars: details.rating,
        review: details.review,
      });
  
      // Save the updated product in the database
      await product.save();
    }

    // Add the new rating and review to the product's ratings array
    

    // Return the updated product
    return product;
  } catch (err) {
    console.error(err);
    throw err;
  }
},

generateRazorpay :(orderId,total)=>{
  return new Promise((resolve,reject)=>{
   
    var options = {
      amount: total*100,
      currency: 'INR',
      receipt: orderId,
    };
    instance.orders.create(options,function(err, order){
      if(err){
        console.log(err);
      }else{
        console.log("New Order :",order);
        resolve(order);
      }
      
    });

  })
},

verifyPayment:(payment,order)=>{
  return new Promise((resolve,reject)=>{

    const crypto = require('crypto');
    let hmac = crypto.createHmac('sha256', 'rLzmuUsQPyPWfUC7N9qA8N2O');
    hmac.update(payment['razorpay_order_id']+'|'+payment['razorpay_payment_id']);
    hmac=hmac.digest('hex')
    if(hmac==payment['razorpay_signature']){
      resolve()
    }else{
      reject()
    }
  })
},
changePaymentStatus:(order)=>{
  return new Promise(async(resolve,reject)=>{
    let orderId = order.receipt;
    console.log(orderId)
      await Order.updateOne({_id:(orderId)},
      {
        $set:{
          status:'placed'
        }
      }).then(()=>{
        resolve();
      })
  })
}

};