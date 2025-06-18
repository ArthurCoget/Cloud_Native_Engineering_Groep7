import { UnauthorizedError } from 'express-jwt';
import { Cart } from '../model/cart';
import { CartItem } from '../model/cartItem';
import { DiscountCode } from '../model/discountCode';
import { Order } from '../model/order';
import { OrderItem } from '../model/orderItem';
import { Payment } from '../model/payment';
import { CosmosCartRepository } from '../repository/cosmos-cart-repository';
import { CosmosDiscountCodeRepository } from '../repository/cosmos-discountCode-repository';
import { CosmosOrderRepository } from '../repository/cosmos-order-repository';
import { CosmosProductRepository } from '../repository/cosmos-product-repository';
import { Role } from '../types';

const getCarts = async (email: string, role: Role): Promise<Cart[]> => {
    if (role === 'salesman' || role === 'admin') {
        const repo = await CosmosCartRepository.getInstance();
        return await repo.getCarts();
    } else {
        throw new UnauthorizedError('credentials_required', {
            message: 'You must be a salesman or admin to access all carts.',
        });
    }
};

const getCartById = async (id: number, email: string, role: Role): Promise<Cart | null> => {
    if (role === 'salesman' || role === 'admin') {
        const repo = await CosmosCartRepository.getInstance();
        const cart = await repo.getCartById(id);
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
        const repo = await CosmosCartRepository.getInstance();
        const cart = await repo.getCartByCustomerEmail(email);
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
    const cart = await getCartByEmail(email, authEmail, role);
    const productRepo = await CosmosProductRepository.getInstance();
    const product = await productRepo.getProductById(productId);
    if (!product) throw new Error(`Product with id ${productId} does not exist.`);

    const repo = await CosmosCartRepository.getInstance();
    return await repo.addCartItem(cart!, product, quantity);
};

const removeCartItem = async (
    email: string,
    productId: number,
    quantity: number,
    authEmail: string,
    role: Role
): Promise<CartItem | string> => {
    const cart = await getCartByEmail(email, authEmail, role);
    const productRepo = await CosmosProductRepository.getInstance();
    const product = await productRepo.getProductById(productId);
    if (!product) throw new Error(`Product with id ${productId} does not exist.`);

    const repo = await CosmosCartRepository.getInstance();
    return await repo.removeCartItem(cart!, product, quantity);
};

const addDiscountCode = async (
    email: string,
    code: string,
    authEmail: string,
    role: Role
): Promise<DiscountCode | null> => {
    const cart = await getCartByEmail(email, authEmail, role);
    const discountCodeRepo = await CosmosDiscountCodeRepository.getInstance();
    const discountCode = await discountCodeRepo.getDiscountCodeByCode(code);
    if (!discountCode) throw new Error(`Discountcode with code ${code} does not exist.`);

    const repo = await CosmosCartRepository.getInstance();
    return await repo.addDiscountCode(cart!, discountCode);
};

const removeDiscountCode = async (
    email: string,
    code: string,
    authEmail: string,
    role: Role
): Promise<string> => {
    const cart = await getCartByEmail(email, authEmail, role);
    const repo = await CosmosCartRepository.getInstance();
    return await repo.removeDiscountCode(cart!, code);
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
        paymentStatus: paymentStatus as 'paid' | 'unpaid',
    });

    const order = new Order({
        customer,
        items,
        date: new Date(),
        payment,
    });

    const orderRepo = await CosmosOrderRepository.getInstance();
    const cartRepo = await CosmosCartRepository.getInstance();
    const outputOrder = await orderRepo.createOrder(order);
    await cartRepo.emptyCart(cart);

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