import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { authenticatedRouteWrapper } from "../helpers/function-wrapper";
import { CustomerService } from "../service/customer.service";

export const run: AzureFunction = async (
  context: Context,
  req: HttpRequest
) => {
  await authenticatedRouteWrapper(async (authEmail, role) => {
    const email = context.bindingData.email;
    const wishlist = await CustomerService.getInstance().getWishlistByEmail(
      email,
      authEmail,
      role
    );

    context.res = {
      status: 200,
      body: wishlist,
      headers: {
        "Content-Type": "application/json",
      },
    };
  }, context);
  context.log("Get customer wishlist function processed a request.");
};
