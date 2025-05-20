"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cart_1 = require("../../model/cart");
const cartItem_1 = require("../../model/cartItem");
const customer_1 = require("../../model/customer");
const discountCode_1 = require("../../model/discountCode");
const order_1 = require("../../model/order");
const orderItem_1 = require("../../model/orderItem");
const payment_1 = require("../../model/payment");
const product_1 = require("../../model/product");
const cart_db_1 = __importDefault(require("../../repository/cart.db"));
const discountCode_db_1 = __importDefault(require("../../repository/discountCode.db"));
const order_db_1 = __importDefault(require("../../repository/order.db"));
const product_db_1 = __importDefault(require("../../repository/product.db"));
const cart_service_1 = __importDefault(require("../../service/cart.service"));
const customers = [
    new customer_1.Customer({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        role: 'customer',
        wishlist: [],
        id: 1,
    }),
    new customer_1.Customer({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        password: 'password456',
        role: 'customer',
        wishlist: [],
        id: 2,
    }),
    new customer_1.Customer({
        firstName: 'Bob',
        lastName: 'Smith',
        email: 'bob.smith@example.com',
        password: 'password789',
        role: 'customer',
        wishlist: [],
        id: 3,
    }),
];
const product1 = new product_1.Product({
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
const product2 = new product_1.Product({
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
const carts = [];
const cartJohn = new cart_1.Cart({
    customer: customers[0],
    products: [new cartItem_1.CartItem({ product: product1, quantity: 2 })],
    discountCodes: [],
    id: 1,
});
carts.push(cartJohn);
const cartJane = new cart_1.Cart({
    customer: customers[1],
    products: [new cartItem_1.CartItem({ product: product2, quantity: 1 })],
    discountCodes: [],
    id: 2,
});
carts.push(cartJane);
const order1 = new order_1.Order({
    customer: customers[0],
    items: [
        new orderItem_1.OrderItem({
            product: product1,
            quantity: 2,
        }),
    ],
    date: new Date('2024-11-02T13:05:28.149Z'),
    payment: new payment_1.Payment({
        amount: 40.0,
        date: new Date('2024-11-02T13:05:28.149Z'),
        paymentStatus: 'paid',
    }),
    id: 1,
});
const order2 = new order_1.Order({
    customer: customers[1],
    items: [
        new orderItem_1.OrderItem({
            product: product2,
            quantity: 1,
        }),
    ],
    date: new Date(),
    payment: new payment_1.Payment({
        amount: 50.0,
        date: new Date(),
        paymentStatus: 'paid',
    }),
    id: 2,
});
const discount = new discountCode_1.DiscountCode({
    code: 'SAVE10',
    type: 'percentage',
    value: 10,
    expirationDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
    isActive: true,
});
let mockCartDbGetCarts;
let mockCartDbGetCartById;
let mockCartDbGetCartByCustomerEmail;
let mockCartDbAddCartItem;
let mockCartDbRemoveCartItem;
let mockProductDbGetProductById;
let mockOrderDbCreateOrder;
let mockCartDbDeleteCart;
let mockCartDbEmptyCart;
let mockDiscountCodeDbGetDiscountCodeByCode;
let mockCartDbAddDiscountCode;
let mockCartDbRemoveDiscountCode;
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
test('given carts in the DB, when getting all carts, then all carts are returned', () => __awaiter(void 0, void 0, void 0, function* () {
    cart_db_1.default.getCarts = mockCartDbGetCarts.mockReturnValue(carts);
    const result = yield cart_service_1.default.getCarts('admin@example.com', 'admin');
    expect(result).toEqual(carts);
    expect(mockCartDbGetCarts).toHaveBeenCalled();
}));
test('given carts in the DB, when getting cart by id, then that cart is returned', () => __awaiter(void 0, void 0, void 0, function* () {
    cart_db_1.default.getCartById = mockCartDbGetCartById.mockReturnValue(carts[0]);
    const result = yield cart_service_1.default.getCartById(1, 'admin@example.com', 'admin');
    expect(result).toEqual(carts[0]);
    expect(mockCartDbGetCartById).toHaveBeenCalledWith({ id: 1 });
}));
test('given carts in the DB, when getting a cart by incorrect id, then an error is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
    cart_db_1.default.getCartById = mockCartDbGetCartById.mockReturnValue(null);
    const getCartById = () => __awaiter(void 0, void 0, void 0, function* () { return yield cart_service_1.default.getCartById(3, 'admin@example.com', 'admin'); });
    yield expect(getCartById).rejects.toThrow('Cart with id 3 does not exist.');
    expect(mockCartDbGetCartById).toHaveBeenCalledWith({ id: 3 });
}));
test('given carts in the DB, when getting cart by email, then that cart is returned', () => __awaiter(void 0, void 0, void 0, function* () {
    cart_db_1.default.getCartByCustomerEmail = mockCartDbGetCartByCustomerEmail.mockReturnValue(carts[0]);
    const result = yield cart_service_1.default.getCartByEmail('john.doe@example.com', 'john.doe@example.com', 'customer');
    expect(result).toEqual(carts[0]);
    expect(mockCartDbGetCartByCustomerEmail).toHaveBeenCalledWith({
        email: 'john.doe@example.com',
    });
}));
test('given carts in the DB, when getting a cart by incorrect email, then an error is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
    cart_db_1.default.getCartByCustomerEmail = mockCartDbGetCartByCustomerEmail.mockReturnValue(null);
    const getCartByEmail = () => __awaiter(void 0, void 0, void 0, function* () { return yield cart_service_1.default.getCartByEmail('wrong@email.com', 'wrong@email.com', 'customer'); });
    yield expect(getCartByEmail).rejects.toThrow('Cart with email wrong@email.com does not exist.');
    expect(mockCartDbGetCartByCustomerEmail).toHaveBeenCalledWith({ email: 'wrong@email.com' });
}));
test('given valid cart and product, when adding an item to cart, then the item is added', () => __awaiter(void 0, void 0, void 0, function* () {
    cart_db_1.default.getCartByCustomerEmail = mockCartDbGetCartByCustomerEmail.mockReturnValue(cartJohn);
    product_db_1.default.getProductById = mockProductDbGetProductById.mockReturnValue(product2);
    cart_db_1.default.addCartItem = mockCartDbAddCartItem.mockReturnValue(new cartItem_1.CartItem({ product: product2, quantity: 1 }));
    const result = yield cart_service_1.default.addCartItem('john.doe@example.com', 2, 1, 'john.doe@example.com', 'customer');
    expect(result).toEqual(new cartItem_1.CartItem({ product: product2, quantity: 1 }));
    expect(mockCartDbAddCartItem).toHaveBeenCalledWith(cartJohn, product2, 1);
}));
test('given valid cart with existing product, when adding quantity to existing product, then quantity is updated', () => __awaiter(void 0, void 0, void 0, function* () {
    cart_db_1.default.getCartByCustomerEmail = mockCartDbGetCartByCustomerEmail.mockReturnValue(cartJohn);
    product_db_1.default.getProductById = mockProductDbGetProductById.mockReturnValue(product1);
    cart_db_1.default.addCartItem = mockCartDbAddCartItem.mockReturnValue(new cartItem_1.CartItem({ product: product1, quantity: 3 }));
    const result = yield cart_service_1.default.addCartItem('john.doe@example.com', 1, 1, 'john.doe@example.com', 'customer');
    expect(result.getQuantity()).toEqual(3);
    expect(mockCartDbAddCartItem).toHaveBeenCalledWith(cartJohn, product1, 1);
}));
test('given non-existent product, when adding item to cart, then an error is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
    cart_db_1.default.getCartByCustomerEmail = mockCartDbGetCartByCustomerEmail.mockReturnValue(cartJohn);
    product_db_1.default.getProductById = mockProductDbGetProductById.mockReturnValue(null);
    const addCartItem = () => __awaiter(void 0, void 0, void 0, function* () {
        return yield cart_service_1.default.addCartItem('john.doe@example.com', 3, 1, 'john.doe@example.com', 'customer');
    });
    yield expect(addCartItem).rejects.toThrow('Product with id 3 does not exist.');
}));
test('given product in cart, when decreasing quantity, then quantity is decreased', () => __awaiter(void 0, void 0, void 0, function* () {
    cart_db_1.default.getCartByCustomerEmail = mockCartDbGetCartByCustomerEmail.mockReturnValue(cartJohn);
    product_db_1.default.getProductById = mockProductDbGetProductById.mockReturnValue(product1);
    cart_db_1.default.removeCartItem = mockCartDbRemoveCartItem.mockReturnValue(new cartItem_1.CartItem({ product: product1, quantity: 1 }));
    const result = yield cart_service_1.default.removeCartItem('john.doe@example.com', 1, 1, 'john.doe@example.com', 'customer');
    expect(result).toBeInstanceOf(cartItem_1.CartItem);
    expect(result.getQuantity()).toEqual(1);
    expect(mockCartDbRemoveCartItem).toHaveBeenCalledWith(cartJohn, product1, 1);
}));
test('given product in cart, when removing entire quantity, then item is removed from cart', () => __awaiter(void 0, void 0, void 0, function* () {
    cart_db_1.default.getCartByCustomerEmail = mockCartDbGetCartByCustomerEmail.mockReturnValue(cartJohn);
    product_db_1.default.getProductById = mockProductDbGetProductById.mockReturnValue(product1);
    cart_db_1.default.removeCartItem = mockCartDbRemoveCartItem.mockReturnValue('Item removed from cart.');
    const result = yield cart_service_1.default.removeCartItem('john.doe@example.com', 1, 2, 'john.doe@example.com', 'customer');
    expect(result).toEqual('Item removed from cart.');
    expect(mockCartDbRemoveCartItem).toHaveBeenCalledWith(cartJohn, product1, 2);
}));
test('given non-existent product, when removing item from cart, then an error is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
    cart_db_1.default.getCartByCustomerEmail = mockCartDbGetCartByCustomerEmail.mockReturnValue(cartJohn);
    product_db_1.default.getProductById = mockProductDbGetProductById.mockReturnValue(null);
    const removeCartItem = () => __awaiter(void 0, void 0, void 0, function* () {
        return yield cart_service_1.default.removeCartItem('john.doe@example.com', 3, 1, 'john.doe@example.com', 'customer');
    });
    yield expect(removeCartItem).rejects.toThrow('Product with id 3 does not exist.');
}));
test('given valid cart and payment info, when converting cart to order, then order is created', () => __awaiter(void 0, void 0, void 0, function* () {
    cart_db_1.default.getCartByCustomerEmail = mockCartDbGetCartByCustomerEmail.mockReturnValue(cartJohn);
    order_db_1.default.createOrder = mockOrderDbCreateOrder.mockReturnValue(order1);
    cart_db_1.default.emptyCart = mockCartDbEmptyCart.mockReturnValue('cart successfully emptied.');
    const result = yield cart_service_1.default.convertCartToOrder('john.doe@example.com', 'paid', 'john.doe@example.com', 'customer');
    expect(result.getCustomer()).toEqual(order1.getCustomer());
    expect(result.getItems()).toEqual(order1.getItems());
    expect(result.getPayment().getAmount()).toEqual(order1.getPayment().getAmount());
    expect(result.getPayment().getPaymentStatus()).toEqual(order1.getPayment().getPaymentStatus());
    expect(mockCartDbGetCartByCustomerEmail).toHaveBeenCalledWith({
        email: 'john.doe@example.com',
    });
    expect(mockOrderDbCreateOrder).toHaveBeenCalledWith(expect.objectContaining({
        customer: order1.getCustomer(),
        items: order1.getItems(),
        payment: expect.objectContaining({
            amount: order1.getPayment().getAmount(),
            paymentStatus: order1.getPayment().getPaymentStatus(),
        }),
    }));
    expect(mockCartDbEmptyCart).toHaveBeenCalled();
}));
test('given non-existent cart, when converting cart to order, then an error is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
    cart_db_1.default.getCartByCustomerEmail = mockCartDbGetCartByCustomerEmail.mockReturnValue(null);
    const convertCartToOrder = () => __awaiter(void 0, void 0, void 0, function* () {
        return cart_service_1.default.convertCartToOrder('bob.smith@example.com', 'paid', 'bob.smith@example.com', 'customer');
    });
    yield expect(convertCartToOrder).rejects.toThrow('Cart with email bob.smith@example.com does not exist.');
    expect(mockCartDbGetCartByCustomerEmail).toHaveBeenCalledWith({
        email: 'bob.smith@example.com',
    });
}));
test('given missing payment info, when converting cart to order, then an error is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
    cart_db_1.default.getCartByCustomerEmail = mockCartDbGetCartByCustomerEmail.mockReturnValue(cartJohn);
    const convertCartToOrder = () => __awaiter(void 0, void 0, void 0, function* () {
        return cart_service_1.default.convertCartToOrder('john.doe@example.com', '', 'john.doe@example.com', 'customer');
    });
    yield expect(convertCartToOrder).rejects.toThrow('Payment status is required.');
    expect(mockCartDbGetCartByCustomerEmail).toHaveBeenCalledWith({
        email: 'john.doe@example.com',
    });
}));
test('given invalid payment info, when converting cart to order, then an error is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
    cart_db_1.default.getCartByCustomerEmail = mockCartDbGetCartByCustomerEmail.mockReturnValue(cartJohn);
    const convertCartToOrder = () => __awaiter(void 0, void 0, void 0, function* () {
        return cart_service_1.default.convertCartToOrder('john.doe@example.com', 'invalid', 'john.doe@example.com', 'customer');
    });
    yield expect(convertCartToOrder).rejects.toThrow('Payment status must be paid or unpaid.');
    expect(mockCartDbGetCartByCustomerEmail).toHaveBeenCalledWith({
        email: 'john.doe@example.com',
    });
}));
test('given a valid discount code and cart, when adding a discount code to the cart, then the discount is applied', () => __awaiter(void 0, void 0, void 0, function* () {
    cart_db_1.default.getCartByCustomerEmail = mockCartDbGetCartByCustomerEmail.mockReturnValue(cartJohn);
    discountCode_db_1.default.getDiscountCodeByCode =
        mockDiscountCodeDbGetDiscountCodeByCode.mockReturnValue(discount);
    cart_db_1.default.addDiscountCode = mockCartDbAddDiscountCode.mockReturnValue('Discount applied successfully');
    const result = yield cart_service_1.default.addDiscountCode('john.doe@example.com', 'SAVE10', 'john.doe@example.com', 'customer');
    expect(result).toEqual('Discount applied successfully');
    expect(mockDiscountCodeDbGetDiscountCodeByCode).toHaveBeenCalledWith({ code: 'SAVE10' });
    expect(mockCartDbAddDiscountCode).toHaveBeenCalledWith(cartJohn, discount);
}));
test('given a non-existing discount code, when adding a discount code to the cart, then an error is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
    cart_db_1.default.getCartByCustomerEmail = mockCartDbGetCartByCustomerEmail.mockReturnValue(cartJohn);
    discountCode_db_1.default.getDiscountCodeByCode =
        mockDiscountCodeDbGetDiscountCodeByCode.mockReturnValue(null);
    const addDiscountCode = () => __awaiter(void 0, void 0, void 0, function* () {
        return yield cart_service_1.default.addDiscountCode('john.doe@example.com', 'INVALIDCODE', 'john.doe@example.com', 'customer');
    });
    yield expect(addDiscountCode).rejects.toThrow('Discountcode with code INVALIDCODE does not exist.');
    expect(mockDiscountCodeDbGetDiscountCodeByCode).toHaveBeenCalledWith({ code: 'INVALIDCODE' });
}));
test('given an active discount code on the cart, when removing a discount code, then the discount is removed', () => __awaiter(void 0, void 0, void 0, function* () {
    cartJohn.emptyCart();
    cart_db_1.default.getCartByCustomerEmail = mockCartDbGetCartByCustomerEmail.mockReturnValue(cartJohn);
    discountCode_db_1.default.getDiscountCodeByCode =
        mockDiscountCodeDbGetDiscountCodeByCode.mockReturnValue(discount);
    cart_db_1.default.removeDiscountCode = mockCartDbRemoveDiscountCode.mockReturnValue('Discount removed successfully');
    cart_db_1.default.addDiscountCode = mockCartDbAddDiscountCode.mockReturnValue('Discount applied successfully');
    yield cart_service_1.default.addDiscountCode('john.doe@example.com', 'SAVE10', 'john.doe@example.com', 'customer');
    const result = yield cart_service_1.default.removeDiscountCode('john.doe@example.com', 'SAVE10', 'john.doe@example.com', 'customer');
    expect(result).toEqual('Discount removed successfully');
    expect(mockCartDbRemoveDiscountCode).toHaveBeenCalledWith(cartJohn, 'SAVE10');
}));
test('given valid, when removing a discount code not in the cart, then an error is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
    cartJohn.emptyCart();
    cart_db_1.default.getCartByCustomerEmail = mockCartDbGetCartByCustomerEmail.mockReturnValue(cartJohn);
    discountCode_db_1.default.getDiscountCodeByCode =
        mockDiscountCodeDbGetDiscountCodeByCode.mockReturnValue(discount);
    const removeDiscountCode = () => __awaiter(void 0, void 0, void 0, function* () {
        return yield cart_service_1.default.removeDiscountCode('john.doe@example.com', 'SAVE10', 'john.doe@example.com', 'customer');
    });
    yield expect(removeDiscountCode).rejects.toThrow('That discount code had not been applied to your cart.');
    expect(mockCartDbGetCartByCustomerEmail).toHaveBeenCalledWith({
        email: 'john.doe@example.com',
    });
}));
test('given non-salesman/admin role, when getting all carts, then UnauthorizedError is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
    const getCarts = () => __awaiter(void 0, void 0, void 0, function* () { return yield cart_service_1.default.getCarts('john.doe@example.com', 'customer'); });
    yield expect(getCarts).rejects.toThrow('You must be a salesman or admin to access all carts.');
}));
test('given non-salesman/admin role, when getting cart by id, then UnauthorizedError is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
    const getCartById = () => __awaiter(void 0, void 0, void 0, function* () { return yield cart_service_1.default.getCartById(1, 'john.doe@example.com', 'customer'); });
    yield expect(getCartById).rejects.toThrow('You must be a salesman or admin to access a cart by Id.');
}));
test('given non-salesman/admin role and mismatched email, when getting cart by email, then UnauthorizedError is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
    const getCartByEmail = () => __awaiter(void 0, void 0, void 0, function* () {
        return yield cart_service_1.default.getCartByEmail('jane.smith@example.com', 'john.doe@example.com', 'customer');
    });
    yield expect(getCartByEmail).rejects.toThrow('You must be a salesman, admin or logged in as the user who own this cart.');
}));
test('given non-salesman/admin role, when adding cart item for another user, then UnauthorizedError is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
    const addCartItem = () => __awaiter(void 0, void 0, void 0, function* () {
        return yield cart_service_1.default.addCartItem('jane.smith@example.com', 1, 1, 'john.doe@example.com', 'customer');
    });
    yield expect(addCartItem).rejects.toThrow('You must be a salesman, admin or logged in as the user who own this cart.');
}));
test('given non-salesman/admin role, when removing cart item for another user, then UnauthorizedError is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
    const removeCartItem = () => __awaiter(void 0, void 0, void 0, function* () {
        return yield cart_service_1.default.removeCartItem('jane.smith@example.com', 1, 1, 'john.doe@example.com', 'customer');
    });
    yield expect(removeCartItem).rejects.toThrow('You must be a salesman, admin or logged in as the user who own this cart.');
}));
test('given non-salesman/admin role, when adding discount code for another user, then UnauthorizedError is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
    const addDiscountCode = () => __awaiter(void 0, void 0, void 0, function* () {
        return yield cart_service_1.default.addDiscountCode('jane.smith@example.com', 'SAVE10', 'john.doe@example.com', 'customer');
    });
    yield expect(addDiscountCode).rejects.toThrow('You must be a salesman, admin or logged in as the user who own this cart.');
}));
test('given non-salesman/admin role, when removing discount code for another user, then UnauthorizedError is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
    const removeDiscountCode = () => __awaiter(void 0, void 0, void 0, function* () {
        return yield cart_service_1.default.removeDiscountCode('jane.smith@example.com', 'SAVE10', 'john.doe@example.com', 'customer');
    });
    yield expect(removeDiscountCode).rejects.toThrow('You must be a salesman, admin or logged in as the user who own this cart.');
}));
test('given non-salesman/admin role, when converting cart to order for another user, then UnauthorizedError is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
    const convertCartToOrder = () => __awaiter(void 0, void 0, void 0, function* () {
        return yield cart_service_1.default.convertCartToOrder('jane.smith@example.com', 'paid', 'john.doe@example.com', 'customer');
    });
    yield expect(convertCartToOrder).rejects.toThrow('You must be a salesman, admin or logged in as the user who own this cart.');
}));
