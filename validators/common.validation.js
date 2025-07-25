const Joi = require('joi');
const moment = require('moment');

const password = (value, helpers) => {
      if (value.length < 8) {
            return helpers.message("password must be at least 8 characters");
      }
      if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
            return helpers.message(
                  "password must contain at least 1 letter and 1 number"
            );
      }
      return value;
};

const day = (value, helpers) => {
      const isValidDay = moment(value, 'dddd', true).isValid();
      if (!isValidDay) {
            return helpers.message("Enter valid day");   
      }
      return value;
};

const phone = (value, helpers) => {
      
      const isMatch = value.match(/^\d{10}$/);

      if (!isMatch) {
            return helpers.message("Phone number is not valid");
      }

      return value;
};

const objectId = (value, helpers) => {
      if (!value.isObjectId()) {
            return helpers.message('"{{#label}}" must be a valid mongo id');
      }
      return value;
};
const comment = (value , helpers) =>{
      if(!value.match(/^[a-zA-Z_ ]*$/)){
            return helpers.message('Message is only characters');
      }
      return value;
}
const description = (value , helpers) =>{
      if(!value.match(/^[a-zA-Z_ ]*$/)){
            return helpers.message('Description only characters');
      }
      return value;
}
const pageSchema = {
      serverPaging: Joi.boolean().default(true),
      pageNo: Joi.string().default(1),
      pageSize: Joi.string().default(10)
};

module.exports = {
      pageSchema,
      password,
      phone,
      objectId,
      day,
      comment,
      description
};