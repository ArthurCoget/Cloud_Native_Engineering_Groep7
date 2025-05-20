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
exports.discountCodeRouter = void 0;
const express_1 = require("express");
const discountCode_service_1 = __importDefault(require("../service/discountCode.service"));
const discountCodeRouter = (0, express_1.Router)();
exports.discountCodeRouter = discountCodeRouter;
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
discountCodeRouter.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const request = req;
        const { email, role } = request.auth;
        const discountCodes = yield discountCode_service_1.default.getDiscountCodes(email, role);
        res.status(200).json(discountCodes);
    }
    catch (error) {
        next(error);
    }
}));
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
discountCodeRouter.get('/:code', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const request = req;
        const { email, role } = request.auth;
        const discountCode = yield discountCode_service_1.default.getDiscountCodeByCode(req.params.code, email, role);
        res.status(200).json(discountCode);
    }
    catch (error) {
        next(error);
    }
}));
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
discountCodeRouter.post('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const request = req;
        const { email, role } = request.auth;
        const discountCodeInput = req.body;
        const discountCodeOutput = yield discountCode_service_1.default.createDiscountCode(discountCodeInput, email, role);
        res.status(200).json(discountCodeOutput);
    }
    catch (error) {
        next(error);
    }
}));
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
discountCodeRouter.put('/:code', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const request = req;
        const { email, role } = request.auth;
        const discountCodeInput = req.body;
        const discountCodeOutput = yield discountCode_service_1.default.updateDiscountCode(req.params.code, discountCodeInput, email, role);
        res.status(200).json(discountCodeOutput);
    }
    catch (error) {
        next(error);
    }
}));
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
discountCodeRouter.delete('/:code', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const request = req;
        const { email, role } = request.auth;
        const result = yield discountCode_service_1.default.deleteDiscountCode(req.params.code, email, role);
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
}));
