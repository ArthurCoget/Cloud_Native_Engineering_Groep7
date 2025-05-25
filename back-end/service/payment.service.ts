import { UnauthorizedError } from 'express-jwt';
import { Payment } from '../model/payment';
import CosmosPaymentRepository from '../repository/cosmos-payment-repository'; // Update this to correct path
import { PaymentInput, Role } from '../types';

const getPayments = async (email: string, role: Role): Promise<Payment[]> => {
    if (role === 'salesman' || role === 'admin') {
        const paymentRepo = await CosmosPaymentRepository.getInstance();
        return await paymentRepo.getPayments();
    } else {
        throw new UnauthorizedError('credentials_required', {
            message: 'You must be a salesman or admin to access all payments.',
        });
    }
};

const getPaymentById = async (id: number, email: string, role: Role): Promise<Payment> => {
    if (role === 'salesman' || role === 'admin') {
        const paymentRepo = await CosmosPaymentRepository.getInstance();
        const payment = await paymentRepo.getPaymentById(id);

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
