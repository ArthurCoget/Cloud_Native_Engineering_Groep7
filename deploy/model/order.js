"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const orderItem_1 = require("./orderItem");
// import {
//     Customer as CustomerPrisma,
//     Product as ProductPrisma,
//     OrderItem as OrderItemPrisma,
//     Order as OrderPrisma,
//     Payment as PaymentPrisma,
// } from '@prisma/client';
class Order {
    id;
    customer;
    items;
    date;
    payment;
    constructor(order) {
        this.validate(order);
        this.id = order.id;
        this.customer = order.customer;
        this.items = order.items;
        this.date = order.date;
        this.payment = order.payment;
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
    getItems() {
        return this.items;
    }
    getDate() {
        return this.date;
    }
    getPayment() {
        return this.payment;
    }
    calculateTotalAmount() {
        return this.items.reduce((total, item) => total + item.getTotalPrice(), 0);
    }
    validate(order) {
        if (!order.customer) {
            throw new Error("Customer cannot be null or undefined.");
        }
        if (!(order.date instanceof Date) || isNaN(order.date.getTime())) {
            throw new Error("Invalid date provided.");
        }
        const currentDate = new Date();
        if (order.date > currentDate) {
            throw new Error("Order date cannot be in the future.");
        }
        if (!order.payment) {
            throw new Error("Payment cannot be null or undefined.");
        }
    }
    addItem(product, quantity) {
        const orderItem = new orderItem_1.OrderItem({ product, quantity });
        this.items.push(orderItem);
        this.payment.setAmount(this.calculateTotalAmount());
    }
    // static from({
    //     customer,
    //     items,
    //     date,
    //     payment,
    //     id,
    // }: OrderPrisma & {
    //     customer: CustomerPrisma;
    //     items: (OrderItemPrisma & { product: ProductPrisma })[];
    //     payment: PaymentPrisma;
    // }) {
    //     const order = new Order({
    //         id,
    //         customer: Customer.fromWithoutWishlist(customer),
    //         items: items.map((item: OrderItemPrisma & { product: ProductPrisma }) =>
    //             OrderItem.from(item)
    //         ),
    //         date,
    //         payment: Payment.from(payment),
    //     });
    //     return order;
    // }
    static fromCosmos({ id, customer, items, date, payment, }) {
        return new Order({
            id,
            customer,
            items,
            date,
            payment,
        });
    }
}
exports.Order = Order;
//# sourceMappingURL=order.js.map