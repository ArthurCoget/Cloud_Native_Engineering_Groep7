import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { authenticatedRouteWrapper } from "./helpers/function-wrapper";
import { Role } from "./types";
import orderService from "./service/order.service";

// Get all orders
async function getOrders(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return authenticatedRouteWrapper(
    async (authEmail, role) => {
      const orders = await orderService.getOrders({
        email: authEmail,
        role: role as Role,
      });

      return {
        status: 200,
        jsonBody: orders,
        headers: { "Content-Type": "application/json" },
      };
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
      const order = await orderService.getOrderById(id, authEmail, role);

      return {
        status: 200,
        jsonBody: order,
        headers: { "Content-Type": "application/json" },
      };
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
