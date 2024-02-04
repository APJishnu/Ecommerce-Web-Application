const multer = require('multer');
const path = require('path');

// ...

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/img/');
  },
  filename: (req, file, cb) => {
    const extname = path.extname(file.originalname);
    cb(null, Date.now() + extname); // Rename the image file to a unique name with its original extension
  },
  
});

const upload = multer({ storage: storage });

module.exports = upload;
