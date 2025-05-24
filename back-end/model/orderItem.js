"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderItem = void 0;
const product_1 = require("./product");
class OrderItem {
    constructor(orderItem) {
        this.validate(orderItem);
        this.id = orderItem.id;
        this.product = orderItem.product;
        this.quantity = orderItem.quantity;
        this.product.updateStock(-this.quantity);
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
    getTotalPrice() {
        return this.product.getPrice() * this.quantity;
    }
    validate(orderItem) {
        if (!orderItem.product) {
            throw new Error('Product cannot be null or undefined.');
        }
        if (orderItem.quantity <= 0) {
            throw new Error('Quantity must be greater than zero.');
        }
    }
    static from({ id, product, quantity }) {
        return new OrderItem({
            id,
            product: product_1.Product.from(product),
            quantity,
        });
    }
}
exports.OrderItem = OrderItem;
