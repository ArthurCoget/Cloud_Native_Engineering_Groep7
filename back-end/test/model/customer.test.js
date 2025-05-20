"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const customer_1 = require("../../model/customer");
const product_1 = require("../../model/product");
const customerTestData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@gmail.com',
    password: 'password',
    role: 'customer',
};
let customer;
beforeEach(() => {
    customer = new customer_1.Customer(Object.assign(Object.assign({}, customerTestData), { wishlist: [] }));
});
const { firstName, lastName, email, password } = customerTestData;
const createCustomer = (overrides = {}) => new customer_1.Customer(Object.assign(Object.assign(Object.assign({}, customerTestData), { wishlist: [] }), overrides));
test('given: valid values for customer, when: customer is created, then: customer is created with those values.', () => {
    expect(customer.getFirstName()).toEqual(firstName);
    expect(customer.getLastName()).toEqual(lastName);
    expect(customer.getEmail()).toEqual(email);
    expect(customer.getPassword()).toEqual(password);
    expect(customer.getWishlist()).toHaveLength(0);
});
test('given: invalid first name for customer, when: customer is created, then: an error is thrown.', () => {
    expect(() => createCustomer({ firstName: '' })).toThrow('The first name is required.');
});
test('given: invalid first name with less than 2 characters for customer, when: customer is created, then: an error is thrown.', () => {
    expect(() => createCustomer({ firstName: 'J' })).toThrow('The first name must be between 2 and 50 characters.');
});
test('given: invalid last name, when: customer is created for customer, then: an error is thrown.', () => {
    expect(() => createCustomer({ lastName: '' })).toThrow('The last name is required.');
});
test('given: invalid last name with less than 2 characters for customer, when: customer is created, then: an error is thrown.', () => {
    expect(() => createCustomer({ lastName: 'B' })).toThrow('The last name must be between 2 and 50 characters.');
});
test('given: invalid email for customer, when: customer is created, then: an error is thrown.', () => {
    expect(() => createCustomer({ email: '' })).toThrow('The email is required.');
});
test('given: invalid email format for customer, when: customer is created, then: an error is thrown.', () => {
    expect(() => createCustomer({ email: 'invalidEmail' })).toThrow('The email format is invalid.');
});
test('given: invalid password for customer, when: customer is created, then: an error is thrown.', () => {
    expect(() => createCustomer({ password: '' })).toThrow('The password is required.');
});
test('given: invalid password less than 8 characters for customer, when: customer is created , then: an error is thrown.', () => {
    expect(() => createCustomer({ password: '1234567' })).toThrow('The password must be at least 8 characters long.');
});
test('given: valid values for update, when: updating the admin, then: admin is updated with those values.', () => {
    const updatedData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@gmail.com',
        password: 'newpassword456',
        role: 'customer',
    };
    customer.updateUser(updatedData);
    expect(customer.getFirstName()).toEqual(updatedData.firstName);
    expect(customer.getLastName()).toEqual(updatedData.lastName);
    expect(customer.getEmail()).toEqual(updatedData.email);
    expect(customer.getPassword()).toEqual(updatedData.password);
});
test('given: a product, when: added to wishlist, then: product appears in wishlist', () => {
    const product = new product_1.Product({
        name: 'T-Shirt',
        price: 30.0,
        stock: 100,
        categories: ['Clothing', 'Men', 'Tops'],
        description: 'A comfortable cotton t-shirt',
        images: 'shirt',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Black', 'White', 'Green'],
        rating: [1, 3, 5],
    });
    const result = customer.addProductToWishlist(product);
    expect(result).toEqual(product);
    expect(customer.getWishlist()).toContain(product);
});
test('given: a product in wishlist, when: removed from wishlist, then: product is no longer in wishlist', () => {
    const product = new product_1.Product({
        name: 'T-Shirt',
        price: 30.0,
        stock: 100,
        categories: ['Clothing', 'Men', 'Tops'],
        description: 'A comfortable cotton t-shirt',
        images: 'shirt',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Black', 'White', 'Green'],
        rating: [1, 3, 5],
    });
    customer.addProductToWishlist(product);
    const result = customer.removeProductFromWishlist(product);
    expect(result).toEqual('Product removed from wishlist.');
    expect(customer.getWishlist()).toHaveLength(0);
});
test('given: product already in wishlist, when: adding product again, then: throws an error.', () => {
    const product = new product_1.Product({
        name: 'T-Shirt',
        price: 30.0,
        stock: 100,
        categories: ['Clothing', 'Men', 'Tops'],
        description: 'A comfortable cotton t-shirt',
        images: 'shirt',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Black', 'White', 'Green'],
        rating: [1, 3, 5],
    });
    customer.addProductToWishlist(product);
    expect(() => customer.addProductToWishlist(product)).toThrow('Product is already in the wishlist.');
});
test('given: product not in wishlist, when: removing product, then: throws an error.', () => {
    const product = new product_1.Product({
        name: 'T-Shirt',
        price: 30.0,
        stock: 100,
        categories: ['Clothing', 'Men', 'Tops'],
        description: 'A comfortable cotton t-shirt',
        images: 'shirt',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Black', 'White', 'Green'],
        rating: [1, 3, 5],
    });
    expect(() => customer.removeProductFromWishlist(product)).toThrow('Product is not in the wishlist.');
});
