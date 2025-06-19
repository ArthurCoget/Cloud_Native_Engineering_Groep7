import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { authenticatedRouteWrapper } from "./helpers/function-wrapper";
import cartService from "./service/cart.service";
import dotenv from "dotenv";
import { RedisCache } from "./util/redis.cache";
dotenv.config();

// Get all carts
async function getCarts(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return authenticatedRouteWrapper(
    async (authEmail, role) => {
      const cacheKey = `cart:all:${authEmail}:${role}`;
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

        const carts = await cartService.getCarts(authEmail, role);
        await redis.set(cacheKey, JSON.stringify(carts));

        return {
          status: 200,
          jsonBody: carts,
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

// Get cart by ID
async function getCartById(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return authenticatedRouteWrapper(
    async (authEmail, role) => {
      const id = Number(request.params.id);
      const cacheKey = `cart:id:${id}`;
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

        const cart = await cartService.getCartById(id, authEmail, role);
        await redis.set(cacheKey, JSON.stringify(cart));

        return {
          status: 200,
          jsonBody: cart,
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

// Get cart by email
async function getCartByEmail(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return authenticatedRouteWrapper(
    async (authEmail, role) => {
      const email = request.params.email;
      const cacheKey = `cart:email:${email}`;
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

        const cart = await cartService.getCartByEmail(email, authEmail, role);
        await redis.set(cacheKey, JSON.stringify(cart));

        return {
          status: 200,
          jsonBody: cart,
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

// Add items to cart
async function addCartItem(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return authenticatedRouteWrapper(
    async (authEmail, role) => {
      const email = request.params.email;
      const productId = Number(request.params.productId);
      const quantity = Number(request.params.quantity);

      const result = await cartService.addCartItem(
        email,
        productId,
        quantity,
        authEmail,
        role
      );

      const redis = await RedisCache.getInstance();

      try {
        const updatedCart = await cartService.getCartByEmail(
          email,
          authEmail,
          role
        );
        await redis.set(`cart:email:${email}`, JSON.stringify(updatedCart));

        return {
          status: 200,
          jsonBody: result,
          headers: { "Content-Type": "application/json" },
        };
      } finally {
        await redis.quit();
      }
    },
    request,
    context
  );
}

// Remove items from cart
async function removeCartItem(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return authenticatedRouteWrapper(
    async (authEmail, role) => {
      const email = request.params.email;
      const productId = Number(request.params.productId);
      const quantity = Number(request.params.quantity);

      const result = await cartService.removeCartItem(
        email,
        productId,
        quantity,
        authEmail,
        role
      );

      const redis = await RedisCache.getInstance();

      try {
        const updatedCart = await cartService.getCartByEmail(
          email,
          authEmail,
          role
        );
        await redis.set(`cart:email:${email}`, JSON.stringify(updatedCart));

        return {
          status: 200,
          jsonBody: result,
          headers: { "Content-Type": "application/json" },
        };
      } finally {
        await redis.quit();
      }
    },
    request,
    context
  );
}

// Add discount code to cart
async function addDiscountCode(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return authenticatedRouteWrapper(
    async (authEmail, role) => {
      const email = request.params.email;
      const code = request.params.code;

      const discountCode = await cartService.addDiscountCode(
        email,
        code,
        authEmail,
        role
      );

      const redis = await RedisCache.getInstance();

      try {
        const updatedCart = await cartService.getCartByEmail(
          email,
          authEmail,
          role
        );
        await redis.set(`cart:email:${email}`, JSON.stringify(updatedCart));

        return {
          status: 200,
          jsonBody: discountCode,
          headers: { "Content-Type": "application/json" },
        };
      } finally {
        await redis.quit();
      }
    },
    request,
    context
  );
}

// Remove discount code from cart
async function removeDiscountCode(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return authenticatedRouteWrapper(
    async (authEmail, role) => {
      const email = request.params.email;
      const code = request.params.code;

      const message = await cartService.removeDiscountCode(
        email,
        code,
        authEmail,
        role
      );

      const redis = await RedisCache.getInstance();

      try {
        const updatedCart = await cartService.getCartByEmail(
          email,
          authEmail,
          role
        );
        await redis.set(`cart:email:${email}`, JSON.stringify(updatedCart));

        return {
          status: 200,
          jsonBody: message,
          headers: { "Content-Type": "application/json" },
        };
      } finally {
        await redis.quit();
      }
    },
    request,
    context
  );
}

// Convert cart to order
async function convertCartToOrder(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return authenticatedRouteWrapper(
    async (authEmail, role) => {
      const email = request.params.email;
      const paymentStatus = request.query.get("paymentStatus");

      if (!paymentStatus) {
        return {
          status: 400,
          jsonBody: { message: "Payment status is required." },
          headers: { "Content-Type": "application/json" },
        };
      }

      const order = await cartService.convertCartToOrder(
        email,
        paymentStatus,
        authEmail,
        role
      );

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

// Health check endpoint
async function getStatus(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return {
    status: 200,
    jsonBody: { status: "App running" },
    headers: { "Content-Type": "application/json" },
  };
}

// Register all cart-related functions
app.http("getCarts", {
  route: "carts",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: getCarts,
});

app.http("getCartById", {
  route: "carts/{id}",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: getCartById,
});

app.http("getCartByEmail", {
  route: "carts/email/{email}",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: getCartByEmail,
});

app.http("addCartItem", {
  route: "carts/addItems/{email}/{productId}/{quantity}",
  methods: ["PUT"],
  authLevel: "anonymous",
  handler: addCartItem,
});

app.http("removeCartItem", {
  route: "carts/removeItems/{email}/{productId}/{quantity}",
  methods: ["PUT"],
  authLevel: "anonymous",
  handler: removeCartItem,
});

app.http("addDiscountCode", {
  route: "carts/addDiscountCode/{email}/{code}",
  methods: ["PUT"],
  authLevel: "anonymous",
  handler: addDiscountCode,
});

app.http("removeDiscountCode", {
  route: "carts/removeDiscountCode/{email}/{code}",
  methods: ["PUT"],
  authLevel: "anonymous",
  handler: removeDiscountCode,
});

app.http("convertCartToOrder", {
  route: "carts/convertToOrder/{email}",
  methods: ["POST"],
  authLevel: "anonymous",
  handler: convertCartToOrder,
});

app.http("getStatus", {
  route: "carts/status",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: getStatus,
});
