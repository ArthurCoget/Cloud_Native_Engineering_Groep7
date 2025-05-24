import { Cart } from '../../src/model/cart';
import { Customer } from '../../src/model/customer';
import { DiscountCode } from '../../src/model/discountCode';
import { Product } from '../../src/model/product';
import { Role } from '../../types';

const customerTestData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@gmail.com',
    password: 'password',
    role: 'customer' as Role,
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

const percentageDiscountTestData = {
    code: 'SAVE10',
    type: 'percentage',
    value: 10,
    expirationDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
    isActive: true,
};

const fixedDiscountTestData1 = {
    code: 'SAVE110',
    type: 'fixed',
    value: 110,
    expirationDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
    isActive: true,
};

const fixedDiscountTestData2 = {
    code: 'SAVE50',
    type: 'fixed',
    value: 50,
    expirationDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
    isActive: true,
};

let customer: Customer;
let product: Product;
let cart: Cart;
let percentageDiscountCode: DiscountCode;
let fixedDiscountCode1: DiscountCode;
let fixedDiscountCode2: DiscountCode;

beforeEach(() => {
    customer = new Customer({ ...customerTestData, wishlist: [] });
    product = new Product(productTestData);
    cart = new Cart({ customer, products: [], discountCodes: [] });
    percentageDiscountCode = new DiscountCode(percentageDiscountTestData);
    fixedDiscountCode1 = new DiscountCode(fixedDiscountTestData1);
    fixedDiscountCode2 = new DiscountCode(fixedDiscountTestData2);
});

test('given: valid values for cart, when: cart is created, then: cart is created with those values.', () => {
    expect(cart.getCustomer()).toEqual(customer);
    expect(cart.getProducts()).toHaveLength(0);
    expect(cart.getTotalAmount()).toEqual(0);
});

test('given: product not in cart, when: product is added, then: product is added as a new CartItem.', () => {
    cart.addItem(product, 2);

    expect(cart.getProducts()).toHaveLength(1);
    expect(cart.getProducts()[0].getProduct()).toEqual(product);
    expect(cart.getProducts()[0].getQuantity()).toEqual(2);
    expect(cart.getTotalAmount()).toEqual(60);
});

test('given: invalid customer, when: cart is created, then: an error is thrown.', () => {
    expect(() => new Cart({ customer: null as any, products: [], discountCodes: [] })).toThrow(
        'Customer cannot be null or undefined.'
    );
});

test('given: invalid quantity, when: cart item is added to cart, then: an error is thrown.', () => {
    expect(() => cart.addItem(product, -1)).toThrow('Quantity must be greater than zero.');
});

test('given: product already in cart, when: same product is added again, then: quantity is updated and stock remains the same.', () => {
    cart.addItem(product, 2);
    cart.addItem(product, 3);

    expect(cart.getProducts()).toHaveLength(1);
    expect(cart.getProducts()[0].getQuantity()).toEqual(5);
    expect(product.getStock()).toEqual(100);
    expect(cart.getTotalAmount()).toEqual(150);
});

test('given: product in cart, when: decrease quantity, then: quantity is decreased.', () => {
    cart.addItem(product, 5);
    const result = cart.removeItem(product, 3);

    expect(result).toEqual(cart.getProducts()[0]);
    expect(cart.getProducts()[0].getQuantity()).toEqual(2);
    expect(cart.getTotalAmount()).toEqual(60);
});

test('given: product in cart, when: decrease quantity to zero, then: item is removed from cart.', () => {
    cart.addItem(product, 5);
    const result = cart.removeItem(product, 5);

    expect(result).toEqual('Item removed from cart.');
    expect(cart.getProducts()).toHaveLength(0);
    expect(cart.getTotalAmount()).toEqual(0);
});

test('given: product not in cart, when: removing item, then: error is thrown.', () => {
    expect(() => cart.removeItem(product, 1)).toThrow('Product not in cart.');
});

test('given: product in cart, when: removing more items than there are in the cart, then: error is thrown.', () => {
    cart.addItem(product, 2);
    expect(() => cart.removeItem(product, 5)).toThrow(
        'There are not that many products in the cart to remove.'
    );
});

test('given: invalid quantity, when: removing item, then: error is thrown.', () => {
    expect(() => cart.removeItem(product, 0)).toThrow('Quantity must be greater than zero.');
});

test('given: valid fixed discount code, when: applied, then: total amount is reduced.', () => {
    cart.addItem(product, 4);
    cart.applyDiscountCode(fixedDiscountCode1);

    expect(cart.getDiscountCodes()).toHaveLength(1);
    expect(cart.getTotalAmount()).toEqual(10);
});

test('given: valid percentage discount code, when: applied, then: total amount is reduced by percentage.', () => {
    cart.addItem(product, 5);
    cart.applyDiscountCode(percentageDiscountCode);

    expect(cart.getDiscountCodes()).toHaveLength(1);
    expect(cart.getTotalAmount()).toEqual(135);
});

test('given: multiple fixed discounts, when: applied, then: all fixed discounts are applied.', () => {
    cart.addItem(product, 5);
    cart.applyDiscountCode(fixedDiscountCode1);
    cart.applyDiscountCode(fixedDiscountCode2);

    expect(cart.getDiscountCodes()).toHaveLength(2);
    expect(cart.getTotalAmount()).toEqual(0);
});

test('given: percentage discount already applied, when: another percentage discount is applied, then: error is thrown.', () => {
    cart.applyDiscountCode(percentageDiscountCode);

    expect(() => cart.applyDiscountCode(percentageDiscountCode)).toThrow(
        'Only one percentage discount can be applied.'
    );
});

test('given: inactive discount code, when: applied, then: error is thrown.', () => {
    const inactiveDiscountCode = new DiscountCode({ ...fixedDiscountTestData1, isActive: false });

    expect(() => cart.applyDiscountCode(inactiveDiscountCode)).toThrow(
        'Inactive or expired discount code.'
    );
});

test('given: discount code applied, when: removed, then: discount code is removed and total is recalculated.', () => {
    cart.addItem(product, 5);
    cart.applyDiscountCode(fixedDiscountCode1);

    const result = cart.removeDiscountCode(fixedDiscountCode1);

    expect(result).toEqual('That discount code has been removed from your cart.');
    expect(cart.getDiscountCodes()).toHaveLength(0);
    expect(cart.getTotalAmount()).toEqual(150);
});

test('given: discount code not in cart, when: attempting to remove discount code, then: error is thrown.', () => {
    cart.addItem(product, 5);

    cart.applyDiscountCode(fixedDiscountCode1);

    expect(() => cart.removeDiscountCode(percentageDiscountCode)).toThrow(
        'That discount code had not been applied to your cart.'
    );
});

test('given: product in cart, when: product quantity decreased, then: total amount is recalculated.', () => {
    cart.addItem(product, 5);
    cart.applyDiscountCode(fixedDiscountCode1);

    cart.removeItem(product, 3);

    expect(cart.getTotalAmount()).toEqual(0);
});

test('given: items in cart, when: cart is emptied, then: all products and discount codes are removed.', () => {
    cart.addItem(product, 5);
    cart.applyDiscountCode(percentageDiscountCode);
    cart.applyDiscountCode(fixedDiscountCode1);

    cart.emptyCart();

    console.log(cart);

    expect(cart.getProducts()).toHaveLength(0);
    expect(cart.getDiscountCodes()).toHaveLength(0);
    expect(cart.getTotalAmount()).toEqual(0);
});

test('given: discount code already applied, when: same discount code is applied again, then: error is thrown.', () => {
    cart.addItem(product, 5);
    cart.applyDiscountCode(fixedDiscountCode1);

    expect(() => cart.applyDiscountCode(fixedDiscountCode1)).toThrow(
        'This discount code has already been applied to your cart.'
    );
});
