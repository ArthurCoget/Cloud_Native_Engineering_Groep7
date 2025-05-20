"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cartItem_1 = require("../../model/cartItem");
const customer_1 = require("../../model/customer");
const product_1 = require("../../model/product");
const customerTestData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@gmail.com',
    password: 'password',
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
let customer;
let product;
let cartItem;
beforeEach(() => {
    customer = new customer_1.Customer(customerTestData);
    product = new product_1.Product(productTestData);
    cartItem = new cartItem_1.CartItem({ product, quantity: 2 });
});
test('given: valid values for cartItem, when: cartItem is created, then: cartItem is created with those values.', () => {
    expect(cartItem.getProduct()).toEqual(product);
    expect(cartItem.getQuantity()).toEqual(2);
    expect(cartItem.getTotalPrice()).toEqual(60);
});
test('given: invalid product, when: cartItem is created, then: error is thrown.', () => {
    expect(() => new cartItem_1.CartItem({ product: null, quantity: 2 })).toThrow('Product cannot be null or undefined.');
});
test('given: invalid quantity, when: cartItem is created, then: error is thrown.', () => {
    expect(() => new cartItem_1.CartItem({ product, quantity: 0 })).toThrow('Quantity must be greater than zero.');
});
test('given: valid new quantity, when: increasingQuantity, then: quantity is updated.', () => {
    cartItem.increaseQuantity(5);
    expect(cartItem.getQuantity()).toEqual(5);
});
test('given: not enough stock, when: increasingQuantity, then: error is thrown.', () => {
    product.setStock(4);
    expect(() => cartItem.increaseQuantity(10)).toThrow('Not enough stock available to update the quantity.');
});
test('given: invalid quantity, when: increasingQuantity, then: error is thrown.', () => {
    expect(() => cartItem.increaseQuantity(0)).toThrow('Quantity must be greater than zero.');
});
test('given: valid quantity, when: decreasingQuantity, then: quantity is updated.', () => {
    cartItem.decreaseQuantity(1);
    expect(cartItem.getQuantity()).toEqual(1);
});
