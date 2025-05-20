"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const customer_1 = require("./customer");
const orderItem_1 = require("./orderItem");
const payment_1 = require("./payment");
class Order {
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
            throw new Error('Customer cannot be null or undefined.');
        }
        if (!(order.date instanceof Date) || isNaN(order.date.getTime())) {
            throw new Error('Invalid date provided.');
        }
        const currentDate = new Date();
        if (order.date > currentDate) {
            throw new Error('Order date cannot be in the future.');
        }
        if (!order.payment) {
            throw new Error('Payment cannot be null or undefined.');
        }
    }
    addItem(product, quantity) {
        const orderItem = new orderItem_1.OrderItem({ product, quantity });
        this.items.push(orderItem);
        this.payment.setAmount(this.calculateTotalAmount());
    }
    static from({ customer, items, date, payment, id, }) {
        const order = new Order({
            id,
            customer: customer_1.Customer.fromWithoutWishlist(customer),
            items: items.map((item) => orderItem_1.OrderItem.from(item)),
            date,
            payment: payment_1.Payment.from(payment),
        });
        return order;
    }
}
exports.Order = Order;
