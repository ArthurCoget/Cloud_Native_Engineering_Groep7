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
const express_jwt_1 = require("express-jwt");
const order_1 = require("../model/order");
const orderItem_1 = require("../model/orderItem");
const payment_1 = require("../model/payment");
const cart_db_1 = __importDefault(require("../repository/cart.db"));
const discountCode_db_1 = __importDefault(require("../repository/discountCode.db"));
const order_db_1 = __importDefault(require("../repository/order.db"));
const product_db_1 = __importDefault(require("../repository/product.db"));
const getCarts = (email, role) => __awaiter(void 0, void 0, void 0, function* () {
    if (role === 'salesman' || role === 'admin') {
        return yield cart_db_1.default.getCarts();
    }
    else {
        throw new express_jwt_1.UnauthorizedError('credentials_required', {
            message: 'You must be a salesman or admin to access all carts.',
        });
    }
});
const getCartById = (id, email, role) => __awaiter(void 0, void 0, void 0, function* () {
    if (role === 'salesman' || role === 'admin') {
        const cart = yield cart_db_1.default.getCartById({ id });
        if (!cart)
            throw new Error(`Cart with id ${id} does not exist.`);
        return cart;
    }
    else {
        throw new express_jwt_1.UnauthorizedError('credentials_required', {
            message: 'You must be a salesman or admin to access a cart by Id.',
        });
    }
});
const getCartByEmail = (email, authEmail, role) => __awaiter(void 0, void 0, void 0, function* () {
    if (role === 'salesman' || role === 'admin' || (role === 'customer' && email === authEmail)) {
        const cart = yield cart_db_1.default.getCartByCustomerEmail({ email });
        if (!cart)
            throw new Error(`Cart with email ${email} does not exist.`);
        return cart;
    }
    else {
        throw new express_jwt_1.UnauthorizedError('credentials_required', {
            message: 'You must be a salesman, admin or logged in as the user who own this cart.',
        });
    }
});
const addCartItem = (email, productId, quantity, authEmail, role) => __awaiter(void 0, void 0, void 0, function* () {
    const existingCart = yield getCartByEmail(email, authEmail, role);
    const product = yield product_db_1.default.getProductById({ id: productId });
    if (!product)
        throw new Error(`Product with id ${productId} does not exist.`);
    return yield cart_db_1.default.addCartItem(existingCart, product, quantity);
});
const removeCartItem = (email, productId, quantity, authEmail, role) => __awaiter(void 0, void 0, void 0, function* () {
    const existingCart = yield getCartByEmail(email, authEmail, role);
    const product = yield product_db_1.default.getProductById({ id: productId });
    if (!product)
        throw new Error(`Product with id ${productId} does not exist.`);
    return yield cart_db_1.default.removeCartItem(existingCart, product, quantity);
});
const addDiscountCode = (email, code, authEmail, role) => __awaiter(void 0, void 0, void 0, function* () {
    const existingCart = yield getCartByEmail(email, authEmail, role);
    const existingDiscountCode = yield discountCode_db_1.default.getDiscountCodeByCode({ code: code });
    if (!existingDiscountCode)
        throw new Error(`Discountcode with code ${code} does not exist.`);
    const appliedDiscountCode = existingCart.applyDiscountCode(existingDiscountCode);
    return yield cart_db_1.default.addDiscountCode(existingCart, appliedDiscountCode);
});
const removeDiscountCode = (email, code, authEmail, role) => __awaiter(void 0, void 0, void 0, function* () {
    const existingCart = yield getCartByEmail(email, authEmail, role);
    const existingDiscountCode = yield discountCode_db_1.default.getDiscountCodeByCode({ code: code });
    if (!existingDiscountCode)
        throw new Error(`DiscountCode with code ${code} does not exist.`);
    existingCart.removeDiscountCode(existingDiscountCode);
    return yield cart_db_1.default.removeDiscountCode(existingCart, code);
});
const convertCartToOrder = (email, paymentStatus, authEmail, role) => __awaiter(void 0, void 0, void 0, function* () {
    const cart = yield getCartByEmail(email, authEmail, role);
    if (!cart)
        throw new Error(`Cart with user email ${email} does not exist.`);
    if (!paymentStatus) {
        throw new Error('Payment status is required.');
    }
    if (paymentStatus !== 'paid' && paymentStatus !== 'unpaid') {
        throw new Error('Payment status must be paid or unpaid.');
    }
    const customer = cart.getCustomer();
    const items = cart.getProducts().map((cartItem) => new orderItem_1.OrderItem({
        product: cartItem.getProduct(),
        quantity: cartItem.getQuantity(),
    }));
    const payment = new payment_1.Payment({
        amount: cart.getTotalAmount(),
        date: new Date(),
        paymentStatus: paymentStatus,
    });
    const order = new order_1.Order({
        customer,
        items,
        date: new Date(),
        payment,
    });
    const outputOrder = yield order_db_1.default.createOrder(order);
    yield cart_db_1.default.emptyCart(cart);
    return outputOrder;
});
exports.default = {
    getCarts,
    getCartById,
    addCartItem,
    removeCartItem,
    addDiscountCode,
    removeDiscountCode,
    convertCartToOrder,
    getCartByEmail,
};
