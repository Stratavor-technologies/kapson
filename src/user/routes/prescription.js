const auth = require("../../../middlewares/auth");
const validate = require("../../../middlewares/validate");
const prescriptionValidation = require("../validators/prescription");

let routes = [
  {
    action: "GET",
    method: "get",
    url: "/:id",
    filters: [auth.validateUser, validate(prescriptionValidation.getPrescriptionById)],
  },
  {
    action: "POST",
    method: "create",
    filters: [auth.validateUser, validate(prescriptionValidation.createPrescription)],
  },
  {
    action: "PUT",
    method: "update",
    url: "/:id",
    filters: [auth.validateUser, validate(prescriptionValidation.updatePrescription)],
  },
  {
    action: "GET",
    method: "search",
    filters: [auth.validateUser, validate(prescriptionValidation.searchPrescriptions)],
  },
  {
    action: "DELETE",
    method: "delete",
    url: "/:id",
    filters: [auth.validateUser, validate(prescriptionValidation.removePrescription)],
  }
];

module.exports = { apiType: "prescriptions", routes };
