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
const order_db_1 = __importDefault(require("../repository/order.db"));
const getOrders = (_a) => __awaiter(void 0, [_a], void 0, function* ({ email, role }) {
    if (role === 'admin' || role === 'salesman') {
        return order_db_1.default.getOrders();
    }
    else if (role === 'customer') {
        return order_db_1.default.getOrdersByCustomer({ email });
    }
    else {
        throw new express_jwt_1.UnauthorizedError('credentials_required', {
            message: 'You must be logged in to access orders.',
        });
    }
});
const getOrderById = (id, email, role) => __awaiter(void 0, void 0, void 0, function* () {
    const order = yield order_db_1.default.getOrderById({ id });
    if (!order)
        throw new Error(`Order with id ${id} does not exist.`);
    if (role === 'admin' ||
        role === 'salesman' ||
        (role === 'customer' && email === order.getCustomer().getEmail())) {
        const order = yield order_db_1.default.getOrderById({ id });
        if (!order)
            throw new Error(`Order with id ${id} does not exist.`);
        return order;
    }
    else {
        throw new express_jwt_1.UnauthorizedError('credentials_required', {
            message: 'You must be a salesman,  admin or be logged in as the customer who the order belongs to to access an order by id.',
        });
    }
});
const deleteOrder = (orderId, email, role) => __awaiter(void 0, void 0, void 0, function* () {
    if (role === 'admin' || role === 'salesman') {
        const existingOrder = yield order_db_1.default.getOrderById({ id: orderId });
        if (!existingOrder)
            throw new Error('This order does not exist.');
        return yield order_db_1.default.deleteOrder({ id: orderId });
    }
    else {
        throw new express_jwt_1.UnauthorizedError('credentials_required', {
            message: 'You must be a salesman or admin to delete an order.',
        });
    }
});
exports.default = {
    getOrders,
    getOrderById,
    deleteOrder,
};
