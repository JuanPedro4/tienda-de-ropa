import { defineConfig } from "@medusajs/utils";

/**
 * Medusa.js module configuration.
 *
 * Enable only the commerce modules required for this project:
 * - Product (core catalog)
 * - Order (checkout flow)
 * - Customer (user management)
 * - Cart (shopping cart)
 * - Payment (Stripe integration)
 * - Fulfillment (store pickup)
 * - Region (Spain, EUR)
 *
 * @see https://docs.medusajs.com/v2/modules/overview
 */
export const modules = {
  // Core commerce modules — enabled by default in Medusa v2
  product: true,
  order: true,
  customer: true,
  cart: true,
  payment: true,
  fulfillment: true,
  region: true,
  inventory: true,
  stockLocation: true,
  user: true,
  auth: true,
  store: true,
  currency: true,
  priceList: true,
  promotion: true,
};
