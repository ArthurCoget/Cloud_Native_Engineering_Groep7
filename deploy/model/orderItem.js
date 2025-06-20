"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderItem = void 0;
// import { OrderItem as OrderItemPrisma, Product as ProductPrisma } from '@prisma/client';
class OrderItem {
    id;
    product;
    quantity;
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
            throw new Error("Product cannot be null or undefined.");
        }
        if (orderItem.quantity <= 0) {
            throw new Error("Quantity must be greater than zero.");
        }
    }
    // static from({ id, product, quantity }: OrderItemPrisma & { product: ProductPrisma }) {
    //     return new OrderItem({
    //         id,
    //         product: Product.from(product),
    //         quantity,
    //     });
    // }
    static fromCosmos({ id, product, quantity, }) {
        return new OrderItem({
            id,
            product,
            quantity,
        });
    }
}
exports.OrderItem = OrderItem;
//# sourceMappingURL=orderItem.js.map