const auth = require("../../../middlewares/auth");

let routes = [
  {
    action: "GET",
    method: "totalProducts",
    url: "/products",
    filters: [auth.validate]
  },
   {
    action: "GET",
    method: "totalUsers",
    url: "/users",
    filters: [auth.validate]
  },
  {
    action: "GET",
    method: "totalOrders",
    url: "/orders",
    filters: [auth.validate]
  },
  {
    action: "GET",
    method: "totalSale",
    url: "/total/sale",
    filters: [auth.validate]
  },
  {
    action: "GET",
    method: "totalPending",
    url: "/total/pending",
    filters: [auth.validate]
   
  },
  {
    action: "GET",
    method: "salesDetail",
    url: "/total/sales/detail",
    filters: [auth.validate]
  },
  {
    action: "GET",
    method: "outOfStock",
    url: "/out-of-stock",
    filters: [auth.validate]
  },
  {
    action: "GET",
    method: "incomeDetail",
    url: "/income-detail",
    filters: [auth.validate]
  }
];

module.exports = { apiType: "dashboards", routes };
