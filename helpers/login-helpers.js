const { Login } = require('../config/connection');
const {AdminLogin} = require('../config/connection');
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

    // login-helpers.js

Login: async (values) => {
  try {
    const user = await Login.findOne({ email: values.email });
    if (user) {
      const isPasswordValid = await bcrypt.compare(values.password, user.password);
      if (isPasswordValid) {
        return user; // Return user if login successful
      } else {
        throw new Error("Incorrect password"); // Throw error if password is incorrect
      }
    } else {
      throw new Error("User not found"); // Throw error if user not found
    }
  } catch (error) {
    console.error(error);
    throw new Error("An error occurred during login"); // Throw error for any other errors
  }
},


checkAdmin: async (admindata) => { // Remove the callback parameter
  try {
    const check = await AdminLogin.findOne({ email: admindata.email });
    if (check) {
      const isValidPw = await bcrypt.compare(admindata.pw, check.password);
      if (isValidPw) {
        return true; // Return true if the password is valid
      } else {
        return false; // Return false if the password is invalid
      }
    } else {
      return false; // Return false if the email is incorrect
    }
  } catch (error) {
    console.error(error);
    throw error; // Throw the error if any exception occurs
  }
},



};