"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const customer_1 = require("../model/customer");
const cart_db_1 = __importDefault(require("../repository/cart.db"));
// import cartDb from '../repository/cart.db';
const customer_db_1 = __importDefault(require("../repository/customer.db"));
const product_db_1 = __importDefault(require("../repository/product.db"));
// import cartService from './cart.service';
// import bcrypt from 'bcrypt';
const bcrypt = __importStar(require("bcrypt"));
const jwt_1 = require("../util/jwt");
const express_jwt_1 = require("express-jwt");
const getCustomers = (email, role) => __awaiter(void 0, void 0, void 0, function* () {
    if (role === 'admin') {
        return yield customer_db_1.default.getCustomers();
    }
    else {
        throw new express_jwt_1.UnauthorizedError('credentials_required', {
            message: 'You must be an admin to access all users.',
        });
    }
});
const getCustomerByEmail = (email, authEmail, role) => __awaiter(void 0, void 0, void 0, function* () {
    if (role === 'admin' || role === 'salesman' || (role === 'customer' && email === authEmail)) {
        const customer = yield customer_db_1.default.getCustomerByEmail({ email });
        if (!customer)
            throw new Error(`Customer with email ${email} does not exist.`);
        return customer;
    }
    else {
        throw new express_jwt_1.UnauthorizedError('credentials_required', {
            message: 'You must be an admin, salesman or be logged in as the same user.',
        });
    }
});
const getWishlistByEmail = (email, authEmail, role) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = yield getCustomerByEmail(email, authEmail, role);
    return customer.getWishlist();
});
const createCustomer = ({ firstName, lastName, email, password, }) => __awaiter(void 0, void 0, void 0, function* () {
    const existingCustomer = yield customer_db_1.default.getCustomerByEmail({ email });
    if (existingCustomer)
        throw new Error('A customer with this email already exists.');
    const hashedPassword = yield bcrypt.hash(password, 12);
    const customer = new customer_1.Customer({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: 'customer',
        wishlist: [],
    });
    const existingCart = yield cart_db_1.default.getCartByCustomerEmail({
        email: customer.getEmail(),
    });
    if (existingCart)
        throw new Error('This customer already has a cart.');
    const newCustomer = yield customer_db_1.default.createCustomer(customer);
    yield cart_db_1.default.createCart(newCustomer);
    return newCustomer;
});
const updateCustomer = (currentEmail, { firstName, lastName, email, password }, authEmail, role) => __awaiter(void 0, void 0, void 0, function* () {
    if (role === 'admin' ||
        role === 'salesman' ||
        (role === 'customer' && currentEmail === authEmail)) {
        const existingCustomer = yield customer_db_1.default.getCustomerByEmail({ email: currentEmail });
        if (!existingCustomer)
            throw new Error('This customer does not exist.');
        const newUserData = {
            firstName,
            lastName,
            email,
            password,
            role: existingCustomer.getRole(),
        };
        existingCustomer.updateUser(newUserData);
        return yield customer_db_1.default.updateCustomer(existingCustomer);
    }
    else {
        throw new express_jwt_1.UnauthorizedError('credentials_required', {
            message: 'You must be an admin, salesman or be logged in as the same user.',
        });
    }
});
const deleteCustomer = (email, authEmail, role) => __awaiter(void 0, void 0, void 0, function* () {
    if (role === 'admin' || role === 'salesman' || (role === 'customer' && email === authEmail)) {
        const existingCustomer = yield customer_db_1.default.getCustomerByEmail({ email });
        if (!existingCustomer)
            throw new Error('This customer does not exist.');
        const existingCart = yield cart_db_1.default.getCartByCustomerEmail({ email });
        if (!existingCart) {
            throw new Error('That customer does not have a cart.');
        }
        yield cart_db_1.default.deleteCart({ id: existingCart.getId() });
        return yield customer_db_1.default.deleteCustomer({ email });
    }
    else {
        throw new express_jwt_1.UnauthorizedError('credentials_required', {
            message: 'You must be an admin, salesman or be logged in as the same user.',
        });
    }
});
const addProductToWishlist = (email, productId, authEmail, role) => __awaiter(void 0, void 0, void 0, function* () {
    if (role === 'admin' || role === 'salesman' || (role === 'customer' && email === authEmail)) {
        const customer = yield getCustomerByEmail(email, authEmail, role);
        const product = yield product_db_1.default.getProductById({ id: productId });
        if (!product)
            throw new Error(`Product with id ${productId} does not exist.`);
        if (customer.getWishlist().some((item) => item.getId() === productId)) {
            throw new Error(`Product with id ${productId} is already in the wishlist.`);
        }
        return yield customer_db_1.default.addProductToWishlist(customer, product);
    }
    else {
        throw new express_jwt_1.UnauthorizedError('credentials_required', {
            message: 'You must be an admin, salesman or be logged in as the same user.',
        });
    }
});
const removeProductFromWishlist = (email, productId, authEmail, role) => __awaiter(void 0, void 0, void 0, function* () {
    if (role === 'admin' || role === 'salesman' || (role === 'customer' && email === authEmail)) {
        const customer = yield getCustomerByEmail(email, authEmail, role);
        const product = yield product_db_1.default.getProductById({ id: productId });
        if (!product)
            throw new Error(`Product with id ${productId} does not exist.`);
        if (!customer.getWishlist().some((item) => item.getId() === productId)) {
            throw new Error(`Product with id ${productId} is not in the wishlist.`);
        }
        return yield customer_db_1.default.removeProductFromWishlist(customer, product);
    }
    else {
        throw new express_jwt_1.UnauthorizedError('credentials_required', {
            message: 'You must be an admin, salesman or be logged in as the same user.',
        });
    }
});
const authenticate = ({ email, password, }) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = yield customer_db_1.default.getCustomerByEmail({ email });
    if (!customer) {
        throw new Error('That email and password combination is incorrect.');
    }
    const isValidPassword = yield bcrypt.compare(password, customer.getPassword());
    if (!isValidPassword) {
        throw new Error('That email and password combination is incorrect.');
    }
    return {
        token: (0, jwt_1.generateJwtToken)({ email, role: customer.getRole() }),
        email: email,
        fullname: `${customer.getFirstName()} ${customer.getLastName()}`,
        role: customer.getRole(),
    };
});
exports.default = {
    getCustomers,
    getCustomerByEmail,
    getWishlistByEmail,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    addProductToWishlist,
    removeProductFromWishlist,
    authenticate,
};
