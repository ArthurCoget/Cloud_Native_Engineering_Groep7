import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { authenticatedRouteWrapper } from "./helpers/function-wrapper";
import { PaymentService } from "./service/payment.service";
import { Role } from "./types";
import dotenv from "dotenv";
dotenv.config();

// Get all payments
async function getPayments(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return authenticatedRouteWrapper(
    async (authEmail, role) => {
      const payments = await PaymentService.getInstance().getPayments(
        authEmail,
        role
      );
      return {
        status: 200,
        jsonBody: payments,
        headers: { "Content-Type": "application/json" },
      };
    },
    request,
    context
  );
}

// Get payment by ID
async function getPaymentById(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return authenticatedRouteWrapper(
    async (authEmail, role) => {
      const id = Number(request.params.id);
      const payment = await PaymentService.getInstance().getPaymentById(
        id,
        authEmail,
        role
      );
      return {
        status: 200,
        jsonBody: payment,
        headers: { "Content-Type": "application/json" },
      };
    },
    request,
    context
  );
}

// Register all payment-related functions
app.http("getPayments", {
  route: "payments",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: getPayments,
});

app.http("getPaymentById", {
  route: "payments/{id}",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: getPaymentById,
});
