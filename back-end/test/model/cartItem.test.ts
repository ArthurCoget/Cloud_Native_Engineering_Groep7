import { Cart } from '../../model/cart';
import { CartItem } from '../../model/cartItem';
import { Customer } from '../../model/customer';
import { Product } from '../../model/product';
import { Role } from '../../types';

const customerTestData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@gmail.com',
    password: 'password',
    role: 'customer' as Role,
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

let customer: Customer;
let product: Product;
let cartItem: CartItem;

beforeEach(() => {
    customer = new Customer(customerTestData);
    product = new Product(productTestData);
    cartItem = new CartItem({ product, quantity: 2 });
});

test('given: valid values for cartItem, when: cartItem is created, then: cartItem is created with those values.', () => {
    expect(cartItem.getProduct()).toEqual(product);
    expect(cartItem.getQuantity()).toEqual(2);
    expect(cartItem.getTotalPrice()).toEqual(60);
});

test('given: invalid product, when: cartItem is created, then: error is thrown.', () => {
    expect(() => new CartItem({ product: null as any, quantity: 2 })).toThrow(
        'Product cannot be null or undefined.'
    );
});

test('given: invalid quantity, when: cartItem is created, then: error is thrown.', () => {
    expect(() => new CartItem({ product, quantity: 0 })).toThrow(
        'Quantity must be greater than zero.'
    );
});

test('given: valid new quantity, when: increasingQuantity, then: quantity is updated.', () => {
    cartItem.increaseQuantity(5);
    expect(cartItem.getQuantity()).toEqual(5);
});

test('given: not enough stock, when: increasingQuantity, then: error is thrown.', () => {
    product.setStock(4);
    expect(() => cartItem.increaseQuantity(10)).toThrow(
        'Not enough stock available to update the quantity.'
    );
});

test('given: invalid quantity, when: increasingQuantity, then: error is thrown.', () => {
    expect(() => cartItem.increaseQuantity(0)).toThrow('Quantity must be greater than zero.');
});

test('given: valid quantity, when: decreasingQuantity, then: quantity is updated.', () => {
    cartItem.decreaseQuantity(1);
    expect(cartItem.getQuantity()).toEqual(1);
});
