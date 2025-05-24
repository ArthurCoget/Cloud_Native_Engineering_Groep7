import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import cartService from '../service/cart.service';
import { Role } from '../types';
import { verifyJwt, JwtPayload } from '../util/jwt'; // adjust path as needed

const httpTrigger: AzureFunction = async function (
    context: Context,
    req: HttpRequest
): Promise<void> {
    context.log('Processing request...');

    try {
        // Extract Bearer token from Authorization header
        const authHeader = req.headers['authorization'] || req.headers['Authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            context.res = {
                status: 401,
                body: 'Missing or invalid Authorization header',
            };
            return;
        }

        const token = authHeader.substring('Bearer '.length);

        // Verify and decode token
        const payload: JwtPayload | null = verifyJwt(token);
        if (!payload) {
            context.res = {
                status: 401,
                body: 'Invalid or expired token',
            };
            return;
        }

        const { email, role } = payload;
        if (!email || !role) {
            context.res = {
                status: 401,
                body: 'Token payload missing required claims',
            };
            return;
        }

        // Now call your cartService method with email and role
        const carts = await cartService.getCarts(email, role);

        context.res = {
            status: 200,
            body: carts,
        };
    } catch (error) {
        context.log.error('Error in function:', error);
        context.res = {
            status: 500,
            body: 'Internal Server Error',
        };
    }
};

export default httpTrigger;
