"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = require("@azure/functions");
const function_wrapper_1 = require("./helpers/function-wrapper");
const payment_service_1 = require("./service/payment.service");
const dotenv_1 = __importDefault(require("dotenv"));
const redis_cache_1 = require("./util/redis.cache");
dotenv_1.default.config();
// Get all payments
async function getPayments(request, context) {
    return (0, function_wrapper_1.authenticatedRouteWrapper)(async (authEmail, role) => {
        const cacheKey = `payments:all:${authEmail}:${role}`;
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
            const payments = await payment_service_1.PaymentService.getInstance().getPayments(authEmail, role);
            await redis.set(cacheKey, JSON.stringify(payments));
            return {
                status: 200,
                jsonBody: payments,
                headers: { "Content-Type": "application/json", "X-Location": "DB" },
            };
        }
        finally {
            await redis.quit();
        }
    }, request, context);
}
// Get payment by ID
async function getPaymentById(request, context) {
    return (0, function_wrapper_1.authenticatedRouteWrapper)(async (authEmail, role) => {
        const id = Number(request.params.id);
        const cacheKey = `payment:id:${id}:${authEmail}:${role}`;
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
            const payment = await payment_service_1.PaymentService.getInstance().getPaymentById(id, authEmail, role);
            await redis.set(cacheKey, JSON.stringify(payment));
            return {
                status: 200,
                jsonBody: payment,
                headers: { "Content-Type": "application/json", "X-Location": "DB" },
            };
        }
        finally {
            await redis.quit();
        }
    }, request, context);
}
// Register all payment-related functions
functions_1.app.http("getPayments", {
    route: "payments",
    methods: ["GET"],
    authLevel: "anonymous",
    handler: getPayments,
});
functions_1.app.http("getPaymentById", {
    route: "payments/{id}",
    methods: ["GET"],
    authLevel: "anonymous",
    handler: getPaymentById,
});
//# sourceMappingURL=payment.functions.js.map