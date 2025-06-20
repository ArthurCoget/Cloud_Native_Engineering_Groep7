"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticatedRouteWrapper = authenticatedRouteWrapper;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function verifyToken(token) {
    try {
        const secret = process.env.JWT_SECRET || 'your-secret-key';
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        return decoded;
    }
    catch (error) {
        throw new Error('Invalid token');
    }
}
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
async function authenticatedRouteWrapper(handler, req, context) {
    try {
        if (!req) {
            return {
                status: 401,
                body: 'Missing request object',
                headers: corsHeaders,
            };
        }
        const authHeader = req.headers.get('authorization') || '';
        const token = authHeader.split(' ')[1];
        if (!token) {
            return {
                status: 401,
                body: 'Unauthorized: Missing token',
                headers: corsHeaders,
            };
        }
        const { email: authEmail, role } = verifyToken(token);
        const response = await handler(authEmail, role);
        // Add CORS headers to the actual handler response too
        return {
            ...response,
            headers: {
                ...response.headers,
                ...corsHeaders,
            },
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        context.error(`Authentication error: ${errorMessage}`);
        return {
            status: 401,
            body: 'Unauthorized: ' + errorMessage,
            headers: corsHeaders,
        };
    }
}
//# sourceMappingURL=function-wrapper.js.map