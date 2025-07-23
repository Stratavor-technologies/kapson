const base = require("../../../api/api-base")(__dirname, "userMemberships", "userMembership");
 const service = require('../services/userMemberships')

exports.create = async (req, res) => {
    let retVal = await base.create(req);
    console.log(retVal);
    return res.data(retVal,200,"Successfully Purchased.");
};

exports.handleSession = async (req, res) => {
    let retVal = await service.handleSession(req.query.sessionId);
    console.log(retVal);
    return res.data(retVal);
};
exports.cancelMembership = async (req, res) => {
    let retVal = await service.cancelUserMembership(req.query.membershipId,req.user.id);
    console.log(retVal);
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
