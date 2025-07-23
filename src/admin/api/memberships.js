"use strict";
const path = require("path");
const coreDirname = path.join(
    __dirname,
    "..",
    "..",
    "core",
    "api",
   
  );
const base = require("../../../api/api-base")(__dirname, 'membership', 'membership', coreDirname);
const service = require('../services/membership')

exports.create = async (req, res) => {
    let retVal = await base.create(req);
    return res.data(retVal);
};

exports.update = async (req, res) => {
    let retVal = await base.update(req);
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
    let retVal = await service.remove(req.params.id)
    return res.data(retVal)
};

