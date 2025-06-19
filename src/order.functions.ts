import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { authenticatedRouteWrapper } from "./helpers/function-wrapper";
import { Role } from "./types";
import orderService from "./service/order.service";
import { RedisCache } from "./util/redis.cache";

// Get all orders
async function getOrders(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return authenticatedRouteWrapper(
    async (authEmail, role) => {
      const cacheKey = `orders:all:${authEmail}:${role}`;
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

        const orders = await orderService.getOrders({
          email: authEmail,
          role: role as Role,
        });

        await redis.set(cacheKey, JSON.stringify(orders));

        return {
          status: 200,
          jsonBody: orders,
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

// Get order by ID
async function getOrderById(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return authenticatedRouteWrapper(
    async (authEmail, role) => {
      const id = parseInt(request.params.id);
      const cacheKey = `orders:id:${id}`;
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

        const order = await orderService.getOrderById(id, authEmail, role);
        await redis.set(cacheKey, JSON.stringify(order));

        return {
          status: 200,
          jsonBody: order,
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

// Delete order by ID
async function deleteOrder(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return authenticatedRouteWrapper(
    async (authEmail, role) => {
      const id = parseInt(request.params.id);
      const result = await orderService.deleteOrder(id, authEmail, role);

      const redis = await RedisCache.getInstance();
      try {
        await redis.delete(`orders:id:${id}`);
        await redis.delete(`orders:all:${authEmail}:${role}`);
      } finally {
        await redis.quit();
      }

      return {
        status: 200,
        jsonBody: { message: result },
        headers: { "Content-Type": "application/json" },
      };
    },
    request,
    context
  );
}

// Register all order-related functions
app.http("getOrders", {
  route: "orders",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: getOrders,
});

app.http("getOrderById", {
  route: "orders/{id}",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: getOrderById,
});

app.http("deleteOrder", {
  route: "orders/{id}",
  methods: ["DELETE"],
  authLevel: "anonymous",
  handler: deleteOrder,
});
