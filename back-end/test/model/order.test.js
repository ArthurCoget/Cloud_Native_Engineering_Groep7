"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const date_fns_1 = require("date-fns");
const customer_1 = require("../../model/customer");
const product_1 = require("../../model/product");
const payment_1 = require("../../model/payment");
const order_1 = require("../../model/order");
const customerTestData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'securepassword123',
    role: 'customer',
    wishlist: [],
};
const productTestData = {
    name: 'T-Shirt',
    price: 30.0,
    stock: 100,
    categories: ['Clothing', 'Men', 'Tops'],
    description: 'A comfortable cotton t-shirt',
    images: 'shirt',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'White', 'Green'],
    rating: [1, 3, 5],
};
const paymentTestData = {
    amount: 60,
    date: (0, date_fns_1.set)(new Date(), { year: 2024, month: 2, date: 23 }),
    paymentStatus: 'paid',
};
let customer;
let product;
let payment;
let order;
beforeEach(() => {
    customer = new customer_1.Customer(customerTestData);
    product = new product_1.Product(productTestData);
    payment = new payment_1.Payment(paymentTestData);
    order = new order_1.Order({ customer, items: [], date: paymentTestData.date, payment });
    order.addItem(product, 2);
});
test('given: valid values for order, when: order is created, then: order is created with those values', () => {
    expect(order.getCustomer()).toEqual(customer);
    expect(order
        .getItems()
        .some((orderItem) => orderItem.getProduct() === product && orderItem.getQuantity() === 2)).toBe(true);
    expect(order.getDate()).toEqual(paymentTestData.date);
    expect(order.getPayment()).toEqual(payment);
});
test('given: invalid customer, when: order is created, then: error is thrown.', () => {
    expect(() => new order_1.Order({ customer: null, items: [], date: paymentTestData.date, payment })).toThrow('Customer cannot be null or undefined.');
});
test('given: invalid payment, when: order is created, then: error is thrown.', () => {
    expect(() => new order_1.Order({ customer, items: [], date: paymentTestData.date, payment: null })).toThrow('Payment cannot be null or undefined.');
});
test('given: invalid date, when: order is created, then: error is thrown.', () => {
    expect(() => new order_1.Order({ customer, items: [], date: new Date('invalid-date-string'), payment })).toThrow('Invalid date provided.');
});
test('given: future date, when: order is created, then: error is thrown.', () => {
    expect(() => new order_1.Order({
        customer,
        items: [],
        date: (0, date_fns_1.set)(new Date(), { year: 2124, month: 2, date: 23 }),
        payment,
    })).toThrow('Order date cannot be in the future.');
});
test('given: order with multiple items, when: getTotalAmount is called, then: correct total amount is returned', () => {
    const product2 = new product_1.Product(Object.assign(Object.assign({}, productTestData), { name: 'Jeans', price: 50.0 }));
    order.addItem(product2, 1);
    const expectedTotalAmount = product.getPrice() * 2 + product2.getPrice();
    expect(order.calculateTotalAmount()).toBe(expectedTotalAmount);
});
test('given: order with no items, when: getTotalAmount is called, then: total amount is zero', () => {
    const emptyOrder = new order_1.Order({ customer, items: [], date: paymentTestData.date, payment });
    expect(emptyOrder.calculateTotalAmount()).toBe(0);
});
