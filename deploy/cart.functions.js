"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = require("@azure/functions");
const dotenv_1 = __importDefault(require("dotenv"));
const function_wrapper_1 = require("./helpers/function-wrapper");
const cart_service_1 = __importDefault(require("./service/cart.service"));
const redis_cache_1 = require("./util/redis.cache");
dotenv_1.default.config();
// Get all carts
async function getCarts(request, context) {
    return (0, function_wrapper_1.authenticatedRouteWrapper)(async (authEmail, role) => {
        const cacheKey = `cart:all:${authEmail}:${role}`;
        const redis = await redis_cache_1.RedisCache.getInstance();
        try {
            const cached = await redis.get(cacheKey);
            if (cached) {
                return {
                    status: 200,
                    jsonBody: JSON.parse(cached),
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Location': 'Cache',
                    },
                };
            }
            const carts = await cart_service_1.default.getCarts(authEmail, role);
            await redis.set(cacheKey, JSON.stringify(carts));
            return {
                status: 200,
                jsonBody: carts,
                headers: { 'Content-Type': 'application/json', 'X-Location': 'DB' },
            };
        }
        finally {
            await redis.quit();
        }
    }, request, context);
}
// Get cart by ID
async function getCartById(request, context) {
    return (0, function_wrapper_1.authenticatedRouteWrapper)(async (authEmail, role) => {
        const id = Number(request.params.id);
        const cacheKey = `cart:id:${id}`;
        const redis = await redis_cache_1.RedisCache.getInstance();
        try {
            const cached = await redis.get(cacheKey);
            if (cached) {
                return {
                    status: 200,
                    jsonBody: JSON.parse(cached),
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Location': 'Cache',
                    },
                };
            }
            const cart = await cart_service_1.default.getCartById(id, authEmail, role);
            await redis.set(cacheKey, JSON.stringify(cart));
            return {
                status: 200,
                jsonBody: cart,
                headers: { 'Content-Type': 'application/json', 'X-Location': 'DB' },
            };
        }
        finally {
            await redis.quit();
        }
    }, request, context);
}
// Get cart by email
async function getCartByEmail(request, context) {
    return (0, function_wrapper_1.authenticatedRouteWrapper)(async (authEmail, role) => {
        const email = request.params.email;
        const cacheKey = `cart:email:${email}`;
        const redis = await redis_cache_1.RedisCache.getInstance();
        try {
            const cached = await redis.get(cacheKey);
            if (cached) {
                return {
                    status: 200,
                    jsonBody: JSON.parse(cached),
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Location': 'Cache',
                    },
                };
            }
            const cart = await cart_service_1.default.getCartByEmail(email, authEmail, role);
            await redis.set(cacheKey, JSON.stringify(cart));
            return {
                status: 200,
                jsonBody: cart,
                headers: { 'Content-Type': 'application/json', 'X-Location': 'DB' },
            };
        }
        finally {
            await redis.quit();
        }
    }, request, context);
}
// Add items to cart
async function addCartItem(request, context) {
    return (0, function_wrapper_1.authenticatedRouteWrapper)(async (authEmail, role) => {
        const email = request.params.email;
        const productId = Number(request.params.productId);
        const quantity = Number(request.params.quantity);
        const result = await cart_service_1.default.addCartItem(email, productId, quantity, authEmail, role);
        const redis = await redis_cache_1.RedisCache.getInstance();
        try {
            const updatedCart = await cart_service_1.default.getCartByEmail(email, authEmail, role);
            await redis.set(`cart:email:${email}`, JSON.stringify(updatedCart));
            return {
                status: 200,
                jsonBody: result,
                headers: { 'Content-Type': 'application/json' },
            };
        }
        finally {
            await redis.quit();
        }
    }, request, context);
}
// Remove items from cart
async function removeCartItem(request, context) {
    return (0, function_wrapper_1.authenticatedRouteWrapper)(async (authEmail, role) => {
        const email = request.params.email;
        const productId = Number(request.params.productId);
        const quantity = Number(request.params.quantity);
        const result = await cart_service_1.default.removeCartItem(email, productId, quantity, authEmail, role);
        const redis = await redis_cache_1.RedisCache.getInstance();
        try {
            const updatedCart = await cart_service_1.default.getCartByEmail(email, authEmail, role);
            await redis.set(`cart:email:${email}`, JSON.stringify(updatedCart));
            return {
                status: 200,
                jsonBody: result,
                headers: { 'Content-Type': 'application/json' },
            };
        }
        finally {
            await redis.quit();
        }
    }, request, context);
}
// Add discount code to cart
async function addDiscountCode(request, context) {
    return (0, function_wrapper_1.authenticatedRouteWrapper)(async (authEmail, role) => {
        const email = request.params.email;
        const code = request.params.code;
        const discountCode = await cart_service_1.default.addDiscountCode(email, code, authEmail, role);
        const redis = await redis_cache_1.RedisCache.getInstance();
        try {
            const updatedCart = await cart_service_1.default.getCartByEmail(email, authEmail, role);
            await redis.set(`cart:email:${email}`, JSON.stringify(updatedCart));
            return {
                status: 200,
                jsonBody: discountCode,
                headers: { 'Content-Type': 'application/json' },
            };
        }
        finally {
            await redis.quit();
        }
    }, request, context);
}
// Remove discount code from cart
async function removeDiscountCode(request, context) {
    return (0, function_wrapper_1.authenticatedRouteWrapper)(async (authEmail, role) => {
        const email = request.params.email;
        const code = request.params.code;
        const message = await cart_service_1.default.removeDiscountCode(email, code, authEmail, role);
        const redis = await redis_cache_1.RedisCache.getInstance();
        try {
            const updatedCart = await cart_service_1.default.getCartByEmail(email, authEmail, role);
            await redis.set(`cart:email:${email}`, JSON.stringify(updatedCart));
            return {
                status: 200,
                jsonBody: message,
                headers: { 'Content-Type': 'application/json' },
            };
        }
        finally {
            await redis.quit();
        }
    }, request, context);
}
// Convert cart to order
async function convertCartToOrder(request, context) {
    return (0, function_wrapper_1.authenticatedRouteWrapper)(async (authEmail, role) => {
        const email = request.params.email;
        const paymentStatus = request.query.get('paymentStatus');
        if (!paymentStatus) {
            return {
                status: 400,
                jsonBody: { message: 'Payment status is required.' },
                headers: { 'Content-Type': 'application/json' },
            };
        }
        const order = await cart_service_1.default.convertCartToOrder(email, paymentStatus, authEmail, role);
        return {
            status: 200,
            jsonBody: order,
            headers: { 'Content-Type': 'application/json' },
        };
    }, request, context);
}
// Health check endpoint
async function getStatus(request, context) {
    return {
        status: 200,
        jsonBody: { status: 'App running' },
        headers: { 'Content-Type': 'application/json' },
    };
}
// Register all cart-related functions
functions_1.app.http('getCarts', {
    route: 'carts',
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: getCarts,
});
functions_1.app.http('getCartById', {
    route: 'carts/{id}',
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: getCartById,
});
functions_1.app.http('getCartByEmail', {
    route: 'carts/email/{email}',
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: getCartByEmail,
});
functions_1.app.http('addCartItem', {
    route: 'carts/addItems/{email}/{productId}/{quantity}',
    methods: ['PUT'],
    authLevel: 'anonymous',
    handler: addCartItem,
});
functions_1.app.http('removeCartItem', {
    route: 'carts/removeItems/{email}/{productId}/{quantity}',
    methods: ['PUT'],
    authLevel: 'anonymous',
    handler: removeCartItem,
});
functions_1.app.http('addDiscountCode', {
    route: 'carts/addDiscountCode/{email}/{code}',
    methods: ['PUT'],
    authLevel: 'anonymous',
    handler: addDiscountCode,
});
functions_1.app.http('removeDiscountCode', {
    route: 'carts/removeDiscountCode/{email}/{code}',
    methods: ['PUT'],
    authLevel: 'anonymous',
    handler: removeDiscountCode,
});
functions_1.app.http('convertCartToOrder', {
    route: 'carts/convertToOrder/{email}',
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: convertCartToOrder,
});
functions_1.app.http('getStatus', {
    route: 'carts/status',
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: getStatus,
});
//# sourceMappingURL=cart.functions.js.map