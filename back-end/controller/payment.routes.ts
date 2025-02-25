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

import { Router, Request, Response, NextFunction } from 'express';
import paymentService from '../service/payment.service';
import { PaymentInput, Role } from '../types';

const paymentRouter = Router();

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

paymentRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const request = req as Request & { auth: { email: string; role: Role } };
        const { email, role } = request.auth;
        const payments = await paymentService.getPayments(email, role);
        res.status(200).json(payments);
    } catch (error) {
        next(error);
    }
});

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

paymentRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const request = req as Request & { auth: { email: string; role: Role } };
        const { email, role } = request.auth;
        const order = await paymentService.getPaymentById(Number(req.params.id), email, role);
        res.status(200).json(order);
    } catch (error) {
        next(error);
    }
});

export { paymentRouter };
