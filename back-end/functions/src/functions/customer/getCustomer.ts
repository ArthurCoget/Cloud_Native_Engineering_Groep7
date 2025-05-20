import { app } from '@azure/functions';
import customerService from '../../../../service/customer.service'
import { Role } from '../../types';

app.http('getCustomers', {
  route: 'customers',
  methods: ['GET'],
  authLevel: 'function',
  handler: async (request, context) => {
    try {
      const auth = JSON.parse(request.headers['x-auth'] ?? '{}') as { email: string; role: Role };
      const customers = await customerService.getCustomers(auth.email, auth.role);
      return { status: 200, jsonBody: customers };
    } catch (error) {
      context.log.error(error);
      return { status: 500, body: 'Internal Server Error' };
    }
  }
});
