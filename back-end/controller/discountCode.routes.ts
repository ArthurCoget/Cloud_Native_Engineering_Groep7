/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     DiscountCode:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           format: int64
 *           description: The unique identifier for the discount code
 *         code:
 *           type: string
 *           description: The discount code that the customer will use
 *         type:
 *           type: string
 *           description: The type of discount. Can be either 'fixed' or 'percentage'.
 *         value:
 *           type: integer
 *           description: The value of the discount (either fixed amount or percentage).
 *         expirationDate:
 *           type: string
 *           format: date-time
 *           description: The expiration date of the discount code.
 *         isActive:
 *           type: boolean
 *           description: Indicates whether the discount code is active.
 *     DiscountCodeInput:
 *       type: object
 *       required:
 *         - code
 *         - type
 *         - value
 *         - expirationDate
 *         - isActive
 *       properties:
 *         code:
 *           type: string
 *           description: The discount code that the customer will use
 *         type:
 *           type: string
 *           description: The type of discount. Can be either 'fixed' or 'percentage'.
 *         value:
 *           type: integer
 *           description: The value of the discount (either fixed amount or percentage).
 *         expirationDate:
 *           type: string
 *           format: date-time
 *           description: The expiration date of the discount code.
 *         isActive:
 *           type: boolean
 *           description: Indicates whether the discount code is active.
 */

import { NextFunction, Request, Response, Router } from 'express';
import { DiscountCodeInput, Role } from '../src/types';
import discountCodeService from '../src/service/discountCode.service';

const discountCodeRouter = Router();

/**
 * @swagger
 * /discounts:
 *   get:
 *     security:
 *      - bearerAuth: []
 *     summary: Get all discount codes
 *     tags: [Discounts]
 *     responses:
 *       200:
 *         description: A list of discounts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DiscountCode'
 */

discountCodeRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const request = req as Request & { auth: { email: string; role: Role } };
        const { email, role } = request.auth;
        const discountCodes = await discountCodeService.getDiscountCodes(email, role);
        res.status(200).json(discountCodes);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /discounts/{code}:
 *   get:
 *     security:
 *      - bearerAuth: []
 *     summary: Get a discount by code
 *     tags: [Discounts]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Code of the discount to retrieve
 *     responses:
 *       200:
 *         description: Discount details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DiscountCode'
 */

discountCodeRouter.get('/:code', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const request = req as Request & { auth: { email: string; role: Role } };
        const { email, role } = request.auth;
        const discountCode = await discountCodeService.getDiscountCodeByCode(
            req.params.code,
            email,
            role
        );
        res.status(200).json(discountCode);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /discounts:
 *   post:
 *     security:
 *      - bearerAuth: []
 *     summary: Create a new discount code
 *     tags: [Discounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DiscountCodeInput'
 *     responses:
 *       200:
 *         description: Discount code successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DiscountCode'
 */

discountCodeRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const request = req as Request & { auth: { email: string; role: Role } };
        const { email, role } = request.auth;
        const discountCodeInput = <DiscountCodeInput>req.body;
        const discountCodeOutput = await discountCodeService.createDiscountCode(
            discountCodeInput,
            email,
            role
        );
        res.status(200).json(discountCodeOutput);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /discounts/{code}:
 *   put:
 *     security:
 *      - bearerAuth: []
 *     summary: Update a discount code by code
 *     tags: [Discounts]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Code of the discount to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DiscountCodeInput'
 *     responses:
 *       200:
 *         description: Discount code successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DiscountCode'
 */

discountCodeRouter.put('/:code', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const request = req as Request & { auth: { email: string; role: Role } };
        const { email, role } = request.auth;
        const discountCodeInput = <DiscountCodeInput>req.body;
        const discountCodeOutput = await discountCodeService.updateDiscountCode(
            req.params.code,
            discountCodeInput,
            email,
            role
        );
        res.status(200).json(discountCodeOutput);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /discounts/{code}:
 *   delete:
 *     security:
 *      - bearerAuth: []
 *     summary: Delete a discount code by code
 *     tags: [Discounts]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Code of the discount to delete
 *     responses:
 *       200:
 *         description: Discount code successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: DiscountCode has been deleted.
 */

discountCodeRouter.delete('/:code', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const request = req as Request & { auth: { email: string; role: Role } };
        const { email, role } = request.auth;
        const result = await discountCodeService.deleteDiscountCode(req.params.code, email, role);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});

export { discountCodeRouter };
