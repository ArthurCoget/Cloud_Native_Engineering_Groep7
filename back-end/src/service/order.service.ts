import { UnauthorizedError } from 'express-jwt';
import { Customer } from '../model/customer';
import { Order } from '../model/order';
import { OrderItem } from '../model/orderItem';
import { Payment } from '../model/payment';
import { Product } from '../model/product';
import customerDb from '../repository/customer.db';
import orderDb from '../repository/order.db';
import { OrderInput, Role } from '../types';

const getOrders = async ({ email, role }: { email: string; role: string }): Promise<Order[]> => {
    if (role === 'admin' || role === 'salesman') {
        return orderDb.getOrders();
    } else if (role === 'customer') {
        return orderDb.getOrdersByCustomer({ email });
    } else {
        throw new UnauthorizedError('credentials_required', {
            message: 'You must be logged in to access orders.',
        });
    }
};

const getOrderById = async (id: number, email: string, role: Role): Promise<Order> => {
    const order = await orderDb.getOrderById({ id });

    if (!order) throw new Error(`Order with id ${id} does not exist.`);
    if (
        role === 'admin' ||
        role === 'salesman' ||
        (role === 'customer' && email === order.getCustomer().getEmail())
    ) {
        const order = await orderDb.getOrderById({ id });

        if (!order) throw new Error(`Order with id ${id} does not exist.`);

        return order;
    } else {
        throw new UnauthorizedError('credentials_required', {
            message:
                'You must be a salesman,  admin or be logged in as the customer who the order belongs to to access an order by id.',
        });
    }
};

const deleteOrder = async (orderId: number, email: string, role: Role): Promise<string> => {
    if (role === 'admin' || role === 'salesman') {
        const existingOrder = await orderDb.getOrderById({ id: orderId });

        if (!existingOrder) throw new Error('This order does not exist.');

        return await orderDb.deleteOrder({ id: orderId });
    } else {
        throw new UnauthorizedError('credentials_required', {
            message: 'You must be a salesman or admin to delete an order.',
        });
    }
};

export default {
    getOrders,
    getOrderById,
    deleteOrder,
};
