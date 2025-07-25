const crypto = require('crypto');

exports.randomPin = () => {
  return Math.floor(1000 + Math.random() * 9000);
};

exports.union = (arrayOne, arrayTwo, by) => {
  //Find values that are in arrayOne but not in arrayTwo
  var uniqueOne = arrayOne.filter(function (obj) {
    return !arrayTwo.some(function (obj2) {
      return obj[by] == obj2[by];
    });
  });
  //Find values that are in arrayTwo but not in arrayOne
  var uniqueTwo = arrayTwo.filter(function (obj) {
    return !arrayOne.some(function (obj2) {
      return obj[by] == obj2[by];
    });
  });

  return uniqueOne.concat(uniqueTwo);
};

/**
 * Create an object composed of the picked object properties
 * @param {Object} object
 * @param {string[]} keys
 * @returns {Object}
 */
exports.pick = (object, keys) => {
  return keys.reduce((obj, key) => {
    if (object && Object.prototype.hasOwnProperty.call(object, key)) {
      // eslint-disable-next-line no-param-reassign
      obj[key] = object[key];
    }
    return obj;
  }, {});
};

exports.generateRandomAlphaNumeric = (length = 8) => {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charsetLength = charset.length;

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charsetLength);
    result += charset.charAt(randomIndex);
  }

  return result;
}

exports.isEmpty = (value) => {
  if (value === null || value === "" || typeof value === 'undefined') {
    return true;
  }
  return false;
}

exports.generateIdWithMiliSec = () => {
  const currentTimeStamp = Date.now();
  const milliseconds = new Date().getMilliseconds();
  const transactionId = `TXN${currentTimeStamp}${milliseconds}`;
  return transactionId;
}

exports.generateUniqueNum=(value)=>{
  let num = parseInt(value, 10);
  num += 1;
  let retVal = num.toString().padStart(6, '0');
  return retVal;
}

exports.generateSerialNumber



