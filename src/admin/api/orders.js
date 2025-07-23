"use strict";
const path = require("path");
const coreDirname = path.join(
    __dirname,
    "..",
    "..",
    "core",
    "api",
   
  );
const base = require("../../../api/api-base")(__dirname, 'order', 'order', coreDirname);
const service = require('../services/order');
const { SERVFAIL } = require("dns");

exports.proceedToCheckout = async(req,res,userId)=>{
    let id = req.params.id
    let retVal = await service.proceedToCheckout(id,userId,req.body.data);
    return res.data(retVal);
}
exports.shopNow = async(req,res)=>{
    let retVal = await service.shopNow(req.body,req.user)
    return res.data(retVal)
}

exports.placeOrder = async (req, res) => {
    let id = req.params.id
    let retVal = await service.placeOrder(id,req.body,req.user);
    return res.data(retVal);
};

exports.update = async (req, res) => {
    let id = req.params.id
    let retVal = await service.update(id, req.body);
    return res.data(retVal);
};

exports.search = async (req, res) => {
    let retVal = await base.search(req);
    return res.page(retVal);
};

exports.get = async (req, res) => {
    let retVal = await base.get(req);
    return res.data(retVal);
};


exports.delete = async(req,res)=>{
    let retVal = await base.delete(req)
    console.log(retVal)
    return res.data(retVal)
};
