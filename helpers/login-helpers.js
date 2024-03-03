const { Login } = require('../config/connection');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


module.exports={
    SignUp: async(data,callback)=>{

      try{
      let userExist = await Login.findOne({ email: data.email });
      if (userExist) {

        callback('userExist')

      } else {
        const pw = await bcrypt.hash(data.password,10)
        

            const newUser = new Login({
              firstname: data.firstname,
              lastname: data.lastname,
              password: pw,
              email: data.email,
              phone: data.phone,
            });

            await newUser.save();

            const savedUser = await Login.findOne({ _id: newUser._id }).exec();
            console.log(savedUser);
            const ObjectId = savedUser._id.toString();
      
            console.log(ObjectId);
            callback(ObjectId);

          }
        }
        catch(error)
        {
            console.error(error);
            callback(error,null);
        }
    },

    Login: async (values, callback) => {
  try {
    const user = await Login.findOne({ email: values.email });
    if (user) {
      const isPasswordValid = await bcrypt.compare(values.password, user.password);
      if (isPasswordValid) {
        callback(user); // Login successful
      } else {
        callback(null, "Incorrect password"); // Incorrect password
      }
    } else {
      callback(null, "User not found"); // User not found
    }
  } catch (error) {
    console.error(error);
    callback(null, "An error occurred during login"); // Error occurred
  }
}



};