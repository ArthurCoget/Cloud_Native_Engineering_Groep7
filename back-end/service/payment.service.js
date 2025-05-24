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
const payment_db_1 = __importDefault(require("../repository/payment.db"));
const getPayments = (email, role) => __awaiter(void 0, void 0, void 0, function* () {
    if (role === 'salesman' || role === 'admin') {
        return yield payment_db_1.default.getPayments();
    }
    else {
        throw new express_jwt_1.UnauthorizedError('credentials_required', {
            message: 'You must be a salesman or admin to access all payments.',
        });
    }
});
const getPaymentById = (id, email, role) => __awaiter(void 0, void 0, void 0, function* () {
    if (role === 'salesman' || role === 'admin') {
        const payment = yield payment_db_1.default.getPaymentById({ id });
        if (!payment)
            throw new Error(`Payment with id ${id} does not exist.`);
        return payment;
    }
    else {
        throw new express_jwt_1.UnauthorizedError('credentials_required', {
            message: 'You must be a salesman or admin to access a payment by id.',
        });
    }
});
exports.default = {
    getPayments,
    getPaymentById,
};
