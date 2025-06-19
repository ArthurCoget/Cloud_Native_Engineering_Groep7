import {
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import jwt from 'jsonwebtoken';
import { Role } from '../types';

function verifyToken(token: string): { email: string; role: Role } {
  try {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, secret) as { email: string; role: Role };
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function authenticatedRouteWrapper(
  handler: (authEmail: string, role: Role) => Promise<HttpResponseInit>,
  req: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
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
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    context.error(`Authentication error: ${errorMessage}`);
    return {
      status: 401,
      body: 'Unauthorized: ' + errorMessage,
      headers: corsHeaders,
    };
  }
}
