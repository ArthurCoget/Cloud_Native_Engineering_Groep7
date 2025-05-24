"use strict";
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Customer:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *         recentOrders:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Order'
 *         wishlist:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProductInput'
 *
 *     Payment:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         amount:
 *           type: number
 *           format: float
 *         date:
 *           type: string
 *           format: date-time
 *         paymentStatus:
 *           type: string
 *           example: "Completed"
 *
 *     OrderItemInput:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           format: int64
 *         order:
 *           $ref: '#/components/schemas/Order'
 *         product:
 *           $ref: '#/components/schemas/ProductInput'
 *         quantity:
 *           type: integer
 *
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         customer:
 *           $ref: '#/components/schemas/Customer'
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItemInput'
 *         date:
 *           type: string
 *           format: date-time
 *         payment:
 *           $ref: '#/components/schemas/Payment'
 *         totalAmount:
 *           type: number
 *           format: float
 *
 *     OrderInput:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           format: int64
 *         customer:
 *           $ref: '#/components/schemas/Customer'
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItemInput'
 *         date:
 *           type: string
 *           format: date-time
 *         payment:
 *           $ref: '#/components/schemas/Payment'
 */
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
exports.orderRouter = void 0;
const express_1 = require("express");
const order_service_1 = __importDefault(require("../service/order.service"));
const orderRouter = (0, express_1.Router)();
exports.orderRouter = orderRouter;
/**
 * @swagger
 * /orders:
 *   get:
 *     security:
 *      - bearerAuth: []
 *     summary: Retrieve a list of orders
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: A list of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       500:
 *         description: Internal server error
 */
orderRouter.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, role } = req.auth;
        const orders = yield order_service_1.default.getOrders({ email, role });
        res.status(200).json(orders);
    }
    catch (error) {
        next(error);
    }
}));
/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     security:
 *      - bearerAuth: []
 *     summary: Get order by ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the order to retrieve
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
orderRouter.get('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const request = req;
        const { email, role } = request.auth;
        const orders = yield order_service_1.default.getOrderById(Number(req.params.id), email, role);
        res.status(200).json(orders);
    }
    catch (error) {
        next(error);
    }
}));
/**
 * @swagger
 * /orders/{id}:
 *   delete:
 *     security:
 *      - bearerAuth: []
 *     summary: Delete an order by ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the order to delete
 *     responses:
 *       200:
 *         description: Order successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order deleted successfully
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
orderRouter.delete('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const request = req;
        const { email, role } = request.auth;
        const result = yield order_service_1.default.deleteOrder(Number(req.params.id), email, role);
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
}));
