import { app } from '@azure/functions';
import customerService from '../../service/customer.service';
import { Role } from '../../types';

app.http('getCustomerByEmail', {
  route: 'customers/{email}',
  methods: ['GET'],
  authLevel: 'function',
  handler: async (request, context) => {
    try {
      const auth = JSON.parse(request.headers['x-auth'] ?? '{}') as { email: string; role: Role };
      const emailParam = request.params.email;
      const customer = await customerService.getCustomerByEmail(emailParam, auth.email, auth.role);
      return { status: 200, jsonBody: customer };
    } catch (error) {
      context.log.error(error);
      return { status: 500, body: 'Internal Server Error' };
    }
  }
});
