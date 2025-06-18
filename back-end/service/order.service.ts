import { UnauthorizedError } from 'express-jwt';
import { Customer } from '../model/customer';
import { Order } from '../model/order';
import { OrderItem } from '../model/orderItem';
import { Payment } from '../model/payment';
import { Product } from '../model/product';
import customerDb from '../repository/customer.db';
import { CosmosOrderRepository } from '../repository/cosmos-order-repository'; // Replace orderDb
import { OrderInput, Role } from '../types';

const getOrders = async ({ email, role }: { email: string; role: string }): Promise<Order[]> => {
    if (role === 'admin' || role === 'salesman') {
        const repo = await CosmosOrderRepository.getInstance();
        return repo.getOrders();
    } else if (role === 'customer') {
        const repo = await CosmosOrderRepository.getInstance();
        return repo.getOrdersByCustomer(email); // Pass email directly
    } else {
        throw new UnauthorizedError('credentials_required', {
            message: 'You must be logged in to access orders.',
        });
    }
};

const getOrderById = async (id: number, email: string, role: Role): Promise<Order> => {
    const repo = await CosmosOrderRepository.getInstance();
    const order = await repo.getOrderById(id);

    if (!order) throw new Error(`Order with id ${id} does not exist.`);
    if (
        role === 'admin' ||
        role === 'salesman' ||
        (role === 'customer' && email === order.getCustomer().getEmail())
    ) {
        return order;
    } else {
        throw new UnauthorizedError('credentials_required', {
            message:
                'You must be a salesman, admin, or be logged in as the customer who the order belongs to to access an order by id.',
        });
    }
};

const deleteOrder = async (orderId: number, email: string, role: Role): Promise<string> => {
    if (role === 'admin' || role === 'salesman') {
        const repo = await CosmosOrderRepository.getInstance();
        const existingOrder = await repo.getOrderById(orderId);

        if (!existingOrder) throw new Error('This order does not exist.');

        return await repo.deleteOrder(orderId);
    } else {
        throw new UnauthorizedError('credentials_required', {
            message: 'You must be a salesman or admin to delete an order.',
        });
    }
};

export default {
    getOrders,
    getOrderById,
    deleteOrder
};