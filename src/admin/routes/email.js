let routes = [
  {
    action: "GET",
    method: "fetchAllLabels",
    url: "/get/labels",
  },
  {
    action: "GET",
    method: "fetchMessagesByLabel",
    url: "/label/:labelId",
  },
  {
    action: "GET",
    method: "fetchMessageDetails",
    url: "/message/:id",
  },
  {
    action: "POST",
    method: "sendUserEmail",
    url: "/send",
  },
  {
    action: "POST",
    method: "registerWatchHandler",
    url: "/watch",
  },
  {
    action: "GET",
    method: "getHistoryHandler",
    url: "/history",
  },
  {
    action: "POST",
    method: "createNewLabel",
    url: "/newLabel",
  },
  {
    action: "GET",
    method: "fetchThreadById",
    url: "/threads/:threadId",
  },
  {
    action: "DELETE",
    method: "deleteCustomLabel",
    url: "/label/:labelId",
  },
  {
    action: "PUT",
    method: "updateLabelInfo",
    url: "/label/:labelId",
  },
  {
    action: "PUT",
    method: "updateEmailStatus",
    url: "/updateStatus/:messageId",
  },
  {
    action: "DELETE",
    method: "deleteEmail",
    url: "/delete/:messageId",
  },
  {
    action: "GET",
    method: "fetchUserProfile",
    url: "/profile",
  },
  {
    action: "GET",
    method: "fetchShopifyStores",
    url: "/fetchShopifyStores",
  },
];

module.exports = { apiType: "emails", routes };
