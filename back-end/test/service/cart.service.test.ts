import { Cart } from '../../model/cart';
import { CartItem } from '../../model/cartItem';
import { Customer } from '../../model/customer';
import { DiscountCode } from '../../model/discountCode';
import { Order } from '../../model/order';
import { OrderItem } from '../../model/orderItem';
import { Payment } from '../../model/payment';
import { Product } from '../../model/product';
import cartDb from '../../repository/cart.db';
import discountCodeDb from '../../repository/discountCode.db';
import orderDb from '../../repository/order.db';
import productDb from '../../repository/product.db';
import cartService from '../../service/cart.service';

const customers: Customer[] = [
    new Customer({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        role: 'customer',
        wishlist: [],
        id: 1,
    }),
    new Customer({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        password: 'password456',
        role: 'customer',
        wishlist: [],
        id: 2,
    }),
    new Customer({
        firstName: 'Bob',
        lastName: 'Smith',
        email: 'bob.smith@example.com',
        password: 'password789',
        role: 'customer',
        wishlist: [],
        id: 3,
    }),
];
const product1 = new Product({
    name: 'T-Shirt',
    price: 20.0,
    stock: 100,
    categories: ['Clothing'],
    description: 'A comfortable cotton T-shirt',
    images: 'shirt',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Red', 'Blue', 'Green'],
    rating: [1, 3, 5],
    id: 1,
});

const product2 = new Product({
    name: 'Sneakers',
    price: 50.0,
    stock: 50,
    categories: ['Footwear'],
    description: 'Stylish and comfortable sneakers',
    images: 'shoes',
    sizes: ['M', 'L'],
    colors: ['Black', 'White'],
    rating: [1, 3, 5],
    id: 2,
});

const carts: Cart[] = [];

const cartJohn = new Cart({
    customer: customers[0],
    products: [new CartItem({ product: product1, quantity: 2 })],
    discountCodes: [],
    id: 1,
});
carts.push(cartJohn);

const cartJane = new Cart({
    customer: customers[1],
    products: [new CartItem({ product: product2, quantity: 1 })],
    discountCodes: [],
    id: 2,
});
carts.push(cartJane);

const order1 = new Order({
    customer: customers[0],
    items: [
        new OrderItem({
            product: product1,
            quantity: 2,
        }),
    ],
    date: new Date('2024-11-02T13:05:28.149Z'),
    payment: new Payment({
        amount: 40.0,
        date: new Date('2024-11-02T13:05:28.149Z'),
        paymentStatus: 'paid',
    }),
    id: 1,
});

const order2 = new Order({
    customer: customers[1],
    items: [
        new OrderItem({
            product: product2,
            quantity: 1,
        }),
    ],
    date: new Date(),
    payment: new Payment({
        amount: 50.0,
        date: new Date(),
        paymentStatus: 'paid',
    }),
    id: 2,
});

const discount = new DiscountCode({
    code: 'SAVE10',
    type: 'percentage',
    value: 10,
    expirationDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
    isActive: true,
});

let mockCartDbGetCarts: jest.Mock;
let mockCartDbGetCartById: jest.Mock;
let mockCartDbGetCartByCustomerEmail: jest.Mock;
let mockCartDbAddCartItem: jest.Mock;
let mockCartDbRemoveCartItem: jest.Mock;
let mockProductDbGetProductById: jest.Mock;
let mockOrderDbCreateOrder: jest.Mock;
let mockCartDbDeleteCart: jest.Mock;
let mockCartDbEmptyCart: jest.Mock;
let mockDiscountCodeDbGetDiscountCodeByCode: jest.Mock;
let mockCartDbAddDiscountCode: jest.Mock;
let mockCartDbRemoveDiscountCode: jest.Mock;

beforeEach(() => {
    mockCartDbGetCarts = jest.fn();
    mockCartDbGetCartById = jest.fn();
    mockCartDbGetCartByCustomerEmail = jest.fn();
    mockCartDbAddCartItem = jest.fn();
    mockCartDbRemoveCartItem = jest.fn();
    mockProductDbGetProductById = jest.fn();
    mockOrderDbCreateOrder = jest.fn();
    mockCartDbDeleteCart = jest.fn();
    mockCartDbEmptyCart = jest.fn();
    mockDiscountCodeDbGetDiscountCodeByCode = jest.fn();
    mockCartDbAddDiscountCode = jest.fn();
    mockCartDbRemoveDiscountCode = jest.fn();
});

afterEach(() => {
    jest.clearAllMocks();
});

test('given carts in the DB, when getting all carts, then all carts are returned', async () => {
    cartDb.getCarts = mockCartDbGetCarts.mockReturnValue(carts);

    const result = await cartService.getCarts('admin@example.com', 'admin');

    expect(result).toEqual(carts);
    expect(mockCartDbGetCarts).toHaveBeenCalled();
});

test('given carts in the DB, when getting cart by id, then that cart is returned', async () => {
    cartDb.getCartById = mockCartDbGetCartById.mockReturnValue(carts[0]);

    const result = await cartService.getCartById(1, 'admin@example.com', 'admin');

    expect(result).toEqual(carts[0]);
    expect(mockCartDbGetCartById).toHaveBeenCalledWith({ id: 1 });
});

test('given carts in the DB, when getting a cart by incorrect id, then an error is thrown', async () => {
    cartDb.getCartById = mockCartDbGetCartById.mockReturnValue(null);

    const getCartById = async () => await cartService.getCartById(3, 'admin@example.com', 'admin');

    await expect(getCartById).rejects.toThrow('Cart with id 3 does not exist.');
    expect(mockCartDbGetCartById).toHaveBeenCalledWith({ id: 3 });
});

test('given carts in the DB, when getting cart by email, then that cart is returned', async () => {
    cartDb.getCartByCustomerEmail = mockCartDbGetCartByCustomerEmail.mockReturnValue(carts[0]);

    const result = await cartService.getCartByEmail(
        'john.doe@example.com',
        'john.doe@example.com',
        'customer'
    );

    expect(result).toEqual(carts[0]);
    expect(mockCartDbGetCartByCustomerEmail).toHaveBeenCalledWith({
        email: 'john.doe@example.com',
    });
});

test('given carts in the DB, when getting a cart by incorrect email, then an error is thrown', async () => {
    cartDb.getCartByCustomerEmail = mockCartDbGetCartByCustomerEmail.mockReturnValue(null);

    const getCartByEmail = async () =>
        await cartService.getCartByEmail('wrong@email.com', 'wrong@email.com', 'customer');

    await expect(getCartByEmail).rejects.toThrow('Cart with email wrong@email.com does not exist.');
    expect(mockCartDbGetCartByCustomerEmail).toHaveBeenCalledWith({ email: 'wrong@email.com' });
});

test('given valid cart and product, when adding an item to cart, then the item is added', async () => {
    cartDb.getCartByCustomerEmail = mockCartDbGetCartByCustomerEmail.mockReturnValue(cartJohn);
    productDb.getProductById = mockProductDbGetProductById.mockReturnValue(product2);
    cartDb.addCartItem = mockCartDbAddCartItem.mockReturnValue(
        new CartItem({ product: product2, quantity: 1 })
    );

    const result = await cartService.addCartItem(
        'john.doe@example.com',
        2,
        1,
        'john.doe@example.com',
        'customer'
    );

    expect(result).toEqual(new CartItem({ product: product2, quantity: 1 }));
    expect(mockCartDbAddCartItem).toHaveBeenCalledWith(cartJohn, product2, 1);
});

test('given valid cart with existing product, when adding quantity to existing product, then quantity is updated', async () => {
    cartDb.getCartByCustomerEmail = mockCartDbGetCartByCustomerEmail.mockReturnValue(cartJohn);
    productDb.getProductById = mockProductDbGetProductById.mockReturnValue(product1);
    cartDb.addCartItem = mockCartDbAddCartItem.mockReturnValue(
        new CartItem({ product: product1, quantity: 3 })
    );

    const result = await cartService.addCartItem(
        'john.doe@example.com',
        1,
        1,
        'john.doe@example.com',
        'customer'
    );

    expect(result.getQuantity()).toEqual(3);
    expect(mockCartDbAddCartItem).toHaveBeenCalledWith(cartJohn, product1, 1);
});

test('given non-existent product, when adding item to cart, then an error is thrown', async () => {
    cartDb.getCartByCustomerEmail = mockCartDbGetCartByCustomerEmail.mockReturnValue(cartJohn);
    productDb.getProductById = mockProductDbGetProductById.mockReturnValue(null);

    const addCartItem = async () =>
        await cartService.addCartItem(
            'john.doe@example.com',
            3,
            1,
            'john.doe@example.com',
            'customer'
        );

    await expect(addCartItem).rejects.toThrow('Product with id 3 does not exist.');
});

test('given product in cart, when decreasing quantity, then quantity is decreased', async () => {
    cartDb.getCartByCustomerEmail = mockCartDbGetCartByCustomerEmail.mockReturnValue(cartJohn);
    productDb.getProductById = mockProductDbGetProductById.mockReturnValue(product1);
    cartDb.removeCartItem = mockCartDbRemoveCartItem.mockReturnValue(
        new CartItem({ product: product1, quantity: 1 })
    );

    const result = await cartService.removeCartItem(
        'john.doe@example.com',
        1,
        1,
        'john.doe@example.com',
        'customer'
    );

    expect(result).toBeInstanceOf(CartItem);
    expect((result as CartItem).getQuantity()).toEqual(1);

    expect(mockCartDbRemoveCartItem).toHaveBeenCalledWith(cartJohn, product1, 1);
});

test('given product in cart, when removing entire quantity, then item is removed from cart', async () => {
    cartDb.getCartByCustomerEmail = mockCartDbGetCartByCustomerEmail.mockReturnValue(cartJohn);
    productDb.getProductById = mockProductDbGetProductById.mockReturnValue(product1);
    cartDb.removeCartItem = mockCartDbRemoveCartItem.mockReturnValue('Item removed from cart.');

    const result = await cartService.removeCartItem(
        'john.doe@example.com',
        1,
        2,
        'john.doe@example.com',
        'customer'
    );

    expect(result).toEqual('Item removed from cart.');
    expect(mockCartDbRemoveCartItem).toHaveBeenCalledWith(cartJohn, product1, 2);
});

test('given non-existent product, when removing item from cart, then an error is thrown', async () => {
    cartDb.getCartByCustomerEmail = mockCartDbGetCartByCustomerEmail.mockReturnValue(cartJohn);
    productDb.getProductById = mockProductDbGetProductById.mockReturnValue(null);

    const removeCartItem = async () =>
        await cartService.removeCartItem(
            'john.doe@example.com',
            3,
            1,
            'john.doe@example.com',
            'customer'
        );

    await expect(removeCartItem).rejects.toThrow('Product with id 3 does not exist.');
});

test('given valid cart and payment info, when converting cart to order, then order is created', async () => {
    cartDb.getCartByCustomerEmail = mockCartDbGetCartByCustomerEmail.mockReturnValue(cartJohn);
    orderDb.createOrder = mockOrderDbCreateOrder.mockReturnValue(order1);
    cartDb.emptyCart = mockCartDbEmptyCart.mockReturnValue('cart successfully emptied.');

    const result = await cartService.convertCartToOrder(
        'john.doe@example.com',
        'paid',
        'john.doe@example.com',
        'customer'
    );

    expect(result.getCustomer()).toEqual(order1.getCustomer());
    expect(result.getItems()).toEqual(order1.getItems());
    expect(result.getPayment().getAmount()).toEqual(order1.getPayment().getAmount());
    expect(result.getPayment().getPaymentStatus()).toEqual(order1.getPayment().getPaymentStatus());
    expect(mockCartDbGetCartByCustomerEmail).toHaveBeenCalledWith({
        email: 'john.doe@example.com',
    });
    expect(mockOrderDbCreateOrder).toHaveBeenCalledWith(
        expect.objectContaining({
            customer: order1.getCustomer(),
            items: order1.getItems(),
            payment: expect.objectContaining({
                amount: order1.getPayment().getAmount(),
                paymentStatus: order1.getPayment().getPaymentStatus(),
            }),
        })
    );
    expect(mockCartDbEmptyCart).toHaveBeenCalled();
});

test('given non-existent cart, when converting cart to order, then an error is thrown', async () => {
    cartDb.getCartByCustomerEmail = mockCartDbGetCartByCustomerEmail.mockReturnValue(null);

    const convertCartToOrder = async () =>
        cartService.convertCartToOrder(
            'bob.smith@example.com',
            'paid',
            'bob.smith@example.com',
            'customer'
        );

    await expect(convertCartToOrder).rejects.toThrow(
        'Cart with email bob.smith@example.com does not exist.'
    );

    expect(mockCartDbGetCartByCustomerEmail).toHaveBeenCalledWith({
        email: 'bob.smith@example.com',
    });
});

test('given missing payment info, when converting cart to order, then an error is thrown', async () => {
    cartDb.getCartByCustomerEmail = mockCartDbGetCartByCustomerEmail.mockReturnValue(cartJohn);

    const convertCartToOrder = async () =>
        cartService.convertCartToOrder(
            'john.doe@example.com',
            '',
            'john.doe@example.com',
            'customer'
        );

    await expect(convertCartToOrder).rejects.toThrow('Payment status is required.');

    expect(mockCartDbGetCartByCustomerEmail).toHaveBeenCalledWith({
        email: 'john.doe@example.com',
    });
});

test('given invalid payment info, when converting cart to order, then an error is thrown', async () => {
    cartDb.getCartByCustomerEmail = mockCartDbGetCartByCustomerEmail.mockReturnValue(cartJohn);

    const convertCartToOrder = async () =>
        cartService.convertCartToOrder(
            'john.doe@example.com',
            'invalid',
            'john.doe@example.com',
            'customer'
        );

    await expect(convertCartToOrder).rejects.toThrow('Payment status must be paid or unpaid.');

    expect(mockCartDbGetCartByCustomerEmail).toHaveBeenCalledWith({
        email: 'john.doe@example.com',
    });
});

test('given a valid discount code and cart, when adding a discount code to the cart, then the discount is applied', async () => {
    cartDb.getCartByCustomerEmail = mockCartDbGetCartByCustomerEmail.mockReturnValue(cartJohn);
    discountCodeDb.getDiscountCodeByCode =
        mockDiscountCodeDbGetDiscountCodeByCode.mockReturnValue(discount);
    cartDb.addDiscountCode = mockCartDbAddDiscountCode.mockReturnValue(
        'Discount applied successfully'
    );

    const result = await cartService.addDiscountCode(
        'john.doe@example.com',
        'SAVE10',
        'john.doe@example.com',
        'customer'
    );

    expect(result).toEqual('Discount applied successfully');
    expect(mockDiscountCodeDbGetDiscountCodeByCode).toHaveBeenCalledWith({ code: 'SAVE10' });
    expect(mockCartDbAddDiscountCode).toHaveBeenCalledWith(cartJohn, discount);
});

test('given a non-existing discount code, when adding a discount code to the cart, then an error is thrown', async () => {
    cartDb.getCartByCustomerEmail = mockCartDbGetCartByCustomerEmail.mockReturnValue(cartJohn);
    discountCodeDb.getDiscountCodeByCode =
        mockDiscountCodeDbGetDiscountCodeByCode.mockReturnValue(null);

    const addDiscountCode = async () =>
        await cartService.addDiscountCode(
            'john.doe@example.com',
            'INVALIDCODE',
            'john.doe@example.com',
            'customer'
        );

    await expect(addDiscountCode).rejects.toThrow(
        'Discountcode with code INVALIDCODE does not exist.'
    );
    expect(mockDiscountCodeDbGetDiscountCodeByCode).toHaveBeenCalledWith({ code: 'INVALIDCODE' });
});

test('given an active discount code on the cart, when removing a discount code, then the discount is removed', async () => {
    cartJohn.emptyCart();
    cartDb.getCartByCustomerEmail = mockCartDbGetCartByCustomerEmail.mockReturnValue(cartJohn);
    discountCodeDb.getDiscountCodeByCode =
        mockDiscountCodeDbGetDiscountCodeByCode.mockReturnValue(discount);
    cartDb.removeDiscountCode = mockCartDbRemoveDiscountCode.mockReturnValue(
        'Discount removed successfully'
    );
    cartDb.addDiscountCode = mockCartDbAddDiscountCode.mockReturnValue(
        'Discount applied successfully'
    );

    await cartService.addDiscountCode(
        'john.doe@example.com',
        'SAVE10',
        'john.doe@example.com',
        'customer'
    );

    const result = await cartService.removeDiscountCode(
        'john.doe@example.com',
        'SAVE10',
        'john.doe@example.com',
        'customer'
    );

    expect(result).toEqual('Discount removed successfully');
    expect(mockCartDbRemoveDiscountCode).toHaveBeenCalledWith(cartJohn, 'SAVE10');
});

test('given valid, when removing a discount code not in the cart, then an error is thrown', async () => {
    cartJohn.emptyCart();
    cartDb.getCartByCustomerEmail = mockCartDbGetCartByCustomerEmail.mockReturnValue(cartJohn);
    discountCodeDb.getDiscountCodeByCode =
        mockDiscountCodeDbGetDiscountCodeByCode.mockReturnValue(discount);

    const removeDiscountCode = async () =>
        await cartService.removeDiscountCode(
            'john.doe@example.com',
            'SAVE10',
            'john.doe@example.com',
            'customer'
        );

    await expect(removeDiscountCode).rejects.toThrow(
        'That discount code had not been applied to your cart.'
    );
    expect(mockCartDbGetCartByCustomerEmail).toHaveBeenCalledWith({
        email: 'john.doe@example.com',
    });
});

test('given non-salesman/admin role, when getting all carts, then UnauthorizedError is thrown', async () => {
    const getCarts = async () => await cartService.getCarts('john.doe@example.com', 'customer');

    await expect(getCarts).rejects.toThrow('You must be a salesman or admin to access all carts.');
});

test('given non-salesman/admin role, when getting cart by id, then UnauthorizedError is thrown', async () => {
    const getCartById = async () =>
        await cartService.getCartById(1, 'john.doe@example.com', 'customer');

    await expect(getCartById).rejects.toThrow(
        'You must be a salesman or admin to access a cart by Id.'
    );
});

test('given non-salesman/admin role and mismatched email, when getting cart by email, then UnauthorizedError is thrown', async () => {
    const getCartByEmail = async () =>
        await cartService.getCartByEmail(
            'jane.smith@example.com',
            'john.doe@example.com',
            'customer'
        );

    await expect(getCartByEmail).rejects.toThrow(
        'You must be a salesman, admin or logged in as the user who own this cart.'
    );
});

test('given non-salesman/admin role, when adding cart item for another user, then UnauthorizedError is thrown', async () => {
    const addCartItem = async () =>
        await cartService.addCartItem(
            'jane.smith@example.com',
            1,
            1,
            'john.doe@example.com',
            'customer'
        );

    await expect(addCartItem).rejects.toThrow(
        'You must be a salesman, admin or logged in as the user who own this cart.'
    );
});

test('given non-salesman/admin role, when removing cart item for another user, then UnauthorizedError is thrown', async () => {
    const removeCartItem = async () =>
        await cartService.removeCartItem(
            'jane.smith@example.com',
            1,
            1,
            'john.doe@example.com',
            'customer'
        );

    await expect(removeCartItem).rejects.toThrow(
        'You must be a salesman, admin or logged in as the user who own this cart.'
    );
});

test('given non-salesman/admin role, when adding discount code for another user, then UnauthorizedError is thrown', async () => {
    const addDiscountCode = async () =>
        await cartService.addDiscountCode(
            'jane.smith@example.com',
            'SAVE10',
            'john.doe@example.com',
            'customer'
        );

    await expect(addDiscountCode).rejects.toThrow(
        'You must be a salesman, admin or logged in as the user who own this cart.'
    );
});

test('given non-salesman/admin role, when removing discount code for another user, then UnauthorizedError is thrown', async () => {
    const removeDiscountCode = async () =>
        await cartService.removeDiscountCode(
            'jane.smith@example.com',
            'SAVE10',
            'john.doe@example.com',
            'customer'
        );

    await expect(removeDiscountCode).rejects.toThrow(
        'You must be a salesman, admin or logged in as the user who own this cart.'
    );
});

test('given non-salesman/admin role, when converting cart to order for another user, then UnauthorizedError is thrown', async () => {
    const convertCartToOrder = async () =>
        await cartService.convertCartToOrder(
            'jane.smith@example.com',
            'paid',
            'john.doe@example.com',
            'customer'
        );

    await expect(convertCartToOrder).rejects.toThrow(
        'You must be a salesman, admin or logged in as the user who own this cart.'
    );
});
