"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_jwt_1 = require("express-jwt");
const order_1 = require("../model/order");
const orderItem_1 = require("../model/orderItem");
const payment_1 = require("../model/payment");
const cosmos_cart_repository_1 = require("../repository/cosmos-cart-repository");
const cosmos_discountCode_repository_1 = require("../repository/cosmos-discountCode-repository");
const cosmos_order_repository_1 = require("../repository/cosmos-order-repository");
const cosmos_product_repository_1 = require("../repository/cosmos-product-repository");
const getCarts = async (email, role) => {
    if (role === 'salesman' || role === 'admin') {
        const repo = await cosmos_cart_repository_1.CosmosCartRepository.getInstance();
        return await repo.getCarts();
    }
    else {
        throw new express_jwt_1.UnauthorizedError('credentials_required', {
            message: 'You must be a salesman or admin to access all carts.',
        });
    }
};
const getCartById = async (id, email, role) => {
    if (role === 'salesman' || role === 'admin') {
        const repo = await cosmos_cart_repository_1.CosmosCartRepository.getInstance();
        const cart = await repo.getCartById(id);
        if (!cart)
            throw new Error(`Cart with id ${id} does not exist.`);
        return cart;
    }
    else {
        throw new express_jwt_1.UnauthorizedError('credentials_required', {
            message: 'You must be a salesman or admin to access a cart by Id.',
        });
    }
};
const getCartByEmail = async (email, authEmail, role) => {
    if (role === 'salesman' || role === 'admin' || (role === 'customer' && email === authEmail)) {
        const repo = await cosmos_cart_repository_1.CosmosCartRepository.getInstance();
        const cart = await repo.getCartByCustomerEmail(email);
        if (!cart)
            throw new Error(`Cart with email ${email} does not exist.`);
        return cart;
    }
    else {
        throw new express_jwt_1.UnauthorizedError('credentials_required', {
            message: 'You must be a salesman, admin or logged in as the user who own this cart.',
        });
    }
};
const addCartItem = async (email, productId, quantity, authEmail, role) => {
    const cart = await getCartByEmail(email, authEmail, role);
    const productRepo = await cosmos_product_repository_1.CosmosProductRepository.getInstance();
    const product = await productRepo.getProductById(productId);
    if (!product)
        throw new Error(`Product with id ${productId} does not exist.`);
    const repo = await cosmos_cart_repository_1.CosmosCartRepository.getInstance();
    return await repo.addCartItem(cart, product, quantity);
};
const removeCartItem = async (email, productId, quantity, authEmail, role) => {
    const cart = await getCartByEmail(email, authEmail, role);
    const productRepo = await cosmos_product_repository_1.CosmosProductRepository.getInstance();
    const product = await productRepo.getProductById(productId);
    if (!product)
        throw new Error(`Product with id ${productId} does not exist.`);
    const repo = await cosmos_cart_repository_1.CosmosCartRepository.getInstance();
    return await repo.removeCartItem(cart, product, quantity);
};
const addDiscountCode = async (email, code, authEmail, role) => {
    const cart = await getCartByEmail(email, authEmail, role);
    const discountCodeRepo = await cosmos_discountCode_repository_1.CosmosDiscountCodeRepository.getInstance();
    const discountCode = await discountCodeRepo.getDiscountCodeByCode(code);
    if (!discountCode)
        throw new Error(`Discountcode with code ${code} does not exist.`);
    const repo = await cosmos_cart_repository_1.CosmosCartRepository.getInstance();
    return await repo.addDiscountCode(cart, discountCode);
};
const removeDiscountCode = async (email, code, authEmail, role) => {
    const cart = await getCartByEmail(email, authEmail, role);
    const repo = await cosmos_cart_repository_1.CosmosCartRepository.getInstance();
    return await repo.removeDiscountCode(cart, code);
};
const convertCartToOrder = async (email, paymentStatus, authEmail, role) => {
    const cart = await getCartByEmail(email, authEmail, role);
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
    const orderRepo = await cosmos_order_repository_1.CosmosOrderRepository.getInstance();
    const cartRepo = await cosmos_cart_repository_1.CosmosCartRepository.getInstance();
    const outputOrder = await orderRepo.createOrder(order);
    await cartRepo.emptyCart(cart);
    return outputOrder;
};
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
//# sourceMappingURL=cart.service.js.map