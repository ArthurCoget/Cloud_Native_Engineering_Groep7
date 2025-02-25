import paymentService from '../../service/payment.service';
import orderDb from '../../repository/order.db';
import paymentDb from '../../repository/payment.db';
import { PaymentInput } from '../../types';
import { Payment } from '../../model/payment';

let mockOrderDbGetOrderById: jest.Mock;
let mockPaymentDbGetPayments: jest.Mock;
let mockPaymentDbGetPaymentById: jest.Mock;
let mockPaymentDbAddPayment: jest.Mock;

beforeEach(() => {
    mockOrderDbGetOrderById = jest.fn();
    mockPaymentDbGetPayments = jest.fn();
    mockPaymentDbGetPaymentById = jest.fn();
    mockPaymentDbAddPayment = jest.fn();

    orderDb.getOrderById = mockOrderDbGetOrderById;
    paymentDb.getPayments = mockPaymentDbGetPayments;
    paymentDb.getPaymentById = mockPaymentDbGetPaymentById;
    paymentDb.addPayment = mockPaymentDbAddPayment;
});

afterEach(() => {
    jest.clearAllMocks();
});

test('given valid payments in DB, when getting all payments, then all payments are returned', async () => {
    const payments = [
        new Payment({ amount: 100, date: new Date(), paymentStatus: 'paid', id: 1 }),
        new Payment({ amount: 200, date: new Date(), paymentStatus: 'paid', id: 2 }),
    ];

    mockPaymentDbGetPayments.mockResolvedValue(payments);

    const result = await paymentService.getPayments('admin@example.com', 'admin');

    expect(result).toEqual(payments);
    expect(mockPaymentDbGetPayments).toHaveBeenCalled();
});

test('given a valid payment id, when getting payment by id, then the payment is returned', async () => {
    const payment = new Payment({ amount: 100, date: new Date(), paymentStatus: 'paid', id: 1 });

    mockPaymentDbGetPaymentById.mockResolvedValue(payment);

    const result = await paymentService.getPaymentById(1, 'admin@example.com', 'admin');

    expect(result).toEqual(payment);
    expect(mockPaymentDbGetPaymentById).toHaveBeenCalledWith({ id: 1 });
});

test('given a non-existent payment id, when getting payment by id, then an error is thrown', async () => {
    mockPaymentDbGetPaymentById.mockResolvedValue(null);

    await expect(paymentService.getPaymentById(1, 'admin@example.com', 'admin')).rejects.toThrow(
        'Payment with id 1 does not exist.'
    );
    expect(mockPaymentDbGetPaymentById).toHaveBeenCalledWith({ id: 1 });
});

test('given non-salesman and non-admin role, when getting all payments, then UnauthorizedError is thrown', async () => {
    const getPayments = async () => {
        await paymentService.getPayments('user@example.com', 'customer');
    };

    await expect(getPayments).rejects.toThrowError(
        'You must be a salesman or admin to access all payments.'
    );
});

test('given non-salesman and non-admin role, when getting a payment by id, then UnauthorizedError is thrown', async () => {
    const getPaymentById = async () => {
        await paymentService.getPaymentById(1, 'user@example.com', 'customer');
    };

    await expect(getPaymentById).rejects.toThrowError(
        'You must be a salesman or admin to access a payment by id.'
    );
});
