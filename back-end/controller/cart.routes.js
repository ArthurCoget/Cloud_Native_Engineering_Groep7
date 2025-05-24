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
 *     CartItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           format: int64
 *         product:
 *           $ref: '#/components/schemas/Product'
 *         quantity:
 *           type: integer
 *           description: Quantity of the product in the cart
 *
 *     Cart:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         customer:
 *           $ref: '#/components/schemas/Customer'
 *         products:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CartItem'
 *
 *     CartInput:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           format: int64
 *         customer:
 *           $ref: '#/components/schemas/Customer'
 *         products:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CartItem'
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
exports.cartRouter = void 0;
const express_1 = require("express");
const cart_service_1 = __importDefault(require("../service/cart.service"));
const cartRouter = (0, express_1.Router)();
exports.cartRouter = cartRouter;
/**
 * @swagger
 * /carts:
 *   get:
 *     security:
 *      - bearerAuth: []
 *     summary: Retrieve a list of carts
 *     tags: [Carts]
 *     responses:
 *       200:
 *         description: A list of carts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cart'
 *       500:
 *         description: Internal server error
 */
cartRouter.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const request = req;
        const { email, role } = request.auth;
        const carts = yield cart_service_1.default.getCarts(email, role);
        res.status(200).json(carts);
    }
    catch (error) {
        next(error);
    }
}));
/**
 * @swagger
 * /carts/{id}:
 *   get:
 *     security:
 *      - bearerAuth: []
 *     summary: Get a cart by ID
 *     tags: [Carts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the cart to retrieve
 *     responses:
 *       200:
 *         description: Cart details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       404:
 *         description: Cart not found
 *       500:
 *         description: Internal server error
 */
cartRouter.get('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const request = req;
        const { email, role } = request.auth;
        const cart = yield cart_service_1.default.getCartById(Number(req.params.id), email, role);
        res.status(200).json(cart);
    }
    catch (error) {
        next(error);
    }
}));
/**
 * @swagger
 * /carts/email/{email}:
 *   get:
 *     security:
 *      - bearerAuth: []
 *     summary: Get a cart by email
 *     tags: [Carts]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: Email belonging to the user whose cart must be retrieved
 *     responses:
 *       200:
 *         description: Cart details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       404:
 *         description: Cart not found
 *       500:
 *         description: Internal server error
 */
cartRouter.get('/email/:email', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const request = req;
        const { email, role } = request.auth;
        const cart = yield cart_service_1.default.getCartByEmail(req.params.email, email, role);
        res.status(200).json(cart);
    }
    catch (error) {
        next(error);
    }
}));
/**
 * @swagger
 * /carts/addItems/{email}/{productId}/{quantity}:
 *   put:
 *     security:
 *      - bearerAuth: []
 *     summary: Add an item to the cart or increase its quantity
 *     tags: [Carts]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: Email of the customer
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the product
 *       - in: path
 *         name: quantity
 *         required: true
 *         schema:
 *           type: integer
 *         description: Quantity of the product to add to the cart
 *     responses:
 *       200:
 *         description: Cart item successfully added or updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartItem'
 */
cartRouter.put('/addItems/:email/:productId/:quantity', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, productId, quantity } = req.params;
        const request = req;
        const { email: authEmail, role } = request.auth;
        const result = yield cart_service_1.default.addCartItem(email, Number(productId), Number(quantity), authEmail, role);
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
}));
/**
 * @swagger
 * /carts/removeItems/{email}/{productId}/{quantity}:
 *   put:
 *     security:
 *      - bearerAuth: []
 *     summary: Remove an item or decrease its quantity in the cart
 *     tags: [Carts]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: Email of the customer
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the product to remove
 *       - in: path
 *         name: quantity
 *         required: true
 *         schema:
 *           type: integer
 *         description: Quantity of the product to remove from the cart
 *     responses:
 *       200:
 *         description: Cart item successfully removed or quantity decreased
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: string
 *                   example: "Item removed from cart."
 *                 - $ref: '#/components/schemas/CartItem'
 */
cartRouter.put('/removeItems/:email/:productId/:quantity', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, productId, quantity } = req.params;
        const request = req;
        const { email: authEmail, role } = request.auth;
        const result = yield cart_service_1.default.removeCartItem(email, Number(productId), Number(quantity), authEmail, role);
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
}));
/**
 * @swagger
 * /carts/addDiscountCode:
 *   put:
 *     security:
 *      - bearerAuth: []
 *     summary: Apply a discount code to the cart using the customer's email
 *     tags: [Carts]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: Email of the customer
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Discount code to apply
 *     responses:
 *       200:
 *         description: Discount code successfully applied to the cart
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DiscountCode'
 */
cartRouter.put('/addDiscountCode/:email/:code', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, code } = req.params;
        const request = req;
        const { email: authEmail, role } = request.auth;
        const discountCode = yield cart_service_1.default.addDiscountCode(email, code, authEmail, role);
        res.status(200).json(discountCode);
    }
    catch (error) {
        next(error);
    }
}));
/**
 * @swagger
 * /carts/removeDiscountCode:
 *   put:
 *     security:
 *      - bearerAuth: []
 *     summary: Remove a discount code from the cart using the customer's email
 *     tags: [Carts]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: Email of the customer
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Discount code to remove
 *     responses:
 *       200:
 *         description: Discount code successfully removed from the cart
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "That discount code has been removed from your cart."
 */
cartRouter.put('/removeDiscountCode/:email/:code', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, code } = req.params;
        const request = req;
        const { email: authEmail, role } = request.auth;
        const message = yield cart_service_1.default.removeDiscountCode(email, code, authEmail, role);
        res.status(200).json(message);
    }
    catch (error) {
        next(error);
    }
}));
/**
 * @swagger
 * /carts/convertToOrder/{email}:
 *   post:
 *     security:
 *      - bearerAuth: []
 *     summary: Convert a cart to an order
 *     tags: [Carts]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: Email of the customer
 *       - in: query
 *         name: paymentStatus
 *         required: true
 *         schema:
 *           type: string
 *           enum: [paid, unpaid]
 *         description: Payment status of the order
 *     responses:
 *       200:
 *         description: Order successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid request data
 *       404:
 *         description: Cart not found
 *       500:
 *         description: Internal server error
 */
cartRouter.post('/convertToOrder/:email', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.params;
        const { paymentStatus } = req.query;
        const request = req;
        const { email: authEmail, role } = request.auth;
        const order = yield cart_service_1.default.convertCartToOrder(email, paymentStatus, authEmail, role);
        res.status(200).json(order);
    }
    catch (error) {
        next(error);
    }
}));
