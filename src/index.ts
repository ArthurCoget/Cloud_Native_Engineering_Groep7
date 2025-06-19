console.log('>>> Starting Azure Functions runtime <<<');

import { app, HttpRequest, InvocationContext } from '@azure/functions';
import './cart.functions';
import './customer.functions';
import './discountCode.functions';
import './order.functions';
import './payment.functions';
import './product.functions';

import dotenv from 'dotenv';
dotenv.config();

// Global CORS handler for OPTIONS requests
app.http('options', {
  route: '{*path}', // This matches OPTIONS for any route under /api
  methods: ['OPTIONS'],
  authLevel: 'anonymous',
  handler: async (request: HttpRequest, context: InvocationContext) => {
    return {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Headers':
          'Content-Type,Authorization,X-Requested-With',
        'Access-Control-Max-Age': '86400',
      },
    };
  },
});

export default app;
