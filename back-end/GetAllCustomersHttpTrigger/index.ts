import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { authenticatedRouteWrapper } from "../helpers/function-wrapper";
import { CustomerService } from "../service/customer.service";

export const run: AzureFunction = async (
  context: Context,
  req: HttpRequest
) => {
  await authenticatedRouteWrapper(async (authEmail, role) => {
    const customers = await CustomerService.getInstance().getCustomers(
      authEmail,
      role
    );
    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: customers,
    };
  }, context);
  context.log("HTTP trigger function processed a request.");
};
