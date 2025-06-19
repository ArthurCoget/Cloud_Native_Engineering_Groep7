import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { authenticatedRouteWrapper } from "./helpers/function-wrapper";
import { DiscountCodeInput, Role } from "./types";
import discountCodeService from "./service/discountCode.service";

// Get all discount codes
async function getDiscountCodes(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return authenticatedRouteWrapper(
    async (authEmail, role) => {
      const discountCodes = await discountCodeService.getDiscountCodes(
        authEmail,
        role
      );

      return {
        status: 200,
        jsonBody: discountCodes,
        headers: { "Content-Type": "application/json" },
      };
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
      const discountCode = await discountCodeService.getDiscountCodeByCode(
        code,
        authEmail,
        role
      );

      return {
        status: 200,
        jsonBody: discountCode,
        headers: { "Content-Type": "application/json" },
      };
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

      return {
        status: 200,
        jsonBody: updatedDiscountCode,
        headers: { "Content-Type": "application/json" },
      };
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
