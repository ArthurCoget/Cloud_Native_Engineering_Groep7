"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = require("@azure/functions");
const function_wrapper_1 = require("./helpers/function-wrapper");
const order_service_1 = __importDefault(require("./service/order.service"));
const redis_cache_1 = require("./util/redis.cache");
// Get all orders
async function getOrders(request, context) {
    return (0, function_wrapper_1.authenticatedRouteWrapper)(async (authEmail, role) => {
        const cacheKey = `orders:all:${authEmail}:${role}`;
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
            const orders = await order_service_1.default.getOrders({
                email: authEmail,
                role: role,
            });
            await redis.set(cacheKey, JSON.stringify(orders));
            return {
                status: 200,
                jsonBody: orders,
                headers: { "Content-Type": "application/json", "X-Location": "DB" },
            };
        }
        finally {
            await redis.quit();
        }
    }, request, context);
}
// Get order by ID
async function getOrderById(request, context) {
    return (0, function_wrapper_1.authenticatedRouteWrapper)(async (authEmail, role) => {
        const id = parseInt(request.params.id);
        const cacheKey = `orders:id:${id}`;
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
            const order = await order_service_1.default.getOrderById(id, authEmail, role);
            await redis.set(cacheKey, JSON.stringify(order));
            return {
                status: 200,
                jsonBody: order,
                headers: { "Content-Type": "application/json", "X-Location": "DB" },
            };
        }
        finally {
            await redis.quit();
        }
    }, request, context);
}
// Delete order by ID
async function deleteOrder(request, context) {
    return (0, function_wrapper_1.authenticatedRouteWrapper)(async (authEmail, role) => {
        const id = parseInt(request.params.id);
        const result = await order_service_1.default.deleteOrder(id, authEmail, role);
        const redis = await redis_cache_1.RedisCache.getInstance();
        try {
            await redis.delete(`orders:id:${id}`);
            await redis.delete(`orders:all:${authEmail}:${role}`);
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
// Register all order-related functions
functions_1.app.http("getOrders", {
    route: "orders",
    methods: ["GET"],
    authLevel: "anonymous",
    handler: getOrders,
});
functions_1.app.http("getOrderById", {
    route: "orders/{id}",
    methods: ["GET"],
    authLevel: "anonymous",
    handler: getOrderById,
});
functions_1.app.http("deleteOrder", {
    route: "orders/{id}",
    methods: ["DELETE"],
    authLevel: "anonymous",
    handler: deleteOrder,
});
//# sourceMappingURL=order.functions.js.map