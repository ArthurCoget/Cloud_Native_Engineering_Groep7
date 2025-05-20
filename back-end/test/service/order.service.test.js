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
const order_service_1 = __importDefault(require("../../service/order.service"));
const order_db_1 = __importDefault(require("../../repository/order.db"));
const order_1 = require("../../model/order");
const customer_1 = require("../../model/customer");
const orderItem_1 = require("../../model/orderItem");
const payment_1 = require("../../model/payment");
const product_1 = require("../../model/product");
const orders = [
    new order_1.Order({
        customer: new customer_1.Customer({
            firstName: 'Alice',
            lastName: 'Johnson',
            email: 'alice.johnson@example.com',
            password: 'securepassword123',
            role: 'admin',
            wishlist: [],
            id: 1,
        }),
        items: [
            new orderItem_1.OrderItem({
                product: new product_1.Product({
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
        payment: new payment_1.Payment({
            amount: 39.98,
            date: new Date(),
            paymentStatus: 'paid',
        }),
    }),
];
let mockOrderDbGetOrders;
let mockOrderDbGetOrderById;
let mockOrderDbDeleteOrder;
beforeEach(() => {
    mockOrderDbGetOrders = jest.fn();
    mockOrderDbGetOrderById = jest.fn();
    mockOrderDbDeleteOrder = jest.fn();
});
afterEach(() => {
    jest.clearAllMocks();
});
test('given orders in the DB, when getting all orders, then all orders are returned', () => __awaiter(void 0, void 0, void 0, function* () {
    order_db_1.default.getOrders = mockOrderDbGetOrders.mockReturnValue(orders);
    const result = yield order_service_1.default.getOrders({ email: 'admin@example.com', role: 'admin' });
    expect(result).toEqual(orders);
    expect(mockOrderDbGetOrders).toHaveBeenCalled();
}));
test('given orders in the DB, when getting customer by id, then customer with id is returned', () => __awaiter(void 0, void 0, void 0, function* () {
    order_db_1.default.getOrderById = mockOrderDbGetOrderById.mockReturnValue(orders[0]);
    const result = yield order_service_1.default.getOrderById(1, 'admin@example.com', 'admin');
    expect(result).toEqual(orders[0]);
    expect(mockOrderDbGetOrderById).toHaveBeenCalledWith({ id: 1 });
}));
test('given order exists in the DB, when deleting order by id, then order is deleted', () => __awaiter(void 0, void 0, void 0, function* () {
    order_db_1.default.getOrderById = mockOrderDbGetOrderById.mockReturnValue(orders[0]);
    order_db_1.default.deleteOrder = mockOrderDbDeleteOrder.mockReturnValue('Order deleted successfully');
    const result = yield order_service_1.default.deleteOrder(1, 'admin@example.com', 'admin');
    expect(result).toBe('Order deleted successfully');
    expect(mockOrderDbGetOrderById).toHaveBeenCalledWith({ id: 1 });
    expect(mockOrderDbDeleteOrder).toHaveBeenCalledWith({ id: 1 });
}));
test('given order does not exist in the DB, when deleting order by id, then error is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
    order_db_1.default.getOrderById = mockOrderDbGetOrderById.mockReturnValue(null);
    const deleteOrder = () => __awaiter(void 0, void 0, void 0, function* () { return yield order_service_1.default.deleteOrder(1, 'admin@example.com', 'admin'); });
    yield expect(deleteOrder()).rejects.toThrow('This order does not exist.');
    expect(mockOrderDbGetOrderById).toHaveBeenCalledWith({ id: 1 });
    expect(mockOrderDbDeleteOrder).not.toHaveBeenCalled();
}));
test('given non-logged-in user, when getting all orders, then UnauthorizedError is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
    const getOrders = () => __awaiter(void 0, void 0, void 0, function* () {
        yield order_service_1.default.getOrders({ email: '', role: '' });
    });
    yield expect(getOrders).rejects.toThrowError('You must be logged in to access orders.');
}));
test('given customer role, when getting an order by ID, then UnauthorizedError is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
    const getOrderById = () => __awaiter(void 0, void 0, void 0, function* () {
        yield order_service_1.default.getOrderById(1, 'customer@example.com', 'customer');
    });
    yield expect(getOrderById).rejects.toThrowError('You must be a salesman,  admin or be logged in as the customer who the order belongs to to access an order by id.');
}));
test('given customer role, when deleting an order, then UnauthorizedError is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
    const deleteOrder = () => __awaiter(void 0, void 0, void 0, function* () {
        yield order_service_1.default.deleteOrder(1, 'customer@example.com', 'customer');
    });
    yield expect(deleteOrder).rejects.toThrowError('You must be a salesman or admin to delete an order.');
}));
