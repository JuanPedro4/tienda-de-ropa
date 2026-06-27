const { Modules } = require("@medusajs/utils");

const modules = {
  [Modules.PRODUCT]: true,
  [Modules.ORDER]: true,
  [Modules.CUSTOMER]: true,
  [Modules.CART]: true,
  [Modules.PAYMENT]: true,
  [Modules.FULFILLMENT]: true,
  [Modules.REGION]: true,
  [Modules.INVENTORY]: true,
  [Modules.STOCK_LOCATION]: true,
  [Modules.USER]: true,
  [Modules.AUTH]: true,
  [Modules.STORE]: true,
  [Modules.CURRENCY]: true,
  [Modules.PRICING]: true,
  [Modules.PROMOTION]: true,
};

module.exports = { modules };
