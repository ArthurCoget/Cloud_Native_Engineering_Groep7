import { UnauthorizedError } from 'express-jwt';
import { Payment } from '../model/payment';
import orderDb from '../repository/order.db';
import paymentDb from '../repository/payment.db';
import { PaymentInput, Role } from '../types';

const getPayments = async (email: string, role: Role): Promise<Payment[]> => {
    if (role === 'salesman' || role === 'admin') {
        return await paymentDb.getPayments();
    } else {
        throw new UnauthorizedError('credentials_required', {
            message: 'You must be a salesman or admin to access all payments.',
        });
    }
};

const getPaymentById = async (id: number, email: string, role: Role): Promise<Payment> => {
    if (role === 'salesman' || role === 'admin') {
        const payment = await paymentDb.getPaymentById({ id });

        if (!payment) throw new Error(`Payment with id ${id} does not exist.`);

        return payment;
    } else {
        throw new UnauthorizedError('credentials_required', {
            message: 'You must be a salesman or admin to access a payment by id.',
        });
    }
};

export default {
    getPayments,
    getPaymentById,
};
