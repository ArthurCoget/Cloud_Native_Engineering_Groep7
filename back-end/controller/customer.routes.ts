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

import { NextFunction, Request, Response, Router } from 'express';
import customerService from '../src/service/customer.service';
import { CustomerInput, Role } from '../src/types';

const customerRouter = Router();

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

customerRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const request = req as Request & { auth: { email: string; role: Role } };
        const { email, role } = request.auth;
        const customers = await customerService.getCustomers(email, role);
        res.status(200).json(customers);
    } catch (error) {
        next(error);
    }
});

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

customerRouter.get('/:email', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const request = req as Request & { auth: { email: string; role: Role } };
        const { email, role } = request.auth;
        const customer = await customerService.getCustomerByEmail(req.params.email, email, role);
        res.status(200).json(customer);
    } catch (error) {
        next(error);
    }
});

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

customerRouter.get('/wishlist/:email', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const request = req as Request & { auth: { email: string; role: Role } };
        const { email, role } = request.auth;
        const wishlist = await customerService.getWishlistByEmail(req.params.email, email, role);
        res.status(200).json(wishlist);
    } catch (error) {
        next(error);
    }
});
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

customerRouter.post('/signup', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const customer = <CustomerInput>req.body;
        const result = await customerService.createCustomer(customer);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});

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

customerRouter.put('/:email', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const request = req as Request & { auth: { email: string; role: Role } };
        const { email, role } = request.auth;
        const customer = <CustomerInput>req.body;
        const result = await customerService.updateCustomer(
            req.params.email,
            customer,
            email,
            role
        );
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});

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

customerRouter.delete('/:email', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const request = req as Request & { auth: { email: string; role: Role } };
        const { email, role } = request.auth;
        const result = await customerService.deleteCustomer(req.params.email, email, role);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});

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

customerRouter.put(
    '/addWishlist/:email/:productId',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const request = req as Request & { auth: { email: string; role: Role } };
            const { email: authEmail, role } = request.auth;
            const email = req.params.email;
            const productId = Number(req.params.productId);
            const result = await customerService.addProductToWishlist(
                email,
                productId,
                email,
                role
            );
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
);

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

customerRouter.put(
    '/removeWishlist/:email/:productId',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const request = req as Request & { auth: { email: string; role: Role } };
            const { email: authEmail, role } = request.auth;
            const email = req.params.email;
            const productId = Number(req.params.productId);
            const result = await customerService.removeProductFromWishlist(
                email,
                productId,
                email,
                role
            );
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
);

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
customerRouter.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const customerInput = <CustomerInput>req.body;
        const response = await customerService.authenticate(customerInput);
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
});

export { customerRouter };
