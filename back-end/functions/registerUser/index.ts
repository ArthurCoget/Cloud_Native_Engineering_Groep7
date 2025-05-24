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

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { CustomerInput } from '../../types';
import customerService from '../../service/customer.service';

export async function createCustomer(
    request: HttpRequest,
    context: InvocationContext
): Promise<HttpResponseInit> {
    try {
        // Parse the request body as CustomerInput
        const customerData = (await request.json()) as CustomerInput;

        // Basic validation for required fields
        if (
            !customerData ||
            !customerData.firstName ||
            !customerData.lastName ||
            !customerData.email ||
            !customerData.password
        ) {
            return {
                status: 400,
                body: 'Missing required fields: firstName, lastName, email, password',
            };
        }

        // Call the service to create the customer
        const result = await customerService.createCustomer(customerData);

        // Return success response
        return {
            status: 200,
            jsonBody: result,
        };
    } catch (error: any) {
        // Log the error for debugging
        context.error('Error creating customer:', error);

        // Handle specific error cases (e.g., customer already exists)
        if (error.message.includes('already exists')) {
            return {
                status: 400,
                body: error.message,
            };
        } else {
            return {
                status: 500,
                body: 'Internal server error',
            };
        }
    }
}

// Register the HTTP function with Azure Functions
app.http('createCustomer', {
    methods: ['POST'],
    route: 'customers',
    authLevel: 'anonymous',
    handler: createCustomer,
});
