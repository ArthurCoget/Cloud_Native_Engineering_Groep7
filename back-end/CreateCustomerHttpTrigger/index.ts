import { Context, HttpRequest } from "@azure/functions";
import { CustomerService } from "../service/customer.service";
import { CustomerInput } from "../types";

export default async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    // actually parse the JSON body
    const input = (await req.json()) as CustomerInput;

    const newCustomer = await CustomerService.getInstance().createCustomer(
      input
    );

    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: {
        id: newCustomer.getId(),
        firstName: newCustomer.getFirstName(),
        lastName: newCustomer.getLastName(),
        email: newCustomer.getEmail(),
        role: newCustomer.getRole(),
      },
    };
  } catch (err: any) {
    context.res = {
      status: err.message?.includes("exists") ? 400 : 500,
      headers: { "Content-Type": "application/json" },
      body: { message: err.message || "Signup failed." },
    };
  }
}
