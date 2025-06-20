"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cart = void 0;
const cartItem_1 = require("./cartItem");
// import {
//     Customer as CustomerPrisma,
//     Product as ProductPrisma,
//     CartItem as CartItemPrisma,
//     Cart as CartPrisma,
//     DiscountCode as DiscountCodePrisma,
// } from '@prisma/client';
class Cart {
    id;
    customer;
    products;
    totalAmount;
    discountCodes;
    constructor(cart) {
        this.validate(cart);
        this.id = cart.id;
        this.customer = cart.customer;
        this.products = cart.products;
        this.discountCodes = [];
        cart.discountCodes.forEach((discountCode) => this.applyDiscountCode(discountCode));
        this.discountCodes = cart.discountCodes;
        this.totalAmount = this.calculateTotalAmount();
    }
    getId() {
        return this.id;
    }
    setId(id) {
        this.id = id;
    }
    getCustomer() {
        return this.customer;
    }
    getProducts() {
        return this.products;
    }
    getDiscountCodes() {
        return this.discountCodes;
    }
    getTotalAmount() {
        return this.totalAmount;
    }
    // calculateTotalAmount() {
    //     return this.products.reduce((total, item) => total + item.getTotalPrice(), 0);
    // }
    setTotalAmount(totalAmount) {
        if (totalAmount < 0) {
            throw new Error("Total amount cannot be negative.");
        }
        this.totalAmount = totalAmount;
    }
    applyDiscountCode(discountCode) {
        if (!discountCode.isActiveCode()) {
            throw new Error("Inactive or expired discount code.");
        }
        if (discountCode.getType() === "percentage") {
            const existingPercentageDiscount = this.discountCodes.find((discountCode) => discountCode.getType() === "percentage");
            if (existingPercentageDiscount) {
                throw new Error("Only one percentage discount can be applied.");
            }
        }
        const existingDiscountIndex = this.discountCodes.findIndex((existingDiscountCode) => existingDiscountCode.getCode() === discountCode.getCode());
        if (existingDiscountIndex !== -1) {
            throw new Error("This discount code has already been applied to your cart.");
        }
        this.discountCodes.push(discountCode);
        this.totalAmount = this.calculateTotalAmount();
        return discountCode;
    }
    removeDiscountCode(discountCode) {
        const existingDiscountIndex = this.discountCodes.findIndex((existingDiscountCode) => existingDiscountCode.getCode() === discountCode.getCode());
        if (existingDiscountIndex === -1) {
            throw new Error("That discount code had not been applied to your cart.");
        }
        this.discountCodes.splice(existingDiscountIndex, 1);
        this.totalAmount = this.calculateTotalAmount();
        return "That discount code has been removed from your cart.";
    }
    calculateTotalAmount() {
        const subtotal = this.products.reduce((total, item) => total + item.getTotalPrice(), 0);
        let totalDiscount = 0;
        this.discountCodes.forEach((discountCode) => {
            if (discountCode.getType() === "fixed") {
                totalDiscount += discountCode.getValue();
            }
            else if (discountCode.getType() === "percentage") {
                totalDiscount += subtotal * (discountCode.getValue() / 100);
            }
        });
        return Math.max(0, subtotal - totalDiscount);
    }
    validate(cart) {
        if (!cart.customer) {
            throw new Error("Customer cannot be null or undefined.");
        }
    }
    addItem(product, quantity) {
        if (quantity <= 0)
            throw new Error("Quantity must be greater than zero.");
        const existingProductIndex = this.products.findIndex((item) => item.getProduct().getId() === product.getId());
        if (existingProductIndex !== -1) {
            const existingQuantity = this.products[existingProductIndex].getQuantity();
            this.products[existingProductIndex].increaseQuantity(existingQuantity + quantity);
            this.totalAmount = this.calculateTotalAmount();
            return this.products[existingProductIndex];
        }
        else {
            const cartItem = new cartItem_1.CartItem({ product, quantity });
            this.products.push(cartItem);
            this.totalAmount = this.calculateTotalAmount();
            return cartItem;
        }
    }
    removeItem(product, quantity) {
        if (quantity <= 0)
            throw new Error("Quantity must be greater than zero.");
        const existingProductIndex = this.products.findIndex((item) => item.getProduct().getId() === product.getId());
        if (existingProductIndex === -1)
            throw new Error("Product not in cart.");
        const existingQuantity = this.products[existingProductIndex].getQuantity();
        if (existingQuantity < quantity)
            throw new Error("There are not that many products in the cart to remove.");
        this.products[existingProductIndex].decreaseQuantity(existingQuantity - quantity);
        if (this.products[existingProductIndex].getQuantity() === 0) {
            this.products.splice(existingProductIndex, 1);
            this.totalAmount = this.calculateTotalAmount();
            return "Item removed from cart.";
        }
        else {
            this.totalAmount = this.calculateTotalAmount();
            return this.products[existingProductIndex];
        }
    }
    emptyCart() {
        this.products = [];
        this.discountCodes = [];
        this.totalAmount = 0;
    }
    // static from({
    //     id,
    //     customer,
    //     cartItems,
    //     discountCodes,
    // }: CartPrisma & {
    //     customer: CustomerPrisma;
    //     cartItems: (CartItemPrisma & { product: ProductPrisma })[];
    //     discountCodes: DiscountCodePrisma[];
    // }) {
    //     const cart = new Cart({
    //         id,
    //         customer: Customer.fromWithoutWishlist(customer),
    //         products: cartItems.map((cartItem: CartItemPrisma & { product: ProductPrisma }) =>
    //             CartItem.from(cartItem)
    //         ),
    //         discountCodes: discountCodes.map((discountCode: DiscountCodePrisma) =>
    //             DiscountCode.from(discountCode)
    //         ),
    //     });
    //     cart.totalAmount = cart.calculateTotalAmount();
    //     return cart;
    // }
    static fromCosmos({ id, customer, products, discountCodes, totalAmount, }) {
        const cart = new Cart({
            id,
            customer,
            products,
            discountCodes,
        });
        cart.setTotalAmount(totalAmount);
        return cart;
    }
}
exports.Cart = Cart;
//# sourceMappingURL=cart.js.map