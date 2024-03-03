// config/connection.js

const mongoose = require('mongoose');
const { array } = require('../helpers/multer');
const ObjectId=mongoose.Types.ObjectId;
require('dotenv').config();


console.log(process.env.MONGODB_URI);

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true, // Ensures indexes are created
  poolSize: 10, // Maximum number of sockets in the pool
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  connectTimeoutMS: 10000 // Close connection attempts after 10 seconds
};


mongoose.connect(process.env.MONGODB_URI, {
  

}, options);

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

  
  firstname:{
    type:String,
    required:true
},  
lastname:{
    type:String,
    required:true
},  
password:{
    type:String,
    required:true
},
email:{
    type:String,
    required:true
},  

phone:{
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

const AdminLoginSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    default: 'admin@gmail.com' // Default email value
  },
  password: {
    type: String,
    required: true,
    default: 'admin@123' // Default password value
  }
});



// const pw = await bcrypt.hash('admin@123',10)
// const newAdminLogin = new AdminLogin({
//   email: 'admin@gmail.com', // Custom email value
//   password: pw // Custom password value
// });

// // Save the document to the database
// newAdminLogin.save()
//   .then((result) => {
//     console.log('Document saved:', result);
//   })
//   .catch((error) => {
//     console.error('Error saving document:', error);
//   });



const Product=new mongoose.model('Product',ProductSchema)
const Login=new mongoose.model('Login',LoginSchema)
const Cart=new mongoose.model('Cart',cartSchema)
const Order=new mongoose.model('Order',orderSchema)
const AdminLogin=new mongoose.model('AdminLogin',AdminLoginSchema);

module.exports = { mongoose, db ,Product,Login ,Cart,Order,AdminLogin};
