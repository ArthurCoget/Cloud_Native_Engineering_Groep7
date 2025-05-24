import orderService from '../../src/service/order.service';
import orderDb from '../../src/repository/order.db';
import { Order } from '../../src/model/order';
import { Customer } from '../../src/model/customer';
import { OrderItem } from '../../src/model/orderItem';
import { Payment } from '../../src/model/payment';
import { Product } from '../../src/model/product';

const orders: Order[] = [
    new Order({
        customer: new Customer({
            firstName: 'Alice',
            lastName: 'Johnson',
            email: 'alice.johnson@example.com',
            password: 'securepassword123',
            role: 'admin',
            wishlist: [],
            id: 1,
        }),
        items: [
            new OrderItem({
                product: new Product({
                    id: 1,
                    name: 'Classic T-Shirt',
                    price: 19.99,
                    stock: 200,
                    categories: ['Clothing', 'Men'],
                    description: 'Comfortable cotton T-Shirt.',
                    images: 'shirt',
                    sizes: ['S', 'M', 'L', 'XL'],
                    colors: ['Red', 'Blue', 'Black'],
                    rating: [1, 3, 5],
                }),
                quantity: 2,
            }),
        ],
        date: new Date(),
        payment: new Payment({
            amount: 39.98,
            date: new Date(),
            paymentStatus: 'paid',
        }),
    }),
];

let mockOrderDbGetOrders: jest.Mock;
let mockOrderDbGetOrderById: jest.Mock;
let mockOrderDbDeleteOrder: jest.Mock;

beforeEach(() => {
    mockOrderDbGetOrders = jest.fn();
    mockOrderDbGetOrderById = jest.fn();
    mockOrderDbDeleteOrder = jest.fn();
});

afterEach(() => {
    jest.clearAllMocks();
});

test('given orders in the DB, when getting all orders, then all orders are returned', async () => {
    orderDb.getOrders = mockOrderDbGetOrders.mockReturnValue(orders);

    const result = await orderService.getOrders({ email: 'admin@example.com', role: 'admin' });

    expect(result).toEqual(orders);
    expect(mockOrderDbGetOrders).toHaveBeenCalled();
});

test('given orders in the DB, when getting customer by id, then customer with id is returned', async () => {
    orderDb.getOrderById = mockOrderDbGetOrderById.mockReturnValue(orders[0]);

    const result = await orderService.getOrderById(1, 'admin@example.com', 'admin');

    expect(result).toEqual(orders[0]);
    expect(mockOrderDbGetOrderById).toHaveBeenCalledWith({ id: 1 });
});

test('given order exists in the DB, when deleting order by id, then order is deleted', async () => {
    orderDb.getOrderById = mockOrderDbGetOrderById.mockReturnValue(orders[0]);
    orderDb.deleteOrder = mockOrderDbDeleteOrder.mockReturnValue('Order deleted successfully');

    const result = await orderService.deleteOrder(1, 'admin@example.com', 'admin');

    expect(result).toBe('Order deleted successfully');
    expect(mockOrderDbGetOrderById).toHaveBeenCalledWith({ id: 1 });
    expect(mockOrderDbDeleteOrder).toHaveBeenCalledWith({ id: 1 });
});

test('given order does not exist in the DB, when deleting order by id, then error is thrown', async () => {
    orderDb.getOrderById = mockOrderDbGetOrderById.mockReturnValue(null);

    const deleteOrder = async () => await orderService.deleteOrder(1, 'admin@example.com', 'admin');

    await expect(deleteOrder()).rejects.toThrow('This order does not exist.');
    expect(mockOrderDbGetOrderById).toHaveBeenCalledWith({ id: 1 });
    expect(mockOrderDbDeleteOrder).not.toHaveBeenCalled();
});

test('given non-logged-in user, when getting all orders, then UnauthorizedError is thrown', async () => {
    const getOrders = async () => {
        await orderService.getOrders({ email: '', role: '' });
    };

    await expect(getOrders).rejects.toThrowError('You must be logged in to access orders.');
});

test('given customer role, when getting an order by ID, then UnauthorizedError is thrown', async () => {
    const getOrderById = async () => {
        await orderService.getOrderById(1, 'customer@example.com', 'customer');
    };

    await expect(getOrderById).rejects.toThrowError(
        'You must be a salesman,  admin or be logged in as the customer who the order belongs to to access an order by id.'
    );
});

test('given customer role, when deleting an order, then UnauthorizedError is thrown', async () => {
    const deleteOrder = async () => {
        await orderService.deleteOrder(1, 'customer@example.com', 'customer');
    };

    await expect(deleteOrder).rejects.toThrowError(
        'You must be a salesman or admin to delete an order.'
    );
});
