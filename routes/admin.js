var express = require('express');
var router = express.Router();
var productHelper=require('../helpers/product-helpers');
const adminLogin = require('../helpers/login-helpers');
const upload = require('../helpers/multer');


/* GET users listing. */
router.get('/', function(req, res ,next) {
  let allproducts = true;
  productHelper.getAllProducts(allproducts,(error,products) => {
    if (error) {
      // Handle the error, e.g., render an error page
      res.render('error', { message: 'Error fetching products', error });
    } else {
      res.render('admin/view-products', { admin: true, products });
    }
  });
});

router.get('/add-products',async (req, res) => {
  

 
    res.render('admin/add-products',{ admin: true});

 

  
  
});

router.post('/add-products', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    await productHelper.addProduct(req.body, req.file, (result) => {
      const productId = result;
      
      res.redirect('/admin');
    });
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



router.get('/adminLogin', async (req, res) => {

  res.render('admin/admin-login', { admin: true })
});
router.post('/adminLogin', async (req, res) => {
  const admindata = req.body;

  if (!admindata.pw) {
    return res.send('<script>alert("An error occurred during login. Please try again later."); window.location.href="/admin/adminLogin"</script>');
  }

  try {
    const result = await adminLogin.checkAdmin(admindata);
    if (result) {
      req.session.adminLoggin = true;
      req.session.admin = admindata;
      return res.redirect('/admin/');
    } else {
      throw new Error('Invalid credentials');
    }
  } catch (error) {
    console.error(error);
    return res.send('<script>alert("' + error.message + '"); window.location.href="/admin/adminLogin"</script>');
  }
});

module.exports = router;  
