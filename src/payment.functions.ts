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
import { RedisCache } from "./util/redis.cache";
dotenv.config();

// Get all payments
async function getPayments(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return authenticatedRouteWrapper(
    async (authEmail, role) => {
      const cacheKey = `payments:all:${authEmail}:${role}`;
      const redis = await RedisCache.getInstance();

      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return {
            status: 200,
            jsonBody: JSON.parse(cached),
            headers: {
              "Content-Type": "application/json",
              "X-Location": "Cache",
            },
          };
        }

        const payments = await PaymentService.getInstance().getPayments(
          authEmail,
          role
        );
        await redis.set(cacheKey, JSON.stringify(payments));

        return {
          status: 200,
          jsonBody: payments,
          headers: { "Content-Type": "application/json", "X-Location": "DB" },
        };
      } finally {
        await redis.quit();
      }
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
      const cacheKey = `payment:id:${id}:${authEmail}:${role}`;
      const redis = await RedisCache.getInstance();

      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return {
            status: 200,
            jsonBody: JSON.parse(cached),
            headers: {
              "Content-Type": "application/json",
              "X-Location": "Cache",
            },
          };
        }

        const payment = await PaymentService.getInstance().getPaymentById(
          id,
          authEmail,
          role
        );
        await redis.set(cacheKey, JSON.stringify(payment));

        return {
          status: 200,
          jsonBody: payment,
          headers: { "Content-Type": "application/json", "X-Location": "DB" },
        };
      } finally {
        await redis.quit();
      }
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
