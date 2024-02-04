// config/connection.js

const mongoose = require('mongoose');
const { array } = require('../helpers/multer');
const ObjectId=mongoose.Types.ObjectId;

const uri = 'mongodb://localhost:27017/ShoppingCart'; // Replace with your MongoDB connection URI

mongoose.connect(uri, {
  
  useNewUrlParser: true,
  useUnifiedTopology: true,
  
});

const db = mongoose.connection;

db.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

db.once('open', () => {
  console.log('Connected to MongoDB');
});

const ProductSchema=new mongoose.Schema({

  name:{
      type:String,
      required:true
  },  
  category:{
      type:String,
      required:true
  },  
  price:{
      type:String,
      required:true
  },  
  description:{
      type:String,
      required:true
  },
  image:{

    type:String,
    required:false
   
  },
  ratings: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required:false,
      },
      stars: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
        required:false,
      },
      review: {
        type: String,
        required:false,
      },
      date: {
        type: Date,
        default: Date.now,
        required:false,
      },
     

    },
    
  ],
 
  searchableName: {
    type: String,
    lowercase: true
  },
});
ProductSchema.pre('save', function(next) {
  this.searchableName = this.name.toLowerCase();
  next();
});

// Calculate the average star rating for the product
ProductSchema.methods.calculateAverageRating = function () {
  if (this.ratings.length === 0) {
    return 0; // No ratings yet
  }

  const totalStars = this.ratings.reduce((acc, rating) => acc + rating.stars, 0);
  return totalStars / this.ratings.length;
};

const LoginSchema = new mongoose.Schema({

  name:{
    type:String,
    required:true
  },
  email:{
    type:String,
    required:true
  },
  password:{
    type:String,
    required:true
  },
});

const cartSchema = new mongoose.Schema({
  user: {
    type: ObjectId,
    required: true,
  },
  products: [{
    item: {
      type:ObjectId,
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
    },
  
  }],
});


const orderSchema = new mongoose.Schema({
  deliveryDetails: {
    name: String,
    mobile: String,
    address: String,
    pincode: String,
  },
  userId: {
    type: ObjectId,
    ref: 'User', // Reference to the User model
  },
  paymentMethod: String,
  products: [Object], // Assuming products is an array of objects
  totalAmount:Number,
  status: String,
  date:String,
});



const Product=new mongoose.model('Product',ProductSchema)
const Login=new mongoose.model('Login',LoginSchema)
const Cart=new mongoose.model('Cart',cartSchema)
const Order=new mongoose.model('Order',orderSchema)

module.exports = { mongoose, db ,Product,Login ,Cart,Order};
