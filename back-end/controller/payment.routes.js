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
 *     Payment:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           format: int64
 *         amount:
 *           type: number
 *           format: float
 *         date:
 *           type: string
 *           format: date-time
 *         paymentStatus:
 *           type: string
 *           enum: [paid, unpaid]
 *
 *     PaymentInput:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           format: int64
 *         amount:
 *           type: number
 *           format: float
 *         date:
 *           type: string
 *           format: date-time
 *         paymentStatus:
 *           type: string
 *           enum: [paid, unpaid]
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
exports.paymentRouter = void 0;
const express_1 = require("express");
const payment_service_1 = __importDefault(require("../service/payment.service"));
const paymentRouter = (0, express_1.Router)();
exports.paymentRouter = paymentRouter;
/**
 * @swagger
 * /payments:
 *   get:
 *     security:
 *      - bearerAuth: []
 *     summary: Retrieve a list of all payments
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: List of payments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Payment'
 *       500:
 *         description: Internal server error
 */
paymentRouter.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const request = req;
        const { email, role } = request.auth;
        const payments = yield payment_service_1.default.getPayments(email, role);
        res.status(200).json(payments);
    }
    catch (error) {
        next(error);
    }
}));
/**
 * @swagger
 * /payments/{id}:
 *   get:
 *     security:
 *      - bearerAuth: []
 *     summary: Get payment details by ID
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the payment to retrieve
 *     responses:
 *       200:
 *         description: Payment details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Payment'
 *       404:
 *         description: Payment not found
 *       500:
 *         description: Internal server error
 */
paymentRouter.get('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const request = req;
        const { email, role } = request.auth;
        const order = yield payment_service_1.default.getPaymentById(Number(req.params.id), email, role);
        res.status(200).json(order);
    }
    catch (error) {
        next(error);
    }
}));
