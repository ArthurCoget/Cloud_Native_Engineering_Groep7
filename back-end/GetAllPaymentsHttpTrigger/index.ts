import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { authenticatedRouteWrapper } from "../helpers/function-wrapper";
import { PaymentService } from "../service/payment.service";

export const run: AzureFunction = async (
  context: Context,
  req: HttpRequest
) => {
  await authenticatedRouteWrapper(async (authEmail, role) => {
    const payments = await PaymentService.getInstance().getPayments(
      authEmail,
      role
    );

    context.res = {
      status: 200,
      body: payments,
      headers: {
        "Content-Type": "application/json",
      },
    };
  }, context);
  context.log("Get all Payments function processed a request.");
};
