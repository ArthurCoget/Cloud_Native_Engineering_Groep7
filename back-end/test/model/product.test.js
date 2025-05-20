"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const product_1 = require("../../model/product");
const validProductTestData = {
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
let product;
beforeEach(() => {
    product = new product_1.Product(validProductTestData);
});
const { name, price, stock, categories, description, images, sizes, colors } = validProductTestData;
const createProduct = (overrides = {}) => new product_1.Product(Object.assign(Object.assign({}, validProductTestData), overrides));
test('given: valid values for product, when: product is created, then: product is created with those values', () => {
    expect(product.getName()).toEqual('T-Shirt');
    expect(product.getPrice()).toEqual(30.0);
    expect(product.getStock()).toEqual(100);
    expect(product.getCategories()).toEqual(['Clothing', 'Men', 'Tops']);
    expect(product.getDescription()).toEqual('A comfortable cotton t-shirt');
    expect(product.getImages()).toEqual('shirt');
    expect(product.getSizes()).toEqual(['S', 'M', 'L', 'XL']);
    expect(product.getColors()).toEqual(['Black', 'White', 'Green']);
});
test('given: no name for product, when: product is created, then: an error is thrown.', () => {
    expect(() => createProduct({ name: '' })).toThrow('The product name is required.');
});
test('given: invalid name length for product, when: product is created, then: an error is thrown.', () => {
    expect(() => createProduct({ name: 'a' })).toThrow('The product name must be between 2 and 50 characters.');
});
test('given: invalid price for product, when: product is created, then: an error is thrown.', () => {
    expect(() => createProduct({ price: 0 })).toThrow('Price must be greater than zero.');
});
test('given: negative stock for product, when: product is created, then: an error is thrown.', () => {
    expect(() => createProduct({ stock: -1 })).toThrow('Stock must be positive.');
});
test('given: no categories for product, when: product is created, then: an error is thrown.', () => {
    expect(() => createProduct({ categories: [] })).toThrow('Product must belong to at least one categories.');
});
test('given: no description for product, when: product is created, then: an error is thrown.', () => {
    expect(() => createProduct({ description: '' })).toThrow('The product description is required.');
});
test('given: no images for product, when: product is created, then: an error is thrown.', () => {
    expect(() => createProduct({ images: '' })).toThrow('The product image is required.');
});
test('given: no sizes for product, when: product is created, then: an error is thrown.', () => {
    expect(() => createProduct({ sizes: [] })).toThrow('Product must be available in at least one size.');
});
test('given: invalid size for product, when: product is created, then: an error is thrown.', () => {
    expect(() => createProduct({ sizes: ['s'] })).toThrow('All sizes must be "XS" or "S" or "M" or "L" or "XL".');
});
test('given: no colors for product, when: product is created, then: an error is thrown.', () => {
    expect(() => createProduct({ colors: [] })).toThrow('Product must be available in at least one color.');
});
test('given: invalid image for product, when: product is created, then: an error is thrown.', () => {
    expect(() => createProduct({ images: 'invalid' })).toThrow('Image must be one of the following: shoes, shirt, hoodie, watch, jeans, gloves, cap, socks or none.');
});
