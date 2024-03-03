var express = require('express');
var router = express.Router();
const productHelper = require('../helpers/product-helpers');
const loginHelper = require('../helpers/login-helpers');
const mongoose = require('mongoose');
const productHelpers = require('../helpers/product-helpers');
const ObjectId = mongoose.Types.ObjectId;

const verifyLogin = (req, res, next) => {

  if (req.session.loggedIn) {
    next()
  } else {

    res.redirect('/login')
  }
}

/* GET home page. */
router.get('/', async (req, res, next) => {
  let user = req.session.user;
  console.log(user);
  let count = null;
  let allproducts = false;
  let showAllproducts = true;
  if (req.session.user) {

    count = await productHelper.getCartCount(req.session.user._id)
    console.log("cartcount", count)

  }
  productHelper.getAllProducts(allproducts, (error, products) => {
    if (error) {
      // Handle the error, e.g., render an error page
      res.render('error', { message: 'Error fetching products', error });
    } else {

      res.render('user/view-products', { admin: false, products, user, count, showAllproducts });
    }
  });
});

router.get('/all-products', async (req, res) => {
  let user = req.session.user;
  let count = null;
  let allproducts = true;
  let showAllproducts = false;
  if (req.session.user) {

    count = await productHelper.getCartCount(req.session.user._id)
    console.log("cartcount", count)

  }


  productHelper.getAllProducts(allproducts, (error, products) => {
    if (error) {
      // Handle the error, e.g., render an error page
      res.render('error', { message: 'Error fetching products', error });
    } else {

      res.render('user/view-products', { admin: false, products, user, count, showAllproducts });
    }
  });

});



router.get('/login', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/')
  } else {


    res.render('user/user-login', { logErr: req.session.logErr });
    req.session.logErr = false
  }
})
router.post('/signup', async (req, res) => {

  try {
    // Add a new product
    await loginHelper.SignUp(req.body, (result) => {

      if(result === 'userExist'){
     
        res.send('<script>alert("User already exists. Please choose a different email or login."); window.location.href="/signup"</script>');
    
    
      }else{
        const _id = result;
        res.redirect('/login'); // Redirect to view all products after adding
      }

    });
  } catch (error) {
    console.error(error);
    res.render('error', { message: 'Error adding product', error });
  }

});

router.get('/signup', (req, res) => {

  res.render('user/user-signup');
})

router.post('/login', async (req, res) => {

  try {
    // Add a new product
    await loginHelper.Login(req.body, (result) => {
      console.log(result);
      if (result) {

        req.session.loggedIn = true,
          req.session.user = result,


          res.redirect('/');

      } else {

        req.session.logErr = "invalid email and password",

          res.redirect('/login');
      }
    });
  } catch (error) {
    console.error(error);
    res.render('error', { message: 'Error adding product', error });
  }

});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/')
});


router.get('/cart', verifyLogin, async (req, res) => {
  try {
    let products = await productHelper.getCartProducts(req.session.user._id);
    let totalAmount = await productHelper.getTotalAmount(req.session.user._id);
    console.log("cart totalAmount in user.js ", totalAmount)
    console.log("cart products in user.js ", products)
    if (totalAmount) {
      res.render('user/user-cart', { admin: false, user: req.session.user, products, totalAmount });
    } else {
      res.render('user/user-cart', { admin: false, user: req.session.user, products: [], totalAmount: 0 });
    }
  } catch (error) {
    // Handle the error
    console.error('Error in /cart route:', error);
    res.status(500).send('Internal Server Error');
  }
});



router.get('/add-to-cart/:id', verifyLogin, async (req, res) => {
  if (req.session.loggedIn) {

    await productHelper.addToCart(req.params.id, req.session.user._id, (result) => {
      res.json({ status: true });
    });
  }
  else {
    res.redirect('/login');
  }



});


router.post('/change-product-quantity', async (req, res, next) => {

  await productHelper.ChangeProductQuantity(req.body).then(async (response) => {

    response.total = await productHelper.getTotalAmount(req.body.user);

    res.json(response);
  });


});

// delete from cart
router.post('/remove-cartItem', async (req, res) => {


  try {
    // Add a new product
    const updatedQuantity = await productHelper.deleteCartProduct(req.body)

    res.json({ status: true, quantity: updatedQuantity });


  } catch (error) {
    console.error(error);
    res.render('error', { message: 'Error adding product', error });
  }
});


router.get('/order-products', verifyLogin, async (req, res) => {

  let buyNow = req.query.productId;
  console.log(buyNow)
  if (buyNow) {

    let product = await productHelper.getProductDetails(buyNow);

    res.render('user/user-order', { admin: false, user: req.session.user, product });

  } else {

    let result = await productHelper.getTotalAmount(req.session.user._id);
    res.render('user/user-order', { admin: false, user: req.session.user, result });
  }


});


router.post('/order-products', verifyLogin, async (req, res) => {

  console.log("productIddddd", req.query.productId)

  console.log(req.body)
  let userId = req.session.user._id;
  let productId = req.query.productId;
  if (productId) {

    let products = null;
    let totalPrice = null;

    productHelper.placeOrder(req.body, userId, products, totalPrice, productId).then((orderId) => {
      if (req.body['PaymentMethod'] === 'COD') {

        res.json({ status: true })
      } else {
        productHelper.generateRazorpay(orderId).then((response) => {

        })
      }

    })

  } else {
    let productId = null;
    let products = await productHelper.getCartProductList(userId);
    let totalPrice = await productHelper.getTotalAmount(userId);
    productHelper.placeOrder(req.body, userId, products, totalPrice, productId).then((orderId) => {
      if (req.body['PaymentMethod'] === 'COD') {
        res.json({ codSuccess: true })
      } else {
        productHelper.generateRazorpay(orderId,totalPrice).then((response) => {
          console.log(response)
          res.json(response)

        })
      }

    })

  }


});

router.get('/order-details', verifyLogin, async (req, res) => {

  let orderDetails = await productHelper.orderDetails(req.session.user._id)
  res.render('user/order-details', { admin: false, user: req.session.user, orderDetails })
});

router.get('/list-products/:id([0-9a-fA-F]{24})', verifyLogin, async (req, res) => {
  try {
    const proId = req.params.id;

    console.log(proId);
    const orderedProducts = await productHelper.orderedProducts(proId);
    res.render('user/order-products', { admin: false, user: req.session.user, orderedProducts });
  } catch (error) {
    console.error('Error in /order-products/:id route:', error);
    // Handle the error and send an appropriate response
    res.status(500).send('Internal Server Error');
  }
});


router.get('/search', async (req, res) => {
  try {
    const query = req.query.q; // Get the search query from the request query parameters
    const products = await productHelper.searchProducts(query); // Call the searchProducts function with the query
    res.render('user/view-products', { products }); // Render a partial view (e.g., product-listing.hbs) with the filtered products
  } catch (error) {
    console.error('Error in /search route:', error);
    res.status(500).json({ error: 'Internal Server Error' }); // Handle errors and return an error response
  }
});


router.get('/review/:proId', verifyLogin, async (req, res) => {

  let proId = req.params.proId;

  res.render('user/review', { admin: false, user: req.session.user, proId });
});

router.post('/submit-rating/:proId', verifyLogin, async (req, res) => {
  const productId = req.params.proId; // Assuming you have a productId in the form




  let product = await productHelper.addRating(productId, req.body, req.session.user._id);

  res.redirect('/');
});


router.post('/verify-payment',(req,res)=>{
  console.log(req.body['order']);
  let order=req.body.order;
  let payment=req.body.payment;
  productHelper.verifyPayment(payment,order).then(()=>{
    productHelper.changePaymentStatus(order).then(()=>{
      console.log("Payment Successfull")
      res.json({status:true})
    })

  }).catch((err)=>{
    console.log(err);
    res.json({status:false,errMsg:'Payment Failed'})
  })
})


module.exports = router;
