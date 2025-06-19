import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { authenticatedRouteWrapper } from "../helpers/function-wrapper";
import { CustomerService } from "../service/customer.service";

async function getCustomerByEmail(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return authenticatedRouteWrapper(async (authEmail, role) => {
    const email = request.params.email; // Access route parameter
    const customer = await CustomerService.getInstance().getCustomerByEmail(
      email,
      authEmail,
      role
    );

    return {
      status: 200,
      jsonBody: customer, // Use jsonBody for automatic serialization
      headers: { "Content-Type": "application/json" },
    };
  }, context);
}

// Register the function with HTTP configuration
app.http("getCustomerByEmail", {
  route: "customer/{email}", // Define route parameter
  methods: ["GET"],
  authLevel: "anonymous", // Handle auth in your wrapper
  handler: getCustomerByEmail,
});
