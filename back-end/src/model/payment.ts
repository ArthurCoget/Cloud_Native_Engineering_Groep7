import { Payment as PaymentPrisma } from '@prisma/client';

export class Payment {
    private id?: number;
    private amount: number;
    private date: Date;
    private paymentStatus: string;

    constructor(payment: { amount: number; date: Date; paymentStatus: string; id?: number }) {
        this.validate(payment);
        this.id = payment.id;
        this.amount = payment.amount;
        this.date = payment.date;
        this.paymentStatus = payment.paymentStatus;
    }

    getId(): number | undefined {
        return this.id;
    }

    getAmount(): number {
        return this.amount;
    }

    getDate(): Date {
        return this.date;
    }

    getPaymentStatus(): string {
        return this.paymentStatus;
    }

    setAmount(amount: number): void {
        if (amount < 0) {
            throw new Error('Amount must be positive.');
        }

        this.amount = amount;
    }

    validate(payment: { amount: number; date: Date; paymentStatus: string }) {
        if (payment.amount < 0) {
            throw new Error('Amount must be positive.');
        }
        if (payment.paymentStatus !== 'paid' && payment.paymentStatus !== 'unpaid') {
            throw new Error('Payment status must be either paid or unpaid.');
        }

        if (!(payment.date instanceof Date) || isNaN(payment.date.getTime())) {
            throw new Error('Invalid date provided.');
        }

        const currentDate = new Date();

        if (payment.date > currentDate) {
            throw new Error('Payment date cannot be in the future.');
        }
    }

    pay() {
        if (this.paymentStatus === 'paid') {
            throw new Error('Payment has already been made.');
        }

        this.date = new Date();

        this.paymentStatus = 'paid';
    }

    static from({ id, amount, date, paymentStatus }: PaymentPrisma) {
        return new Payment({
            id,
            amount,
            date,
            paymentStatus,
        });
    }
}
