"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = require("@azure/functions");
const function_wrapper_1 = require("./helpers/function-wrapper");
const product_service_1 = __importDefault(require("./service/product.service"));
const redis_cache_1 = require("./util/redis.cache");
// Create new product
async function createProduct(request, context) {
    return (0, function_wrapper_1.authenticatedRouteWrapper)(async (authEmail, role) => {
        const input = (await request.json());
        const newProduct = await product_service_1.default.createProduct(input, authEmail, role);
        const redis = await redis_cache_1.RedisCache.getInstance();
        try {
            await redis.delete("products:all");
        }
        finally {
            await redis.quit();
        }
        return {
            status: 200,
            jsonBody: newProduct,
            headers: { "Content-Type": "application/json" },
        };
    }, request, context);
}
// Get all products
async function getProducts(request, context) {
    const cacheKey = "products:all";
    const redis = await redis_cache_1.RedisCache.getInstance();
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
        const products = await product_service_1.default.getProducts();
        await redis.set(cacheKey, JSON.stringify(products));
        return {
            status: 200,
            jsonBody: products,
            headers: { "Content-Type": "application/json", "X-Location": "DB" },
        };
    }
    catch (err) {
        return {
            status: 500,
            jsonBody: { message: err.message || "Failed to get products" },
            headers: { "Content-Type": "application/json" },
        };
    }
    finally {
        await redis.quit();
    }
}
// Get product by ID
async function getProductById(request, context) {
    const id = parseInt(request.params.id);
    const cacheKey = `product:id:${id}`;
    const redis = await redis_cache_1.RedisCache.getInstance();
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
        const product = await product_service_1.default.getProductById(id);
        await redis.set(cacheKey, JSON.stringify(product));
        return {
            status: 200,
            jsonBody: product,
            headers: { "Content-Type": "application/json", "X-Location": "DB" },
        };
    }
    catch (err) {
        return {
            status: err.message?.includes("not found") ? 404 : 500,
            jsonBody: { message: err.message || "Failed to get product" },
            headers: { "Content-Type": "application/json" },
        };
    }
    finally {
        await redis.quit();
    }
}
// Update product and refresh caches
async function updateProduct(request, context) {
    return (0, function_wrapper_1.authenticatedRouteWrapper)(async (authEmail, role) => {
        const id = parseInt(request.params.id);
        const input = (await request.json());
        const updatedProduct = await product_service_1.default.updateProduct(id, input, authEmail, role);
        const redis = await redis_cache_1.RedisCache.getInstance();
        try {
            await redis.set(`product:id:${id}`, JSON.stringify(updatedProduct));
            await redis.delete("products:all");
        }
        finally {
            await redis.quit();
        }
        return {
            status: 200,
            jsonBody: updatedProduct,
            headers: { "Content-Type": "application/json" },
        };
    }, request, context);
}
// Delete product and clear caches
async function deleteProduct(request, context) {
    return (0, function_wrapper_1.authenticatedRouteWrapper)(async (authEmail, role) => {
        const id = parseInt(request.params.id);
        const result = await product_service_1.default.deleteProduct(id, authEmail, role);
        const redis = await redis_cache_1.RedisCache.getInstance();
        try {
            await redis.delete(`product:id:${id}`);
            await redis.delete("products:all");
        }
        finally {
            await redis.quit();
        }
        return {
            status: 200,
            jsonBody: { message: result },
            headers: { "Content-Type": "application/json" },
        };
    }, request, context);
}
// Add review and update cache
async function addReviewToProduct(request, context) {
    return (0, function_wrapper_1.authenticatedRouteWrapper)(async (authEmail, role) => {
        const id = parseInt(request.params.id);
        const body = (await request.json());
        const updatedProduct = await product_service_1.default.addReviewToProduct(id, body.rating, body.comment, authEmail, role);
        const redis = await redis_cache_1.RedisCache.getInstance();
        try {
            await redis.set(`product:id:${id}`, JSON.stringify(updatedProduct));
            await redis.delete("products:all");
        }
        finally {
            await redis.quit();
        }
        return {
            status: 200,
            jsonBody: updatedProduct,
            headers: { "Content-Type": "application/json" },
        };
    }, request, context);
}
// Register all product-related functions
functions_1.app.http("createProduct", {
    route: "products",
    methods: ["POST"],
    authLevel: "anonymous",
    handler: createProduct,
});
functions_1.app.http("getProducts", {
    route: "products",
    methods: ["GET"],
    authLevel: "anonymous",
    handler: getProducts,
});
functions_1.app.http("getProductById", {
    route: "products/{id}",
    methods: ["GET"],
    authLevel: "anonymous",
    handler: getProductById,
});
functions_1.app.http("updateProduct", {
    route: "products/{id}",
    methods: ["PUT"],
    authLevel: "anonymous",
    handler: updateProduct,
});
functions_1.app.http("deleteProduct", {
    route: "products/{id}",
    methods: ["DELETE"],
    authLevel: "anonymous",
    handler: deleteProduct,
});
functions_1.app.http("addReviewToProduct", {
    route: "products/{id}/rating",
    methods: ["POST"],
    authLevel: "anonymous",
    handler: addReviewToProduct,
});
//# sourceMappingURL=product.functions.js.map