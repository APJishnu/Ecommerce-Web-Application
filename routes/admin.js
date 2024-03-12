var express = require('express');
var router = express.Router();
var productHelper=require('../helpers/product-helpers');
const adminLogin = require('../helpers/login-helpers');
const upload = require('../helpers/multer');


router.get('/',async(req,res)=>{
  let allproducts = true;
  let products = await productHelper.getAllProducts(allproducts);
  console.log(products)
  
    res.render('admin/view-products',{admin:true,products:products})
 
})

router.get('/add-products',async (req, res) => {
  
    res.render('admin/add-products',{ admin: true});

  
});

router.post('/add-products', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Call the addProduct function and await its result
    const productId = await productHelper.addProduct(req.body, req.file);

    // Redirect to admin dashboard after adding the product
    res.redirect('/admin/');
  } catch (error) {
    console.error(error);
    res.render('error', { message: 'Error adding product', error });
  }
});

router.get('/delete-products/:id',async(req,res)=>{

  let proId=req.params.id;

  try {
    // Add a new product
    await productHelper.deleteProduct(proId)
      
    res.redirect('/admin/'); // Redirect to view all products after adding
      
   
  } catch (error) {
    console.error(error);
    res.render('error', { message: 'Error adding product', error });
  }
});


router.get('/edit-products/:id', async (req, res) => {
  try {
    let productId = req.params.id;
    const product = await productHelper.getProductDetails(productId);
    res.render('admin/edit-products', { product });
  } catch (error) {
    console.error('Error fetching product details:', error);
    res.render('error', { message: 'Error fetching product details', error });
  }
});

// POST route for updating product details
router.post('/edit-products/:id', upload.single('image'), async (req, res) => {
  try {
    let productId = req.params.id;
    const productDetails = req.body;
    const newImage = req.file;

    const updatedProduct = await productHelper.updateDetails(productId, productDetails, newImage);
    console.log('Product updated successfully:', updatedProduct);
    res.redirect('/admin/');
  } catch (error) {
    console.error('Error updating product:', error);
    res.render('error', { message: 'Error updating product', error });
  }
});

// POST route to add a rating to a product
router.post('/products/add-rating/:productId', async (req, res) => {
  const { productId } = req.params;
  const { rating } = req.body;

  try {
    // Call the addRating function
    const product = await addRating(productId, rating);

    res.redirect('/admin/')
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});




router.get('/admin-login', async (req, res) => {

  res.render('admin/admin-login', { admin: true })
});

router.post('/admin-login', async (req, res) => {
  const admindata = req.body;

  // Use try-catch to handle errors
  try {
    const result = await adminLogin.checkAdmin(admindata); // Call checkAdmin function without the callback
    if (result) {
      res.redirect('/admin/');
    } else {
      res.send('<script>alert("Incorrect Email Address or Password."); window.location.href="/admin/admin-login"</script>');
    }
  } catch (error) {
    console.error(error);
    res.send('<script>alert("An error occurred during login. Please try again later."); window.location.href="/admin/admin-login"</script>');
  }
});
module.exports = router;  
