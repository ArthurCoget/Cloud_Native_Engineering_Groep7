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
 *     AuthenticationResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: JWT access token.
 *         email:
 *           type: string
 *           description: User email.
 *         fullname:
 *           type: string
 *           description: Full name.
 *         role:
 *           type: string
 *           description: User role.
 *           enum:
 *             - customer
 *             - salesman
 *             - admin
 *     AuthenticationRequest:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           description: User email.
 *         password:
 *           type: string
 *           description: User password.
 *     Customer:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           format: int64
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *         role:
 *           type: string
 *           description: User role.
 *           enum:
 *             - customer
 *             - salesman
 *             - admin
 *         wishlist:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Product'
 *     CustomerInput:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           format: int64
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *           default: "name@email.be"
 *         password:
 *           type: string
 *           default: "password"
 *         role:
 *           type: string
 *           description: User role.
 *           enum:
 *             - customer
 *             - salesman
 *             - admin
 *         wishlist:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Product'
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
exports.customerRouter = void 0;
const express_1 = require("express");
const customer_service_1 = __importDefault(require("../service/customer.service"));
const customerRouter = (0, express_1.Router)();
exports.customerRouter = customerRouter;
/**
 * @swagger
 * /customers:
 *   get:
 *     security:
 *      - bearerAuth: []
 *     summary: Get all customers
 *     tags: [Customers]
 *     responses:
 *       200:
 *         description: A list of customers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Customer'
 *       500:
 *         description: Internal server error
 */
customerRouter.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const request = req;
        const { email, role } = request.auth;
        const customers = yield customer_service_1.default.getCustomers(email, role);
        res.status(200).json(customers);
    }
    catch (error) {
        next(error);
    }
}));
/**
 * @swagger
 * /customers/{email}:
 *   get:
 *     security:
 *      - bearerAuth: []
 *     summary: Get a customer by email
 *     tags: [Customers]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: Email of the customer to retrieve
 *     responses:
 *       200:
 *         description: Customer details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Internal server error
 */
customerRouter.get('/:email', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const request = req;
        const { email, role } = request.auth;
        const customer = yield customer_service_1.default.getCustomerByEmail(req.params.email, email, role);
        res.status(200).json(customer);
    }
    catch (error) {
        next(error);
    }
}));
/**
 * @swagger
 * /customers/wishlist/{email}:
 *   get:
 *     security:
 *      - bearerAuth: []
 *     summary: Get the wishlist of a customer by email
 *     tags: [Customers]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: Email of the customer
 *     responses:
 *       200:
 *         description: Wishlist details
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       404:
 *         description: Wishlist not found
 *       500:
 *         description: Internal server error
 */
customerRouter.get('/wishlist/:email', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const request = req;
        const { email, role } = request.auth;
        const wishlist = yield customer_service_1.default.getWishlistByEmail(req.params.email, email, role);
        res.status(200).json(wishlist);
    }
    catch (error) {
        next(error);
    }
}));
/**
 * @swagger
 * /customers:
 *   post:
 *     summary: Create a new customer
 *     tags: [Customers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CustomerInput'
 *     responses:
 *       200:
 *         description: Customer successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
customerRouter.post('/signup', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const customer = req.body;
        const result = yield customer_service_1.default.createCustomer(customer);
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
}));
/**
 * @swagger
 * /customers/{email}:
 *   put:
 *     security:
 *      - bearerAuth: []
 *     summary: Update a customer by email
 *     tags: [Customers]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: email of the customer to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CustomerInput'
 *     responses:
 *       200:
 *         description: Customer successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Invalid request data
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Internal server error
 */
customerRouter.put('/:email', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const request = req;
        const { email, role } = request.auth;
        const customer = req.body;
        const result = yield customer_service_1.default.updateCustomer(req.params.email, customer, email, role);
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
}));
/**
 * @swagger
 * /customers/{email}:
 *   delete:
 *     security:
 *      - bearerAuth: []
 *     summary: Delete a customer by email
 *     tags: [Customers]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: email of the customer to delete
 *     responses:
 *       200:
 *         description: Customer successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Customer deleted successfully
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Internal server error
 */
customerRouter.delete('/:email', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const request = req;
        const { email, role } = request.auth;
        const result = yield customer_service_1.default.deleteCustomer(req.params.email, email, role);
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
}));
/**
 * @swagger
 * /customers/addWishlist/{email}/{productId}:
 *   put:
 *     security:
 *      - bearerAuth: []
 *     summary: Add a product to a customer's wishlist
 *     tags: [Customers]
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
 *         description: Id of the product to add to the wishlist
 *     responses:
 *       200:
 *         description: Product successfully added to the wishlist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 */
customerRouter.put('/addWishlist/:email/:productId', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const request = req;
        const { email: authEmail, role } = request.auth;
        const email = req.params.email;
        const productId = Number(req.params.productId);
        const result = yield customer_service_1.default.addProductToWishlist(email, productId, email, role);
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
}));
/**
 * @swagger
 * /customers/removeWishlist/{email}/{productId}:
 *   put:
 *     security:
 *      - bearerAuth: []
 *     summary: Remove a product from a customer's wishlist
 *     tags: [Customers]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: email of the customer
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Id of the product to remove from the wishlist
 *     responses:
 *       200:
 *         description: Product successfully removed from the wishlist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product removed from wishlist"
 */
customerRouter.put('/removeWishlist/:email/:productId', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const request = req;
        const { email: authEmail, role } = request.auth;
        const email = req.params.email;
        const productId = Number(req.params.productId);
        const result = yield customer_service_1.default.removeProductFromWishlist(email, productId, email, role);
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
}));
/**
 * @swagger
 * /customers/login:
 *   post:
 *      summary: Login using email and password. Returns an object with JWT token and user name when succesful.
 *      tags: [Customers]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/AuthenticationRequest'
 *      responses:
 *         200:
 *            description: The information of the user object
 *            content:
 *              application/json:
 *                schema:
 *                  $ref: '#/components/schemas/AuthenticationResponse'
 */
customerRouter.post('/login', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const customerInput = req.body;
        const response = yield customer_service_1.default.authenticate(customerInput);
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
}));
