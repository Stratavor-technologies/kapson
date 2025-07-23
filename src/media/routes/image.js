const auth = require("../../../middlewares/auth");
const mediaValidation = require('../validators/media');
const validate = require('../../../middlewares/validate');

let routes = [
    {
        action: "POST",
        method: "imageUpload",
        url: "/upload",
        // filter: [auth.validate]

    },
    {
        action: "POST",
        method: "bulkUpload",
        url: "/bulk/upload",
        filter: [auth.validate]
    },
    {
        action: "POST",
        method: "delete",
        url: "/delete",
        filter: [auth.validate]

    },
    {
        action: "POST",
        method: "uploadInFolder",
        url: "/image/upload",
        filter: [auth.validate]

    }

]

module.exports = { apiType: 'images', routes } 