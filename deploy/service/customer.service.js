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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerService = void 0;
const bcrypt = __importStar(require("bcrypt"));
const express_jwt_1 = require("express-jwt");
const customer_1 = require("../model/customer");
const jwt_1 = require("../util/jwt");
const cosmos_cart_repository_1 = require("../repository/cosmos-cart-repository");
const cosmos_customer_repository_1 = require("../repository/cosmos-customer-repository");
const cosmos_product_repository_1 = require("../repository/cosmos-product-repository");
// IDs
const uuid_1 = require("uuid");
class CustomerService {
    static instance;
    static getInstance() {
        if (!this.instance) {
            this.instance = new CustomerService();
        }
        return this.instance;
    }
    getCustomerRepo = async () => await cosmos_customer_repository_1.CosmosCustomerRepository.getInstance();
    getCartRepo = async () => await cosmos_cart_repository_1.CosmosCartRepository.getInstance();
    getProductRepo = async () => await cosmos_product_repository_1.CosmosProductRepository.getInstance();
    getCustomers = async (email, role) => {
        if (role === "admin") {
            const customerDB = await this.getCustomerRepo();
            return await customerDB.getCustomers();
        }
        else {
            throw new express_jwt_1.UnauthorizedError("credentials_required", {
                message: "You must be an admin to access all users.",
            });
        }
    };
    getCustomerByEmail = async (email, authEmail, role) => {
        if (role === "admin" ||
            role === "salesman" ||
            (role === "customer" && email === authEmail)) {
            const customerDB = await this.getCustomerRepo();
            const customer = await customerDB.getCustomerByEmail(email);
            if (!customer)
                throw new Error(`Customer with email ${email} does not exist.`);
            return customer;
        }
        else {
            throw new express_jwt_1.UnauthorizedError("credentials_required", {
                message: "You must be an admin, salesman or be logged in as the same user.",
            });
        }
    };
    getWishlistByEmail = async (email, authEmail, role) => {
        const customerDB = await this.getCustomerRepo();
        const customer = await customerDB.getCustomerByEmail(email);
        return customer.getWishlist();
    };
    createCustomer = async ({ firstName, lastName, email, password, }) => {
        const customerDB = await this.getCustomerRepo();
        const cartDB = await this.getCartRepo();
        const existingCustomer = await customerDB.getCustomerByEmail(email);
        if (existingCustomer)
            throw new Error("A customer with this email already exists.");
        const hashedPassword = await bcrypt.hash(password, 12);
        const id = (0, uuid_1.v4)();
        const customer = new customer_1.Customer({
            id,
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role: "customer",
            wishlist: [],
        });
        const existingCart = await cartDB.getCartByCustomerEmail(customer.getEmail());
        if (existingCart)
            throw new Error("This customer already has a cart.");
        const newCustomer = await customerDB.createCustomer(customer);
        await cartDB.createCart(newCustomer);
        return newCustomer;
    };
    updateCustomer = async (currentEmail, { firstName, lastName, email, password }, authEmail, role) => {
        if (role === "admin" ||
            role === "salesman" ||
            (role === "customer" && currentEmail === authEmail)) {
            const customerDB = await this.getCustomerRepo();
            const existingCustomer = await customerDB.getCustomerByEmail(currentEmail);
            if (!existingCustomer)
                throw new Error("This customer does not exist.");
            const newUserData = {
                firstName,
                lastName,
                email,
                password,
                role: existingCustomer.getRole(),
            };
            existingCustomer.updateUser(newUserData);
            return await customerDB.updateCustomer(existingCustomer);
        }
        else {
            throw new express_jwt_1.UnauthorizedError("credentials_required", {
                message: "You must be an admin, salesman or be logged in as the same user.",
            });
        }
    };
    // const deleteCustomer = async (email: string, authEmail: string, role: Role): Promise<string> => {
    //     if (role === 'admin' || role === 'salesman' || (role === 'customer' && email === authEmail)) {
    //         const customerDB = await getCustomerRepo();
    //         const cartDB = await getCartRepo();
    //         const existingCustomer = await customerDB.getCustomerByEmail(email);
    //         if (!existingCustomer) throw new Error('This customer does not exist.');
    //         const existingCart = await cartDB.getCartByCustomerEmail(email);
    //         if (!existingCart) throw new Error('That customer does not have a cart.');
    //         await cartDB.deleteCart(existingCart.getId()!.toString());
    //         return await customerDB.deleteCustomer(email);
    //     } else {
    //         throw new UnauthorizedError('credentials_required', {
    //             message: 'You must be an admin, salesman or be logged in as the same user.',
    //         });
    //     }
    // };
    addProductToWishlist = async (email, productId, authEmail, role) => {
        if (role === "admin" ||
            role === "salesman" ||
            (role === "customer" && email === authEmail)) {
            const customerDB = await this.getCustomerRepo();
            const productDB = await this.getProductRepo();
            const customer = await customerDB.getCustomerByEmail(email);
            const product = await productDB.getProductById(productId);
            if (!product)
                throw new Error(`Product with id ${productId} does not exist.`);
            if (customer.getWishlist().some((item) => item.getId() === productId)) {
                throw new Error(`Product with id ${productId} is already in the wishlist.`);
            }
            return await customerDB.addProductToWishlist(customer, product);
        }
        else {
            throw new express_jwt_1.UnauthorizedError("credentials_required", {
                message: "You must be an admin, salesman or be logged in as the same user.",
            });
        }
    };
    removeProductFromWishlist = async (email, productId, authEmail, role) => {
        if (role === "admin" ||
            role === "salesman" ||
            (role === "customer" && email === authEmail)) {
            const customerDB = await this.getCustomerRepo();
            const productDB = await this.getProductRepo();
            const customer = await customerDB.getCustomerByEmail(email);
            const product = await productDB.getProductById(productId);
            if (!product)
                throw new Error(`Product with id ${productId} does not exist.`);
            if (!customer.getWishlist().some((item) => item.getId() === productId)) {
                throw new Error(`Product with id ${productId} is not in the wishlist.`);
            }
            return await customerDB.removeProductFromWishlist(customer, product);
        }
        else {
            throw new express_jwt_1.UnauthorizedError("credentials_required", {
                message: "You must be an admin, salesman or be logged in as the same user.",
            });
        }
    };
    authenticate = async ({ email, password, }) => {
        const customerDB = await this.getCustomerRepo();
        console.log("Attempting login for email:", email);
        const customer = await customerDB.getCustomerByEmail(email);
        if (!customer) {
            console.error("Customer not found for email:", email);
            throw new Error("That email and password combination is incorrect.");
        }
        console.log("Customer found:", customer.getEmail());
        const isValidPassword = await bcrypt.compare(password, customer.getPassword());
        if (!isValidPassword) {
            console.error("Password mismatch for email:", email);
            throw new Error("That email and password combination is incorrect.");
        }
        return {
            token: (0, jwt_1.generateJwtToken)({ email, role: customer.getRole() }),
            email: email,
            fullname: `${customer.getFirstName()} ${customer.getLastName()}`,
            role: customer.getRole(),
        };
    };
}
exports.CustomerService = CustomerService;
//# sourceMappingURL=customer.service.js.map