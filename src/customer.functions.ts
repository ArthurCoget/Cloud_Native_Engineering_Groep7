import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { authenticatedRouteWrapper } from "./helpers/function-wrapper";
import { CustomerService } from "./service/customer.service";
import { CustomerInput } from "./types";
import { Role } from "./types";

import dotenv from "dotenv";
import { RedisCache } from "./util/redis.cache";
dotenv.config();

// Get all customers
async function getAllCustomers(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return authenticatedRouteWrapper(
    async (authEmail, role) => {
      const cacheKey = `customers:all:${authEmail}:${role}`;
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

        const customers = await CustomerService.getInstance().getCustomers(
          authEmail,
          role
        );
        await redis.set(cacheKey, JSON.stringify(customers));

        return {
          status: 200,
          jsonBody: customers,
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

// Get customer by email
async function getCustomerByEmail(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return authenticatedRouteWrapper(
    async (authEmail, role) => {
      const email = request.params.email;
      const cacheKey = `customer:email:${email}:${authEmail}:${role}`;
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

        const customer = await CustomerService.getInstance().getCustomerByEmail(
          email,
          authEmail,
          role
        );
        await redis.set(cacheKey, JSON.stringify(customer));

        return {
          status: 200,
          jsonBody: customer,
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

// Get customer wishlist
async function getCustomerWishlist(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return authenticatedRouteWrapper(
    async (authEmail, role) => {
      const email = request.params.email;
      const cacheKey = `wishlist:email:${email}:${authEmail}:${role}`;
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

        const wishlist = await CustomerService.getInstance().getWishlistByEmail(
          email,
          authEmail,
          role
        );
        await redis.set(cacheKey, JSON.stringify(wishlist));

        return {
          status: 200,
          jsonBody: wishlist,
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

// Create new customer
async function createCustomer(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const input = (await request.json()) as CustomerInput;
    const newCustomer = await CustomerService.getInstance().createCustomer(
      input
    );

    const redis = await RedisCache.getInstance();
    try {
      // Clear cache for all customers without auth keys, because this is a new customer
      await redis.delete("customers:all*");
    } finally {
      await redis.quit();
    }

    return {
      status: 200,
      jsonBody: {
        id: newCustomer.getId(),
        firstName: newCustomer.getFirstName(),
        lastName: newCustomer.getLastName(),
        email: newCustomer.getEmail(),
        role: newCustomer.getRole(),
      },
      headers: { "Content-Type": "application/json" },
    };
  } catch (err: any) {
    return {
      status: err.message?.includes("exists") ? 400 : 500,
      jsonBody: { message: err.message || "Signup failed." },
      headers: { "Content-Type": "application/json" },
    };
  }
}

// Customer login
async function loginCustomer(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const input = (await request.json()) as CustomerInput;
    const response = await CustomerService.getInstance().authenticate(input);

    return {
      status: 200,
      jsonBody: response,
      headers: { "Content-Type": "application/json" },
    };
  } catch (err: any) {
    return {
      status: 401,
      jsonBody: { message: err.message || "Login failed" },
      headers: { "Content-Type": "application/json" },
    };
  }
}

// Update customer
async function updateCustomer(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return authenticatedRouteWrapper(
    async (authEmail, role) => {
      const email = request.params.email;
      const input = (await request.json()) as CustomerInput;

      const updatedCustomer =
        await CustomerService.getInstance().updateCustomer(
          email,
          input,
          authEmail,
          role
        );

      const redis = await RedisCache.getInstance();
      try {
        await redis.set(
          `customer:email:${email}:${authEmail}:${role}`,
          JSON.stringify(updatedCustomer)
        );
        await redis.delete(`customers:all:${authEmail}:${role}`);
      } finally {
        await redis.quit();
      }

      return {
        status: 200,
        jsonBody: updatedCustomer,
        headers: { "Content-Type": "application/json" },
      };
    },
    request,
    context
  );
}

// Add product to wishlist
async function addToWishlist(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return authenticatedRouteWrapper(
    async (authEmail, role) => {
      const email = request.params.email;
      const productId = parseInt(request.params.productId);

      const product = await CustomerService.getInstance().addProductToWishlist(
        email,
        productId,
        authEmail,
        role
      );

      const redis = await RedisCache.getInstance();
      try {
        await redis.delete(`wishlist:email:${email}:${authEmail}:${role}`);
      } finally {
        await redis.quit();
      }

      return {
        status: 200,
        jsonBody: product,
        headers: { "Content-Type": "application/json" },
      };
    },
    request,
    context
  );
}

// Remove product from wishlist
async function removeFromWishlist(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return authenticatedRouteWrapper(
    async (authEmail, role) => {
      const email = request.params.email;
      const productId = parseInt(request.params.productId);

      const result =
        await CustomerService.getInstance().removeProductFromWishlist(
          email,
          productId,
          authEmail,
          role
        );

      const redis = await RedisCache.getInstance();
      try {
        await redis.delete(`wishlist:email:${email}:${authEmail}:${role}`);
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

// Register all customer-related functions
app.http("getAllCustomers", {
  route: "customers",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: getAllCustomers,
});

app.http("getCustomerByEmail", {
  route: "customers/{email}",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: getCustomerByEmail,
});

app.http("getCustomerWishlist", {
  route: "customers/{email}/wishlist",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: getCustomerWishlist,
});

app.http("createCustomer", {
  route: "customers/signup",
  methods: ["POST"],
  authLevel: "anonymous",
  handler: createCustomer,
});

app.http("loginCustomer", {
  route: "customers/login",
  methods: ["POST"],
  authLevel: "anonymous",
  handler: loginCustomer,
});

app.http("updateCustomer", {
  route: "customers/{email}",
  methods: ["PUT"],
  authLevel: "anonymous",
  handler: updateCustomer,
});

app.http("addToWishlist", {
  route: "customers/addWishlist/{email}/{productId}",
  methods: ["PUT"],
  authLevel: "anonymous",
  handler: addToWishlist,
});

app.http("removeFromWishlist", {
  route: "customers/removeWishlist/{email}/{productId}",
  methods: ["PUT"],
  authLevel: "anonymous",
  handler: removeFromWishlist,
});
