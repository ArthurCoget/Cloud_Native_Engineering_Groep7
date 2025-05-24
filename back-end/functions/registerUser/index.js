"use strict";
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
exports.createCustomer = void 0;
const functions_1 = require("@azure/functions");
const customer_service_1 = __importDefault(require("../../service/customer.service"));
function createCustomer(request, context) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Parse the request body as CustomerInput
            const customerData = (yield request.json());
            // Basic validation for required fields
            if (!customerData ||
                !customerData.firstName ||
                !customerData.lastName ||
                !customerData.email ||
                !customerData.password) {
                return {
                    status: 400,
                    body: 'Missing required fields: firstName, lastName, email, password',
                };
            }
            // Call the service to create the customer
            const result = yield customer_service_1.default.createCustomer(customerData);
            // Return success response
            return {
                status: 200,
                jsonBody: result,
            };
        }
        catch (error) {
            // Log the error for debugging
            context.error('Error creating customer:', error);
            // Handle specific error cases (e.g., customer already exists)
            if (error.message.includes('already exists')) {
                return {
                    status: 400,
                    body: error.message,
                };
            }
            else {
                return {
                    status: 500,
                    body: 'Internal server error',
                };
            }
        }
    });
}
exports.createCustomer = createCustomer;
// Register the HTTP function with Azure Functions
functions_1.app.http('createCustomer', {
    methods: ['POST'],
    route: 'customers',
    authLevel: 'anonymous',
    handler: createCustomer,
});
