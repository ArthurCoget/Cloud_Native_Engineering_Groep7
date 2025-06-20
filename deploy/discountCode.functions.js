"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = require("@azure/functions");
const function_wrapper_1 = require("./helpers/function-wrapper");
const discountCode_service_1 = __importDefault(require("./service/discountCode.service"));
const redis_cache_1 = require("./util/redis.cache");
// Get all discount codes
async function getDiscountCodes(request, context) {
    return (0, function_wrapper_1.authenticatedRouteWrapper)(async (authEmail, role) => {
        const cacheKey = `discountCodes:all:${authEmail}:${role}`;
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
            const discountCodes = await discountCode_service_1.default.getDiscountCodes(authEmail, role);
            await redis.set(cacheKey, JSON.stringify(discountCodes));
            return {
                status: 200,
                jsonBody: discountCodes,
                headers: { "Content-Type": "application/json", "X-Location": "DB" },
            };
        }
        finally {
            await redis.quit();
        }
    }, request, context);
}
// Get discount code by code
async function getDiscountCodeByCode(request, context) {
    return (0, function_wrapper_1.authenticatedRouteWrapper)(async (authEmail, role) => {
        const code = request.params.code;
        const cacheKey = `discountCode:code:${code}`;
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
            const discountCode = await discountCode_service_1.default.getDiscountCodeByCode(code, authEmail, role);
            await redis.set(cacheKey, JSON.stringify(discountCode));
            return {
                status: 200,
                jsonBody: discountCode,
                headers: { "Content-Type": "application/json", "X-Location": "DB" },
            };
        }
        finally {
            await redis.quit();
        }
    }, request, context);
}
// Create new discount code
async function createDiscountCode(request, context) {
    return (0, function_wrapper_1.authenticatedRouteWrapper)(async (authEmail, role) => {
        const input = (await request.json());
        const newDiscountCode = await discountCode_service_1.default.createDiscountCode(input, authEmail, role);
        return {
            status: 200,
            jsonBody: newDiscountCode,
            headers: { "Content-Type": "application/json" },
        };
    }, request, context);
}
// Update discount code
async function updateDiscountCode(request, context) {
    return (0, function_wrapper_1.authenticatedRouteWrapper)(async (authEmail, role) => {
        const code = request.params.code;
        const input = (await request.json());
        const updatedDiscountCode = await discountCode_service_1.default.updateDiscountCode(code, input, authEmail, role);
        const redis = await redis_cache_1.RedisCache.getInstance();
        try {
            // Refresh individual code
            await redis.set(`discountCode:code:${code}`, JSON.stringify(updatedDiscountCode));
            // Refresh list
            const updatedList = await discountCode_service_1.default.getDiscountCodes(authEmail, role);
            await redis.set(`discountCodes:all:${authEmail}:${role}`, JSON.stringify(updatedList));
            return {
                status: 200,
                jsonBody: updatedDiscountCode,
                headers: { "Content-Type": "application/json" },
            };
        }
        finally {
            await redis.quit();
        }
    }, request, context);
}
// Delete discount code
async function deleteDiscountCode(request, context) {
    return (0, function_wrapper_1.authenticatedRouteWrapper)(async (authEmail, role) => {
        const code = request.params.code;
        const result = await discountCode_service_1.default.deleteDiscountCode(code, authEmail, role);
        const redis = await redis_cache_1.RedisCache.getInstance();
        try {
            // Remove individual code cache
            await redis.delete(`discountCode:code:${code}`);
            // Refresh list
            const updatedList = await discountCode_service_1.default.getDiscountCodes(authEmail, role);
            await redis.set(`discountCodes:all:${authEmail}:${role}`, JSON.stringify(updatedList));
            return {
                status: 200,
                jsonBody: { message: result },
                headers: { "Content-Type": "application/json" },
            };
        }
        finally {
            await redis.quit();
        }
    }, request, context);
}
// Register all discount code-related functions
functions_1.app.http("getDiscountCodes", {
    route: "discounts",
    methods: ["GET"],
    authLevel: "anonymous",
    handler: getDiscountCodes,
});
functions_1.app.http("getDiscountCodeByCode", {
    route: "discounts/{code}",
    methods: ["GET"],
    authLevel: "anonymous",
    handler: getDiscountCodeByCode,
});
functions_1.app.http("createDiscountCode", {
    route: "discounts",
    methods: ["POST"],
    authLevel: "anonymous",
    handler: createDiscountCode,
});
functions_1.app.http("updateDiscountCode", {
    route: "discounts/{code}",
    methods: ["PUT"],
    authLevel: "anonymous",
    handler: updateDiscountCode,
});
functions_1.app.http("deleteDiscountCode", {
    route: "discounts/{code}",
    methods: ["DELETE"],
    authLevel: "anonymous",
    handler: deleteDiscountCode,
});
//# sourceMappingURL=discountCode.functions.js.map