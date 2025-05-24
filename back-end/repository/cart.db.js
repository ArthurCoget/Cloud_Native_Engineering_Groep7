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
const cart_1 = require("../model/cart");
const cartItem_1 = require("../model/cartItem");
const database_1 = __importDefault(require("./database"));
const discountCode_db_1 = __importDefault(require("./discountCode.db"));
const getCarts = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cartsPrisma = yield database_1.default.cart.findMany({
            include: {
                customer: true,
                cartItems: { include: { product: true } },
                discountCodes: true,
            },
        });
        return cartsPrisma.map((cartPrisma) => cart_1.Cart.from(cartPrisma));
    }
    catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
});
const getCartById = ({ id }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cartPrisma = yield database_1.default.cart.findUnique({
            where: { id: id },
            include: {
                customer: true,
                cartItems: { include: { product: true } },
                discountCodes: true,
            },
        });
        if (!cartPrisma) {
            return null;
        }
        return cart_1.Cart.from(cartPrisma);
    }
    catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
});
const getCartByCustomerEmail = ({ email }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cartPrisma = yield database_1.default.cart.findFirst({
            where: {
                customer: {
                    email: email,
                },
            },
            include: {
                customer: true,
                cartItems: { include: { product: true } },
                discountCodes: true,
            },
        });
        if (!cartPrisma) {
            return null;
        }
        return cart_1.Cart.from(cartPrisma);
    }
    catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
});
const getCartByCustomerId = ({ id }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cartPrisma = yield database_1.default.cart.findUnique({
            where: { customerId: id },
            include: {
                customer: true,
                cartItems: { include: { product: true } },
                discountCodes: true,
            },
        });
        if (!cartPrisma) {
            return null;
        }
        return cart_1.Cart.from(cartPrisma);
    }
    catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
});
const createCart = (customer) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cartPrisma = yield database_1.default.cart.create({
            data: {
                customer: {
                    connect: { id: customer.getId() },
                },
                cartItems: {
                    create: [],
                },
            },
            include: {
                customer: true,
                cartItems: { include: { product: true } },
                discountCodes: true,
            },
        });
        return cart_1.Cart.from(cartPrisma);
    }
    catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
});
const deleteCart = ({ id }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield database_1.default.cart.delete({
            where: { id: id },
        });
        return 'Cart successfully deleted.';
    }
    catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
});
const addCartItem = (cart, product, quantity) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productSize = cart.getProducts().length;
        const cartItem = cart.addItem(product, quantity);
        const newProductSize = cart.getProducts().length;
        if (productSize !== newProductSize) {
            yield database_1.default.cart.update({
                where: { id: cart.getId() },
                data: {
                    customer: {
                        connect: { id: cart.getCustomer().getId() },
                    },
                    cartItems: {
                        create: {
                            product: {
                                connect: { id: product.getId() },
                            },
                            quantity: cartItem.getQuantity(),
                        },
                    },
                },
                include: {
                    customer: true,
                    cartItems: { include: { product: true } },
                    discountCodes: true,
                },
            });
        }
        else {
            const existingCartItem = yield database_1.default.cartItem.findFirst({
                where: {
                    cartId: cart.getId(),
                    productId: product.getId(),
                },
            });
            if (!existingCartItem) {
                throw new Error('CartItem not found.');
            }
            yield database_1.default.cartItem.update({
                where: { id: existingCartItem.id },
                data: {
                    quantity: cartItem.getQuantity(),
                },
            });
        }
        const cartItemPrisma = yield database_1.default.cartItem.findFirst({
            where: {
                cartId: cart.getId(),
                productId: product.getId(),
            },
            include: { product: true },
        });
        if (!cartItemPrisma) {
            throw new Error('CartItem not found.');
        }
        return cartItem_1.CartItem.from(cartItemPrisma);
    }
    catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
});
const removeCartItem = (cart, product, quantity) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productSize = cart.getProducts().length;
        const cartItem = cart.removeItem(product, quantity);
        const newProductSize = cart.getProducts().length;
        const existingCartItem = yield database_1.default.cartItem.findFirst({
            where: {
                cartId: cart.getId(),
                productId: product.getId(),
            },
        });
        if (!existingCartItem) {
            throw new Error('CartItem not found.');
        }
        if (productSize !== newProductSize) {
            yield database_1.default.cartItem.delete({
                where: { id: existingCartItem.id },
            });
            return 'Item removed from cart.';
        }
        else if (cartItem instanceof cartItem_1.CartItem) {
            yield database_1.default.cartItem.update({
                where: { id: existingCartItem.id },
                data: {
                    quantity: cartItem.getQuantity(),
                },
            });
            const cartItemPrisma = yield database_1.default.cartItem.findFirst({
                where: {
                    cartId: cart.getId(),
                    productId: product.getId(),
                },
                include: { product: true },
            });
            if (!cartItemPrisma) {
                throw new Error('CartItem not found.');
            }
            return cartItem_1.CartItem.from(cartItemPrisma);
        }
        else {
            throw new Error('CartItem not found.');
        }
    }
    catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
});
const addDiscountCode = (cart, discountCode) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield database_1.default.cart.update({
            where: { id: cart.getId() },
            data: {
                discountCodes: {
                    connect: { id: discountCode.getId() },
                },
            },
            include: {
                customer: true,
                cartItems: { include: { product: true } },
                discountCodes: true,
            },
        });
        return discountCode_db_1.default.getDiscountCodeByCode({ code: discountCode.getCode() });
    }
    catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
});
const removeDiscountCode = (cart, discountCode) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield database_1.default.cart.update({
            where: { id: cart.getId() },
            data: {
                discountCodes: {
                    disconnect: { code: discountCode },
                },
            },
            include: {
                customer: true,
                cartItems: { include: { product: true } },
                discountCodes: true,
            },
        });
        return 'Discount code successfully deleted';
    }
    catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
});
const emptyCart = (cart) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield database_1.default.cartItem.deleteMany({
            where: {
                cartId: cart.getId(),
            },
        });
        yield database_1.default.cart.update({
            where: { id: cart.getId() },
            data: {
                discountCodes: {
                    disconnect: cart.getDiscountCodes().map((discountCode) => ({
                        id: discountCode.getId(),
                    })),
                },
            },
            include: {
                customer: true,
                cartItems: { include: { product: true } },
                discountCodes: true,
            },
        });
        return 'cart successfully emptied.';
    }
    catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
});
exports.default = {
    getCarts,
    getCartById,
    createCart,
    getCartByCustomerEmail,
    getCartByCustomerId,
    deleteCart,
    addCartItem,
    removeCartItem,
    addDiscountCode,
    removeDiscountCode,
    emptyCart,
};
