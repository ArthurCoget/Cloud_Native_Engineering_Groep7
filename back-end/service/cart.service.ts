import { Cart } from '../model/cart';
import { CartItem } from '../model/cartItem';
import cartDB from '../repository/cart.db';
import productDb from '../repository/product.db';
import { Payment } from '../model/payment';
import { OrderItem } from '../model/orderItem';
import { Order } from '../model/order';
import orderDb from '../repository/order.db';
import { DiscountCodeInput, Role } from '../types';
import discountCodeDb from '../repository/discountCode.db';
import { DiscountCode } from '../model/discountCode';
import { UnauthorizedError } from 'express-jwt';

const getCarts = async (email: string, role: Role): Promise<Cart[]> => {
    if (role === 'salesman' || role === 'admin') {
        return await cartDB.getCarts();
    } else {
        throw new UnauthorizedError('credentials_required', {
            message: 'You must be a salesman or admin to access all carts.',
        });
    }
};

const getCartById = async (id: number, email: string, role: Role): Promise<Cart | null> => {
    if (role === 'salesman' || role === 'admin') {
        const cart = await cartDB.getCartById({ id });
        if (!cart) throw new Error(`Cart with id ${id} does not exist.`);
        return cart;
    } else {
        throw new UnauthorizedError('credentials_required', {
            message: 'You must be a salesman or admin to access a cart by Id.',
        });
    }
};

const getCartByEmail = async (
    email: string,
    authEmail: string,
    role: Role
): Promise<Cart | null> => {
    if (role === 'salesman' || role === 'admin' || (role === 'customer' && email === authEmail)) {
        const cart = await cartDB.getCartByCustomerEmail({ email });
        if (!cart) throw new Error(`Cart with email ${email} does not exist.`);
        return cart;
    } else {
        throw new UnauthorizedError('credentials_required', {
            message: 'You must be a salesman, admin or logged in as the user who own this cart.',
        });
    }
};

const addCartItem = async (
    email: string,
    productId: number,
    quantity: number,
    authEmail: string,
    role: Role
): Promise<CartItem> => {
    const existingCart = await getCartByEmail(email, authEmail, role);
    const product = await productDb.getProductById({ id: productId });
    if (!product) throw new Error(`Product with id ${productId} does not exist.`);

    return await cartDB.addCartItem(existingCart!, product, quantity);
};

const removeCartItem = async (
    email: string,
    productId: number,
    quantity: number,
    authEmail: string,
    role: Role
): Promise<CartItem | string> => {
    const existingCart = await getCartByEmail(email, authEmail, role);
    const product = await productDb.getProductById({ id: productId });
    if (!product) throw new Error(`Product with id ${productId} does not exist.`);

    return await cartDB.removeCartItem(existingCart!, product, quantity);
};

const addDiscountCode = async (
    email: string,
    code: string,
    authEmail: string,
    role: Role
): Promise<DiscountCode | null> => {
    const existingCart = await getCartByEmail(email, authEmail, role);
    const existingDiscountCode = await discountCodeDb.getDiscountCodeByCode({ code: code });
    if (!existingDiscountCode) throw new Error(`Discountcode with code ${code} does not exist.`);

    const appliedDiscountCode = existingCart!.applyDiscountCode(existingDiscountCode);

    return await cartDB.addDiscountCode(existingCart!, appliedDiscountCode);
};

const removeDiscountCode = async (
    email: string,
    code: string,
    authEmail: string,
    role: Role
): Promise<string> => {
    const existingCart = await getCartByEmail(email, authEmail, role);
    const existingDiscountCode = await discountCodeDb.getDiscountCodeByCode({ code: code });
    if (!existingDiscountCode) throw new Error(`DiscountCode with code ${code} does not exist.`);

    existingCart!.removeDiscountCode(existingDiscountCode);

    return await cartDB.removeDiscountCode(existingCart!, code);
};

const convertCartToOrder = async (
    email: string,
    paymentStatus: string,
    authEmail: string,
    role: Role
): Promise<Order> => {
    const cart = await getCartByEmail(email, authEmail, role);

    if (!cart) throw new Error(`Cart with user email ${email} does not exist.`);

    if (!paymentStatus) {
        throw new Error('Payment status is required.');
    }

    if (paymentStatus !== 'paid' && paymentStatus !== 'unpaid') {
        throw new Error('Payment status must be paid or unpaid.');
    }

    const customer = cart.getCustomer();
    const items = cart.getProducts().map(
        (cartItem) =>
            new OrderItem({
                product: cartItem.getProduct(),
                quantity: cartItem.getQuantity(),
            })
    );

    const payment = new Payment({
        amount: cart.getTotalAmount(),
        date: new Date(),
        paymentStatus: paymentStatus,
    });

    const order = new Order({
        customer,
        items,
        date: new Date(),
        payment,
    });

    const outputOrder = await orderDb.createOrder(order);
    await cartDB.emptyCart(cart);

    return outputOrder;
};

export default {
    getCarts,
    getCartById,
    addCartItem,
    removeCartItem,
    addDiscountCode,
    removeDiscountCode,
    convertCartToOrder,
    getCartByEmail,
};
