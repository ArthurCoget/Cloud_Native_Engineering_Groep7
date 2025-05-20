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
const payment_1 = require("../model/payment");
const database_1 = __importDefault(require("./database"));
const addPayment = (_a) => __awaiter(void 0, [_a], void 0, function* ({ orderId, amount, }) {
    try {
        const paymentPrisma = yield database_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
            const order = yield prisma.order.findUnique({
                where: { id: orderId },
                include: { payment: true },
            });
            if (!order) {
                throw new Error(`Order with id ${orderId} not found.`);
            }
            if (!order.payment) {
                throw new Error(`No payment associated with order id ${orderId}.`);
            }
            if (order.payment.paymentStatus === 'unpaid') {
                const updatedPayment = yield prisma.payment.update({
                    where: { id: order.payment.id },
                    data: {
                        amount: amount,
                        date: new Date(),
                        paymentStatus: 'paid',
                    },
                });
                return updatedPayment;
            }
            else {
                throw new Error('Payment has already been made.');
            }
        }));
        return payment_1.Payment.from(paymentPrisma);
    }
    catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
});
const getPayments = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const paymentsPrisma = yield database_1.default.payment.findMany();
        return paymentsPrisma.map(payment_1.Payment.from);
    }
    catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
});
const getPaymentById = (_a) => __awaiter(void 0, [_a], void 0, function* ({ id }) {
    try {
        const paymentPrisma = yield database_1.default.payment.findUnique({
            where: { id: id },
        });
        if (!paymentPrisma) {
            return null;
        }
        return payment_1.Payment.from(paymentPrisma);
    }
    catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
});
exports.default = {
    addPayment,
    getPayments,
    getPaymentById,
};
