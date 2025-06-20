console.log('>>> Starting Azure Functions runtime <<<');

import { app } from '@azure/functions';
import './cart.functions';
import './customer.functions';
import './discountCode.functions';
import './order.functions';
import './payment.functions';
import './product.functions';

// import dotenv from 'dotenv';
// dotenv.config();

// Global CORS handler for OPTIONS requests
app.http('corsPreflight', {
  route: '{*any}',
  methods: ['OPTIONS'],
  authLevel: 'anonymous',
  handler: async () => {
    return {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Max-Age': '86400',
      },
    };
  },
});

export default app;
