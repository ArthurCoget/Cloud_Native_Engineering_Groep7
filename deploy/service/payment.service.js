"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const express_jwt_1 = require("express-jwt");
const cosmos_payment_repository_1 = require("../repository/cosmos-payment-repository");
class PaymentService {
    static instance;
    static getInstance() {
        if (!this.instance) {
            this.instance = new PaymentService();
        }
        return this.instance;
    }
    constructor() { }
    getPaymentRepo = async () => await cosmos_payment_repository_1.CosmosPaymentRepository.getInstance();
    getPayments = async (email, role) => {
        if (role === "salesman" || role === "admin") {
            const paymentDB = await this.getPaymentRepo();
            return await paymentDB.getPayments();
        }
        else {
            throw new express_jwt_1.UnauthorizedError("credentials_required", {
                message: "You must be a salesman or admin to access all payments.",
            });
        }
    };
    getPaymentById = async (id, email, role) => {
        if (role === "salesman" || role === "admin") {
            const paymentDB = await this.getPaymentRepo();
            const payment = await paymentDB.getPaymentById(id);
            if (!payment) {
                throw new Error(`Payment with id ${id} does not exist.`);
            }
            return payment;
        }
        else {
            throw new express_jwt_1.UnauthorizedError("credentials_required", {
                message: "You must be a salesman or admin to access a payment by id.",
            });
        }
    };
}
exports.PaymentService = PaymentService;
//# sourceMappingURL=payment.service.js.map