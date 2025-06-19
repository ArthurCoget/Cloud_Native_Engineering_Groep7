import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { authenticatedRouteWrapper } from "./helpers/function-wrapper";
import { ProductInput, Role } from "./types";
import productService from "./service/product.service";
import { RedisCache } from "./util/redis.cache";

// Create new product
async function createProduct(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return authenticatedRouteWrapper(
    async (authEmail, role) => {
      const input = (await request.json()) as ProductInput;
      const newProduct = await productService.createProduct(
        input,
        authEmail,
        role
      );

      const redis = await RedisCache.getInstance();
      try {
        await redis.delete("products:all");
      } finally {
        await redis.quit();
      }

      return {
        status: 200,
        jsonBody: newProduct,
        headers: { "Content-Type": "application/json" },
      };
    },
    request,
    context
  );
}

// Get all products
async function getProducts(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const cacheKey = "products:all";
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

    const products = await productService.getProducts();
    await redis.set(cacheKey, JSON.stringify(products));

    return {
      status: 200,
      jsonBody: products,
      headers: { "Content-Type": "application/json", "X-Location": "DB" },
    };
  } catch (err: any) {
    return {
      status: 500,
      jsonBody: { message: err.message || "Failed to get products" },
      headers: { "Content-Type": "application/json" },
    };
  } finally {
    await redis.quit();
  }
}

// Get product by ID
async function getProductById(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const id = parseInt(request.params.id);
  const cacheKey = `product:id:${id}`;
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

    const product = await productService.getProductById(id);
    await redis.set(cacheKey, JSON.stringify(product));

    return {
      status: 200,
      jsonBody: product,
      headers: { "Content-Type": "application/json", "X-Location": "DB" },
    };
  } catch (err: any) {
    return {
      status: err.message?.includes("not found") ? 404 : 500,
      jsonBody: { message: err.message || "Failed to get product" },
      headers: { "Content-Type": "application/json" },
    };
  } finally {
    await redis.quit();
  }
}

// Update product and refresh caches
async function updateProduct(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return authenticatedRouteWrapper(
    async (authEmail, role) => {
      const id = parseInt(request.params.id);
      const input = (await request.json()) as ProductInput;

      const updatedProduct = await productService.updateProduct(
        id,
        input,
        authEmail,
        role
      );

      const redis = await RedisCache.getInstance();
      try {
        await redis.set(`product:id:${id}`, JSON.stringify(updatedProduct));
        await redis.delete("products:all");
      } finally {
        await redis.quit();
      }

      return {
        status: 200,
        jsonBody: updatedProduct,
        headers: { "Content-Type": "application/json" },
      };
    },
    request,
    context
  );
}

// Delete product and clear caches
async function deleteProduct(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return authenticatedRouteWrapper(
    async (authEmail, role) => {
      const id = parseInt(request.params.id);
      const result = await productService.deleteProduct(id, authEmail, role);

      const redis = await RedisCache.getInstance();
      try {
        await redis.delete(`product:id:${id}`);
        await redis.delete("products:all");
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

// Add review and update cache
async function addReviewToProduct(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return authenticatedRouteWrapper(
    async (authEmail, role) => {
      const id = parseInt(request.params.id);
      const body = (await request.json()) as {
        rating: number;
        comment: string;
      };

      const updatedProduct = await productService.addReviewToProduct(
        id,
        body.rating,
        body.comment,
        authEmail,
        role
      );

      const redis = await RedisCache.getInstance();
      try {
        await redis.set(`product:id:${id}`, JSON.stringify(updatedProduct));
        await redis.delete("products:all");
      } finally {
        await redis.quit();
      }

      return {
        status: 200,
        jsonBody: updatedProduct,
        headers: { "Content-Type": "application/json" },
      };
    },
    request,
    context
  );
}

// Register all product-related functions
app.http("createProduct", {
  route: "products",
  methods: ["POST"],
  authLevel: "anonymous",
  handler: createProduct,
});

app.http("getProducts", {
  route: "products",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: getProducts,
});

app.http("getProductById", {
  route: "products/{id}",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: getProductById,
});

app.http("updateProduct", {
  route: "products/{id}",
  methods: ["PUT"],
  authLevel: "anonymous",
  handler: updateProduct,
});

app.http("deleteProduct", {
  route: "products/{id}",
  methods: ["DELETE"],
  authLevel: "anonymous",
  handler: deleteProduct,
});

app.http("addReviewToProduct", {
  route: "products/{id}/rating",
  methods: ["POST"],
  authLevel: "anonymous",
  handler: addReviewToProduct,
});
