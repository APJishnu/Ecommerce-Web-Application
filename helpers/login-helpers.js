const { Login } = require('../config/connection');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


module.exports={
    SignUp: async(data,callback)=>{
        const pw = await bcrypt.hash(data.password,10)
        try{

            const newUser = new Login({
                name:data.name,
                email:data.email,
                password:pw,
            });

            await newUser.save();

            const savedUser = await Login.findOne({ _id: newUser._id }).exec();
            console.log(savedUser);
            const ObjectId = savedUser._id.toString();
      
            console.log(ObjectId);
            callback(ObjectId);


        }
        catch(error)
        {
            console.error(error);
            callback(error,null);
        }
    },

    Login: async (values,callback) => {
       
  
            const check = await Login.findOne({ email: values.email });
            
            console.log("1..."+values.password);
            console.log("2..."+check.password);
            
            if (check) {
              const isUser = await bcrypt.compare(values.password, check.password);
              if(isUser){
                callback(check)
              }
             else {
              
                callback(null);
              }
            } else{
              callback(null)
            }
         
    }



};