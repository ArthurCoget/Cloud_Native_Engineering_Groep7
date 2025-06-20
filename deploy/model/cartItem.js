"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartItem = void 0;
// import { Product as ProductPrisma, CartItem as CartItemPrisma } from '@prisma/client';
class CartItem {
    id;
    product;
    quantity;
    constructor(cartItem) {
        this.validate(cartItem);
        this.id = cartItem.id;
        this.product = cartItem.product;
        this.quantity = cartItem.quantity;
    }
    getId() {
        return this.id;
    }
    getProduct() {
        return this.product;
    }
    getQuantity() {
        return this.quantity;
    }
    validate(cartItem) {
        if (!cartItem.product) {
            throw new Error("Product cannot be null or undefined.");
        }
        if (cartItem.quantity <= 0) {
            throw new Error("Quantity must be greater than zero.");
        }
    }
    increaseQuantity(newQuantity) {
        if (newQuantity <= 0) {
            throw new Error("Quantity must be greater than zero.");
        }
        const quantityDifference = newQuantity - this.quantity;
        if (quantityDifference > 0 && this.product.getStock() < newQuantity) {
            throw new Error("Not enough stock available to update the quantity.");
        }
        this.quantity = newQuantity;
    }
    decreaseQuantity(newQuantity) {
        this.quantity = newQuantity;
    }
    getTotalPrice() {
        return this.product.getPrice() * this.quantity;
    }
    // static from({ id, product, quantity }: CartItemPrisma & { product: ProductPrisma }) {
    //     return new CartItem({
    //         id,
    //         product: Product.from(product),
    //         quantity,
    //     });
    // }
    static fromCosmos({ id, product, quantity, }) {
        return new CartItem({
            id,
            product,
            quantity,
        });
    }
}
exports.CartItem = CartItem;
//# sourceMappingURL=cartItem.js.map