"use strict";
// import { Payment as PaymentPrisma } from '@prisma/client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = void 0;
class Payment {
    id;
    amount;
    date;
    paymentStatus;
    constructor(payment) {
        this.validate(payment);
        this.id = payment.id;
        this.amount = payment.amount;
        this.date = payment.date;
        this.paymentStatus = payment.paymentStatus;
    }
    getId() {
        return this.id;
    }
    getAmount() {
        return this.amount;
    }
    getDate() {
        return this.date;
    }
    getPaymentStatus() {
        return this.paymentStatus;
    }
    setAmount(amount) {
        if (amount < 0) {
            throw new Error("Amount must be positive.");
        }
        this.amount = amount;
    }
    validate(payment) {
        if (payment.amount < 0) {
            throw new Error("Amount must be positive.");
        }
        if (payment.paymentStatus !== "paid" &&
            payment.paymentStatus !== "unpaid") {
            throw new Error("Payment status must be either paid or unpaid.");
        }
        if (!(payment.date instanceof Date) || isNaN(payment.date.getTime())) {
            throw new Error("Invalid date provided.");
        }
        const currentDate = new Date();
        if (payment.date > currentDate) {
            throw new Error("Payment date cannot be in the future.");
        }
    }
    pay() {
        if (this.paymentStatus === "paid") {
            throw new Error("Payment has already been made.");
        }
        this.date = new Date();
        this.paymentStatus = "paid";
    }
    // static from({ id, amount, date, paymentStatus }: PaymentPrisma) {
    //     return new Payment({
    //         id,
    //         amount,
    //         date,
    //         paymentStatus,
    //     });
    // }
    static fromCosmos(document) {
        return new Payment({
            id: parseInt(document.id, 10),
            amount: document.amount,
            date: new Date(document.date),
            paymentStatus: document.paymentStatus,
        });
    }
}
exports.Payment = Payment;
//# sourceMappingURL=payment.js.map