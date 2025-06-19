import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { authenticatedRouteWrapper } from "../helpers/function-wrapper";
import { PaymentService } from "../service/payment.service";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  await authenticatedRouteWrapper(async (authEmail, role) => {
    const id = context.bindingData.id;
    const payment = await PaymentService.getInstance().getPaymentById(
      id,
      authEmail,
      role
    );

    context.res = {
      body: payment,
      headers: {
        "Content-Type": "application/json",
      },
    };
  }, context);
  context.log("Get payment by id function processed a request.");
};

export default httpTrigger;
