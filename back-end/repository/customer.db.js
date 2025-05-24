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
const customer_1 = require("../model/customer");
const product_1 = require("../model/product");
const database_1 = __importDefault(require("./database"));
const getCustomers = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const customersPrisma = yield database_1.default.customer.findMany({
            include: { wishlist: true },
        });
        return customersPrisma.map((customerPrisma) => customer_1.Customer.from(customerPrisma));
    }
    catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
});
const getCustomerById = ({ id }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const customerPrisma = yield database_1.default.customer.findUnique({
            where: { id: id },
            include: { wishlist: true },
        });
        if (!customerPrisma) {
            return null;
        }
        return customer_1.Customer.from(customerPrisma);
    }
    catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
});
const getCustomerByEmail = ({ email }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const customerPrisma = yield database_1.default.customer.findUnique({
            where: { email: email },
            include: { wishlist: true },
        });
        if (!customerPrisma) {
            return null;
        }
        return customer_1.Customer.from(customerPrisma);
    }
    catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
});
const createCustomer = (customer) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const customerPrisma = yield database_1.default.customer.create({
            data: {
                firstName: customer.getFirstName(),
                lastName: customer.getLastName(),
                email: customer.getEmail(),
                password: customer.getPassword(),
                role: customer.getRole(),
            },
            include: { wishlist: true },
        });
        return customer_1.Customer.from(customerPrisma);
    }
    catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
});
const updateCustomer = (updatedCustomer) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const customerPrisma = yield database_1.default.customer.update({
            where: { id: updatedCustomer.getId() },
            data: {
                firstName: updatedCustomer.getFirstName(),
                lastName: updatedCustomer.getLastName(),
                email: updatedCustomer.getEmail(),
                password: updatedCustomer.getPassword(),
                role: updatedCustomer.getRole(),
            },
            include: { wishlist: true },
        });
        return customer_1.Customer.from(customerPrisma);
    }
    catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
});
const deleteCustomer = ({ email }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield database_1.default.customer.delete({
            where: { email: email },
        });
        return 'Customer has been deleted.';
    }
    catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
});
const addProductToWishlist = (customer, product) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield database_1.default.customer.update({
            where: { id: customer.getId() },
            data: {
                wishlist: {
                    connect: { id: product.getId() },
                },
            },
        });
        const productPrisma = yield database_1.default.product.findUnique({
            where: { id: product.getId() },
        });
        if (!productPrisma) {
            throw new Error('Product not found.');
        }
        return product_1.Product.from(productPrisma);
    }
    catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
});
const removeProductFromWishlist = (customer, product) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield database_1.default.customer.update({
            where: { id: customer.getId() },
            data: {
                wishlist: {
                    disconnect: { id: product.getId() },
                },
            },
        });
        return 'Product has been removed from the wishlist.';
    }
    catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
});
exports.default = {
    getCustomers,
    getCustomerById,
    createCustomer,
    getCustomerByEmail,
    updateCustomer,
    deleteCustomer,
    addProductToWishlist,
    removeProductFromWishlist,
};
