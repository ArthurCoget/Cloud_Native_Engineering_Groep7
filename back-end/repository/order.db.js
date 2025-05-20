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
const order_1 = require("../model/order");
const database_1 = __importDefault(require("./database"));
const getOrders = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ordersPrisma = yield database_1.default.order.findMany({
            include: { customer: true, items: { include: { product: true } }, payment: true },
        });
        return ordersPrisma.map((orderPrisma) => order_1.Order.from(orderPrisma));
    }
    catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
});
const getOrderById = (_a) => __awaiter(void 0, [_a], void 0, function* ({ id }) {
    try {
        const orderPrisma = yield database_1.default.order.findUnique({
            where: { id },
            include: { customer: true, items: { include: { product: true } }, payment: true },
        });
        if (!orderPrisma) {
            return undefined;
        }
        return order_1.Order.from(orderPrisma);
    }
    catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
});
const getOrdersByCustomer = (_a) => __awaiter(void 0, [_a], void 0, function* ({ email }) {
    try {
        const ordersPrisma = yield database_1.default.order.findMany({
            where: {
                customer: {
                    email: email,
                },
            },
            include: { customer: true, items: { include: { product: true } }, payment: true },
        });
        return ordersPrisma.map((order) => order_1.Order.from(order));
    }
    catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
});
const deleteOrder = (_a) => __awaiter(void 0, [_a], void 0, function* ({ id }) {
    try {
        yield database_1.default.$transaction([
            database_1.default.orderItem.deleteMany({
                where: { orderId: id },
            }),
            database_1.default.order.delete({
                where: { id },
            }),
        ]);
        return 'Order has been deleted.';
    }
    catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
});
const createOrder = (order) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield database_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const orderPrisma = yield tx.order.create({
                data: {
                    customer: { connect: { id: order.getCustomer().getId() } },
                    items: {
                        create: order.getItems().map((item) => ({
                            product: { connect: { id: item.getProduct().getId() } },
                            quantity: item.getQuantity(),
                        })),
                    },
                    date: order.getDate(),
                    payment: {
                        create: {
                            amount: order.getPayment().getAmount(),
                            date: order.getDate(),
                            paymentStatus: order.getPayment().getPaymentStatus(),
                        },
                    },
                },
                include: { customer: true, items: { include: { product: true } }, payment: true },
            });
            for (const item of order.getItems()) {
                yield tx.product.update({
                    where: { id: item.getProduct().getId() },
                    data: {
                        stock: {
                            decrement: item.getQuantity(),
                        },
                    },
                });
            }
            return order_1.Order.from(orderPrisma);
        }));
    }
    catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
});
exports.default = {
    getOrders,
    getOrderById,
    getOrdersByCustomer,
    deleteOrder,
    createOrder,
};
