"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const payment_service_1 = __importDefault(require("../../service/payment.service"));
const order_db_1 = __importDefault(require("../../repository/order.db"));
const payment_db_1 = __importDefault(require("../../repository/payment.db"));
const payment_1 = require("../../model/payment");
let mockOrderDbGetOrderById;
let mockPaymentDbGetPayments;
let mockPaymentDbGetPaymentById;
let mockPaymentDbAddPayment;
beforeEach(() => {
    mockOrderDbGetOrderById = jest.fn();
    mockPaymentDbGetPayments = jest.fn();
    mockPaymentDbGetPaymentById = jest.fn();
    mockPaymentDbAddPayment = jest.fn();
    order_db_1.default.getOrderById = mockOrderDbGetOrderById;
    payment_db_1.default.getPayments = mockPaymentDbGetPayments;
    payment_db_1.default.getPaymentById = mockPaymentDbGetPaymentById;
    payment_db_1.default.addPayment = mockPaymentDbAddPayment;
});
afterEach(() => {
    jest.clearAllMocks();
});
test('given valid payments in DB, when getting all payments, then all payments are returned', () => __awaiter(void 0, void 0, void 0, function* () {
    const payments = [
        new payment_1.Payment({ amount: 100, date: new Date(), paymentStatus: 'paid', id: 1 }),
        new payment_1.Payment({ amount: 200, date: new Date(), paymentStatus: 'paid', id: 2 }),
    ];
    mockPaymentDbGetPayments.mockResolvedValue(payments);
    const result = yield payment_service_1.default.getPayments('admin@example.com', 'admin');
    expect(result).toEqual(payments);
    expect(mockPaymentDbGetPayments).toHaveBeenCalled();
}));
test('given a valid payment id, when getting payment by id, then the payment is returned', () => __awaiter(void 0, void 0, void 0, function* () {
    const payment = new payment_1.Payment({ amount: 100, date: new Date(), paymentStatus: 'paid', id: 1 });
    mockPaymentDbGetPaymentById.mockResolvedValue(payment);
    const result = yield payment_service_1.default.getPaymentById(1, 'admin@example.com', 'admin');
    expect(result).toEqual(payment);
    expect(mockPaymentDbGetPaymentById).toHaveBeenCalledWith({ id: 1 });
}));
test('given a non-existent payment id, when getting payment by id, then an error is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
    mockPaymentDbGetPaymentById.mockResolvedValue(null);
    yield expect(payment_service_1.default.getPaymentById(1, 'admin@example.com', 'admin')).rejects.toThrow('Payment with id 1 does not exist.');
    expect(mockPaymentDbGetPaymentById).toHaveBeenCalledWith({ id: 1 });
}));
test('given non-salesman and non-admin role, when getting all payments, then UnauthorizedError is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
    const getPayments = () => __awaiter(void 0, void 0, void 0, function* () {
        yield payment_service_1.default.getPayments('user@example.com', 'customer');
    });
    yield expect(getPayments).rejects.toThrowError('You must be a salesman or admin to access all payments.');
}));
test('given non-salesman and non-admin role, when getting a payment by id, then UnauthorizedError is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
    const getPaymentById = () => __awaiter(void 0, void 0, void 0, function* () {
        yield payment_service_1.default.getPaymentById(1, 'user@example.com', 'customer');
    });
    yield expect(getPaymentById).rejects.toThrowError('You must be a salesman or admin to access a payment by id.');
}));
