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
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           format: int64
 *         name:
 *           type: string
 *         price:
 *           type: number
 *           format: float
 *         stock:
 *           type: integer
 *           format: int32
 *         category:
 *           type: array
 *           items:
 *             type: string
 *         description:
 *           type: string
 *         images:
 *           type: string
 *         sizes:
 *           type: array
 *           items:
 *             type: string
 *         colors:
 *           type: array
 *           items:
 *             type: string
 *         rating:
 *           type: array
 *           items:
 *             type: integer
 *             format: int64
 *
 *     ProductInput:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           format: int64
 *         name:
 *           type: string
 *         price:
 *           type: number
 *           format: float
 *         stock:
 *           type: integer
 *           format: int32
 *         category:
 *           type: array
 *           items:
 *             type: string
 *         description:
 *           type: string
 *         images:
 *           type: string
 *         sizes:
 *           type: array
 *           items:
 *             type: string
 *         colors:
 *           type: array
 *           items:
 *             type: string
 *         rating:
 *           type: array
 *           items:
 *             type: integer
 *             format: int64
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
exports.productRouter = void 0;
const express_1 = require("express");
const product_service_1 = __importDefault(require("../service/product.service"));
const productRouter = (0, express_1.Router)();
exports.productRouter = productRouter;
/**
 * @swagger
 * /products:
 *   post:
 *     security:
 *      - bearerAuth: []
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       200:
 *         description: The product was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
productRouter.post('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const request = req;
        const { email, role } = request.auth;
        const product = req.body;
        const result = yield product_service_1.default.createProduct(product, email, role);
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
}));
/**
 * @swagger
 * /products:
 *   get:
 *     security:
 *      - bearerAuth: []
 *     summary: Retrieve a list of products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: A list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Internal server error
 */
productRouter.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield product_service_1.default.getProducts();
        res.status(200).json(products);
    }
    catch (error) {
        next(error);
    }
}));
/**
 * @swagger
 * /products/{id}:
 *   get:
 *     security:
 *      - bearerAuth: []
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the product to retrieve
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
productRouter.get('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield product_service_1.default.getProductById(Number(req.params.id));
        res.status(200).json(product);
    }
    catch (error) {
        next(error);
    }
}));
/**
 * @swagger
 * /products/{id}:
 *   put:
 *     security:
 *      - bearerAuth: []
 *     summary: Update a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the product to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       200:
 *         description: Product successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid request data
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
productRouter.put('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const request = req;
        const { email, role } = request.auth;
        const productId = Number(req.params.id);
        const productData = req.body;
        const result = yield product_service_1.default.updateProduct(productId, productData, email, role);
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
}));
/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     security:
 *      - bearerAuth: []
 *     summary: Delete a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the product to delete
 *     responses:
 *       200:
 *         description: Product successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product deleted successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
productRouter.delete('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const request = req;
        const { email, role } = request.auth;
        const result = yield product_service_1.default.deleteProduct(Number(req.params.id), email, role);
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
}));
/**
 * @swagger
 * /products/{id}/rating:
 *   post:
 *     security:
 *      - bearerAuth: []
 *     summary: Add a rating to a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the product to rate
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 description: Rating value between 1 and 5
 *     responses:
 *       200:
 *         description: Rating added successfully
 *       400:
 *         description: Invalid rating value
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
productRouter.post('/:id/rating', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const request = req;
        const { email, role } = request.auth;
        const productId = Number(req.params.id);
        const { rating, comment } = req.body;
        const result = yield product_service_1.default.addReviewToProduct(productId, rating, comment, email, role);
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
}));
