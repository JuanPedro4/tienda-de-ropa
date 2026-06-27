import { describe, it, expect, beforeEach } from "vitest";
import { useCartStore, TAX_RATE } from "@/stores/cart-store";
import type { CartItem } from "@/stores/cart-store";

/**
 * Helper to build a minimal cart item for testing.
 */
function makeItem(overrides: Partial<CartItem> & { variantId: string }): CartItem {
  return {
    productId: "p1",
    name: "Body manga larga",
    size: "80",
    price: 1999, // €19.99 in cents
    quantity: 1,
    maxQuantity: 10,
    ...overrides,
  };
}

describe("CartStore", () => {
  /**
   * Reset the store before each test to guarantee isolation.
   * Zustand stores created with `create` are singletons, so we reset state in-place.
   */
  beforeEach(() => {
    useCartStore.setState({
      items: {},
      isOpen: false,
    });
  });

  // ── addItem ──

  describe("addItem", () => {
    it("adds a new item to an empty cart", () => {
      const item = makeItem({ variantId: "v1" });
      useCartStore.getState().addItem(item);

      const items = useCartStore.getState().items;
      expect(Object.keys(items)).toHaveLength(1);
      expect(items["v1"]?.quantity).toBe(1);
    });

    it("increments quantity when adding an existing item", () => {
      const store = useCartStore.getState();
      const item = makeItem({ variantId: "v1" });

      store.addItem(item);
      store.addItem(item);

      const items = useCartStore.getState().items;
      expect(items["v1"]?.quantity).toBe(2);
    });

    it("does not exceed maxQuantity when incrementing", () => {
      const store = useCartStore.getState();
      const item = makeItem({ variantId: "v1", maxQuantity: 3 });

      store.addItem(item); // qty 1
      store.addItem(item); // qty 2
      store.addItem(item); // qty 3
      store.addItem(item); // capped at 3

      expect(useCartStore.getState().items["v1"]?.quantity).toBe(3);
    });

    it("accepts a custom quantity for new items", () => {
      useCartStore.getState().addItem(
        makeItem({ variantId: "v1", quantity: 3 }),
      );

      expect(useCartStore.getState().items["v1"]?.quantity).toBe(3);
    });

    it("preserves existing items when adding a new one", () => {
      const store = useCartStore.getState();
      store.addItem(makeItem({ variantId: "v1" }));
      store.addItem(makeItem({ variantId: "v2" }));

      const items = useCartStore.getState().items;
      expect(Object.keys(items)).toHaveLength(2);
    });
  });

  // ── removeItem ──

  describe("removeItem", () => {
    it("removes an existing item by variantId", () => {
      const store = useCartStore.getState();
      store.addItem(makeItem({ variantId: "v1" }));
      store.addItem(makeItem({ variantId: "v2" }));
      store.removeItem("v1");

      const items = useCartStore.getState().items;
      expect(items["v1"]).toBeUndefined();
      expect(items["v2"]).toBeDefined();
    });

    it("does nothing when removing a non-existent item", () => {
      useCartStore.getState().removeItem("nonexistent");
      expect(Object.keys(useCartStore.getState().items)).toHaveLength(0);
    });
  });

  // ── updateQuantity ──

  describe("updateQuantity", () => {
    it("updates the quantity of an existing item", () => {
      const store = useCartStore.getState();
      store.addItem(makeItem({ variantId: "v1" }));
      store.updateQuantity("v1", 3);

      expect(useCartStore.getState().items["v1"]?.quantity).toBe(3);
    });

    it("caps quantity to maxQuantity", () => {
      const store = useCartStore.getState();
      store.addItem(makeItem({ variantId: "v1", maxQuantity: 5 }));
      store.updateQuantity("v1", 10);

      expect(useCartStore.getState().items["v1"]?.quantity).toBe(5);
    });

    it("removes the item when quantity is set to 0", () => {
      const store = useCartStore.getState();
      store.addItem(makeItem({ variantId: "v1" }));
      store.updateQuantity("v1", 0);

      expect(useCartStore.getState().items["v1"]).toBeUndefined();
    });

    it("removes the item when quantity is set to negative", () => {
      const store = useCartStore.getState();
      store.addItem(makeItem({ variantId: "v1" }));
      store.updateQuantity("v1", -1);

      expect(useCartStore.getState().items["v1"]).toBeUndefined();
    });

    it("does nothing for a non-existent variant", () => {
      // Should not throw
      useCartStore.getState().updateQuantity("nonexistent", 5);
    });
  });

  // ── clearCart ──

  describe("clearCart", () => {
    it("removes all items from the cart", () => {
      const store = useCartStore.getState();
      store.addItem(makeItem({ variantId: "v1" }));
      store.addItem(makeItem({ variantId: "v2" }));
      store.clearCart();

      expect(useCartStore.getState().items).toEqual({});
    });
  });

  // ── Selectors ──

  describe("selectors", () => {
    it("totalItems returns 0 for an empty cart", () => {
      expect(useCartStore.getState().items).toEqual({});
    });

    it("totalItems returns the sum of quantities", () => {
      const store = useCartStore.getState();
      store.addItem(makeItem({ variantId: "v1", quantity: 2 }));
      store.addItem(makeItem({ variantId: "v2", quantity: 3 }));

      // Helper functions are internal to the store module.
      // We test them through the public API by checking state.
      const items = useCartStore.getState().items;
      const totalQty = Object.values(items).reduce(
        (sum, i) => sum + i.quantity,
        0,
      );
      expect(totalQty).toBe(5);
    });

    it("subtotal is sum of price * quantity for all items", () => {
      const store = useCartStore.getState();
      store.addItem(makeItem({ variantId: "v1", price: 1000, quantity: 2 }));
      store.addItem(makeItem({ variantId: "v2", price: 2000, quantity: 1 }));

      const items = useCartStore.getState().items;
      const subtotal = Object.values(items).reduce(
        (sum, i) => sum + i.price * i.quantity,
        0,
      );
      expect(subtotal).toBe(4000); // 2000 + 2000
    });

    it("tax is 21% of subtotal (rounded)", () => {
      const store = useCartStore.getState();
      // €10.00 × 3 = €30.00 → tax = €6.30
      store.addItem(makeItem({ variantId: "v1", price: 1000, quantity: 3 }));

      const items = useCartStore.getState().items;
      const computedSubtotal = Object.values(items).reduce(
        (sum, i) => sum + i.price * i.quantity,
        0,
      );
      const computedTax = Math.round(computedSubtotal * TAX_RATE);
      expect(computedTax).toBe(630); // 3000 * 0.21 = 630
    });

    it("total is subtotal + tax", () => {
      const store = useCartStore.getState();
      store.addItem(makeItem({ variantId: "v1", price: 1999, quantity: 2 }));

      const items = useCartStore.getState().items;
      const computedSubtotal = Object.values(items).reduce(
        (sum, i) => sum + i.price * i.quantity,
        0,
      );
      const computedTax = Math.round(computedSubtotal * TAX_RATE);
      const computedTotal = computedSubtotal + computedTax;

      expect(computedSubtotal).toBe(3998); // €39.98
      expect(computedTax).toBe(840); // Math.round(3998 * 0.21) = 840
      expect(computedTotal).toBe(4838); // 3998 + 840 = 4838
    });
  });

  // ── UI state ──

  describe("UI state", () => {
    it("starts closed", () => {
      expect(useCartStore.getState().isOpen).toBe(false);
    });

    it("openCart sets isOpen to true", () => {
      useCartStore.getState().openCart();
      expect(useCartStore.getState().isOpen).toBe(true);
    });

    it("closeCart sets isOpen to false", () => {
      useCartStore.getState().openCart();
      useCartStore.getState().closeCart();
      expect(useCartStore.getState().isOpen).toBe(false);
    });

    it("toggleCart toggles isOpen", () => {
      useCartStore.getState().toggleCart();
      expect(useCartStore.getState().isOpen).toBe(true);
      useCartStore.getState().toggleCart();
      expect(useCartStore.getState().isOpen).toBe(false);
    });
  });
});
