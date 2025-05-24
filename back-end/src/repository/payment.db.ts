import { Payment } from '../model/payment';
import database from './database';

const addPayment = async ({
    orderId,
    amount,
}: {
    orderId: number;
    amount: number;
}): Promise<Payment> => {
    try {
        const paymentPrisma = await database.$transaction(async (prisma) => {
            const order = await prisma.order.findUnique({
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
                const updatedPayment = await prisma.payment.update({
                    where: { id: order.payment.id },
                    data: {
                        amount: amount,
                        date: new Date(),
                        paymentStatus: 'paid',
                    },
                });

                return updatedPayment;
            } else {
                throw new Error('Payment has already been made.');
            }
        });

        return Payment.from(paymentPrisma);
    } catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
};

const getPayments = async (): Promise<Payment[]> => {
    try {
        const paymentsPrisma = await database.payment.findMany();
        return paymentsPrisma.map(Payment.from);
    } catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
};

const getPaymentById = async ({ id }: { id: number }): Promise<Payment | null> => {
    try {
        const paymentPrisma = await database.payment.findUnique({
            where: { id: id },
        });

        if (!paymentPrisma) {
            return null;
        }
        return Payment.from(paymentPrisma);
    } catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
};

export default {
    addPayment,
    getPayments,
    getPaymentById,
};
