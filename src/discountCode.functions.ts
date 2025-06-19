import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { authenticatedRouteWrapper } from "./helpers/function-wrapper";
import { DiscountCodeInput, Role } from "./types";
import discountCodeService from "./service/discountCode.service";
import { RedisCache } from "./util/redis.cache";

// Get all discount codes
async function getDiscountCodes(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return authenticatedRouteWrapper(
    async (authEmail, role) => {
      const cacheKey = `discountCodes:all:${authEmail}:${role}`;
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

        const discountCodes = await discountCodeService.getDiscountCodes(
          authEmail,
          role
        );
        await redis.set(cacheKey, JSON.stringify(discountCodes));

        return {
          status: 200,
          jsonBody: discountCodes,
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

// Get discount code by code
async function getDiscountCodeByCode(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return authenticatedRouteWrapper(
    async (authEmail, role) => {
      const code = request.params.code;
      const cacheKey = `discountCode:code:${code}`;
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

        const discountCode = await discountCodeService.getDiscountCodeByCode(
          code,
          authEmail,
          role
        );
        await redis.set(cacheKey, JSON.stringify(discountCode));

        return {
          status: 200,
          jsonBody: discountCode,
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

// Create new discount code
async function createDiscountCode(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return authenticatedRouteWrapper(
    async (authEmail, role) => {
      const input = (await request.json()) as DiscountCodeInput;
      const newDiscountCode = await discountCodeService.createDiscountCode(
        input,
        authEmail,
        role
      );

      return {
        status: 200,
        jsonBody: newDiscountCode,
        headers: { "Content-Type": "application/json" },
      };
    },
    request,
    context
  );
}

// Update discount code
async function updateDiscountCode(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return authenticatedRouteWrapper(
    async (authEmail, role) => {
      const code = request.params.code;
      const input = (await request.json()) as DiscountCodeInput;

      const updatedDiscountCode = await discountCodeService.updateDiscountCode(
        code,
        input,
        authEmail,
        role
      );

      const redis = await RedisCache.getInstance();

      try {
        // Refresh individual code
        await redis.set(
          `discountCode:code:${code}`,
          JSON.stringify(updatedDiscountCode)
        );

        // Refresh list
        const updatedList = await discountCodeService.getDiscountCodes(
          authEmail,
          role
        );
        await redis.set(
          `discountCodes:all:${authEmail}:${role}`,
          JSON.stringify(updatedList)
        );

        return {
          status: 200,
          jsonBody: updatedDiscountCode,
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

// Delete discount code
async function deleteDiscountCode(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return authenticatedRouteWrapper(
    async (authEmail, role) => {
      const code = request.params.code;

      const result = await discountCodeService.deleteDiscountCode(
        code,
        authEmail,
        role
      );

      const redis = await RedisCache.getInstance();

      try {
        // Remove individual code cache
        await redis.delete(`discountCode:code:${code}`);

        // Refresh list
        const updatedList = await discountCodeService.getDiscountCodes(
          authEmail,
          role
        );
        await redis.set(
          `discountCodes:all:${authEmail}:${role}`,
          JSON.stringify(updatedList)
        );

        return {
          status: 200,
          jsonBody: { message: result },
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

// Register all discount code-related functions
app.http("getDiscountCodes", {
  route: "discounts",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: getDiscountCodes,
});

app.http("getDiscountCodeByCode", {
  route: "discounts/{code}",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: getDiscountCodeByCode,
});

app.http("createDiscountCode", {
  route: "discounts",
  methods: ["POST"],
  authLevel: "anonymous",
  handler: createDiscountCode,
});

app.http("updateDiscountCode", {
  route: "discounts/{code}",
  methods: ["PUT"],
  authLevel: "anonymous",
  handler: updateDiscountCode,
});

app.http("deleteDiscountCode", {
  route: "discounts/{code}",
  methods: ["DELETE"],
  authLevel: "anonymous",
  handler: deleteDiscountCode,
});
