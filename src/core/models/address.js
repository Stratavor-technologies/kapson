const { number } = require("joi");
const mongoose = require("mongoose");

const addressEntity = {
     partyDetails: {
    partyName: {
      type: String,
     
    },
    contactNo: {
      type: String,
     
    },
    email: {
      type: String,

    },
    address: {
      type: String,
    
    },
    gstNo: {
      type: String,

    }
  },
   firstName: {
    type: String,
    //required: true
   },
   lastName: {  
    type: String,
   },

   country:{
    type:String,
    //required:true
   },
   state:{
    type:String,
    //required:true
   },
   city:{
    type:String, 
    //required:true
   },
   zipCode:{
    type:String,
     //required:true
   },
   phoneNumber:{
    type:String,
   },
   
     createdAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",  // Reference to the user who created the category
  },
};  

let addressStatics = {};

// Static method to create a new cart entity
addressStatics.newEntity = async (body) => {
  const model = {     
      partyDetails: body.partyDetails,
       firstName:body.firstName,
       lastName:body.lastName,
       address:body.address,
       country:body.country,
       state:body.state,
       city:body.city,
       zipCode:body.zipCode,
       phoneNumber:body.phoneNumber,
       createdBy: body.createdBy
    }
    return model;
};




module.exports = {
    statics: addressStatics,
    entity: addressEntity,
}


