"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = require("@azure/functions");
const function_wrapper_1 = require("./helpers/function-wrapper");
const customer_service_1 = require("./service/customer.service");
const dotenv_1 = __importDefault(require("dotenv"));
const redis_cache_1 = require("./util/redis.cache");
dotenv_1.default.config();
// Get all customers
async function getAllCustomers(request, context) {
    return (0, function_wrapper_1.authenticatedRouteWrapper)(async (authEmail, role) => {
        const cacheKey = `customers:all:${authEmail}:${role}`;
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
            const customers = await customer_service_1.CustomerService.getInstance().getCustomers(authEmail, role);
            await redis.set(cacheKey, JSON.stringify(customers));
            return {
                status: 200,
                jsonBody: customers,
                headers: { "Content-Type": "application/json", "X-Location": "DB" },
            };
        }
        finally {
            await redis.quit();
        }
    }, request, context);
}
// Get customer by email
async function getCustomerByEmail(request, context) {
    return (0, function_wrapper_1.authenticatedRouteWrapper)(async (authEmail, role) => {
        const email = request.params.email;
        const cacheKey = `customer:email:${email}:${authEmail}:${role}`;
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
            const customer = await customer_service_1.CustomerService.getInstance().getCustomerByEmail(email, authEmail, role);
            await redis.set(cacheKey, JSON.stringify(customer));
            return {
                status: 200,
                jsonBody: customer,
                headers: { "Content-Type": "application/json", "X-Location": "DB" },
            };
        }
        finally {
            await redis.quit();
        }
    }, request, context);
}
// Get customer wishlist
async function getCustomerWishlist(request, context) {
    return (0, function_wrapper_1.authenticatedRouteWrapper)(async (authEmail, role) => {
        const email = request.params.email;
        const cacheKey = `wishlist:email:${email}:${authEmail}:${role}`;
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
            const wishlist = await customer_service_1.CustomerService.getInstance().getWishlistByEmail(email, authEmail, role);
            await redis.set(cacheKey, JSON.stringify(wishlist));
            return {
                status: 200,
                jsonBody: wishlist,
                headers: { "Content-Type": "application/json", "X-Location": "DB" },
            };
        }
        finally {
            await redis.quit();
        }
    }, request, context);
}
// Create new customer
async function createCustomer(request, context) {
    try {
        const input = (await request.json());
        const newCustomer = await customer_service_1.CustomerService.getInstance().createCustomer(input);
        const redis = await redis_cache_1.RedisCache.getInstance();
        try {
            // Clear cache for all customers without auth keys, because this is a new customer
            await redis.delete("customers:all*");
        }
        finally {
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
    }
    catch (err) {
        return {
            status: err.message?.includes("exists") ? 400 : 500,
            jsonBody: { message: err.message || "Signup failed." },
            headers: { "Content-Type": "application/json" },
        };
    }
}
// Customer login
async function loginCustomer(request, context) {
    try {
        const input = (await request.json());
        const response = await customer_service_1.CustomerService.getInstance().authenticate(input);
        return {
            status: 200,
            jsonBody: response,
            headers: { "Content-Type": "application/json" },
        };
    }
    catch (err) {
        return {
            status: 401,
            jsonBody: { message: err.message || "Login failed" },
            headers: { "Content-Type": "application/json" },
        };
    }
}
// Update customer
async function updateCustomer(request, context) {
    return (0, function_wrapper_1.authenticatedRouteWrapper)(async (authEmail, role) => {
        const email = request.params.email;
        const input = (await request.json());
        const updatedCustomer = await customer_service_1.CustomerService.getInstance().updateCustomer(email, input, authEmail, role);
        const redis = await redis_cache_1.RedisCache.getInstance();
        try {
            await redis.set(`customer:email:${email}:${authEmail}:${role}`, JSON.stringify(updatedCustomer));
            await redis.delete(`customers:all:${authEmail}:${role}`);
        }
        finally {
            await redis.quit();
        }
        return {
            status: 200,
            jsonBody: updatedCustomer,
            headers: { "Content-Type": "application/json" },
        };
    }, request, context);
}
// Add product to wishlist
async function addToWishlist(request, context) {
    return (0, function_wrapper_1.authenticatedRouteWrapper)(async (authEmail, role) => {
        const email = request.params.email;
        const productId = parseInt(request.params.productId);
        const product = await customer_service_1.CustomerService.getInstance().addProductToWishlist(email, productId, authEmail, role);
        const redis = await redis_cache_1.RedisCache.getInstance();
        try {
            await redis.delete(`wishlist:email:${email}:${authEmail}:${role}`);
        }
        finally {
            await redis.quit();
        }
        return {
            status: 200,
            jsonBody: product,
            headers: { "Content-Type": "application/json" },
        };
    }, request, context);
}
// Remove product from wishlist
async function removeFromWishlist(request, context) {
    return (0, function_wrapper_1.authenticatedRouteWrapper)(async (authEmail, role) => {
        const email = request.params.email;
        const productId = parseInt(request.params.productId);
        const result = await customer_service_1.CustomerService.getInstance().removeProductFromWishlist(email, productId, authEmail, role);
        const redis = await redis_cache_1.RedisCache.getInstance();
        try {
            await redis.delete(`wishlist:email:${email}:${authEmail}:${role}`);
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
// Register all customer-related functions
functions_1.app.http("getAllCustomers", {
    route: "customers",
    methods: ["GET"],
    authLevel: "anonymous",
    handler: getAllCustomers,
});
functions_1.app.http("getCustomerByEmail", {
    route: "customers/{email}",
    methods: ["GET"],
    authLevel: "anonymous",
    handler: getCustomerByEmail,
});
functions_1.app.http("getCustomerWishlist", {
    route: "customers/{email}/wishlist",
    methods: ["GET"],
    authLevel: "anonymous",
    handler: getCustomerWishlist,
});
functions_1.app.http("createCustomer", {
    route: "customers/signup",
    methods: ["POST"],
    authLevel: "anonymous",
    handler: createCustomer,
});
functions_1.app.http("loginCustomer", {
    route: "customers/login",
    methods: ["POST"],
    authLevel: "anonymous",
    handler: loginCustomer,
});
functions_1.app.http("updateCustomer", {
    route: "customers/{email}",
    methods: ["PUT"],
    authLevel: "anonymous",
    handler: updateCustomer,
});
functions_1.app.http("addToWishlist", {
    route: "customers/addWishlist/{email}/{productId}",
    methods: ["PUT"],
    authLevel: "anonymous",
    handler: addToWishlist,
});
functions_1.app.http("removeFromWishlist", {
    route: "customers/removeWishlist/{email}/{productId}",
    methods: ["PUT"],
    authLevel: "anonymous",
    handler: removeFromWishlist,
});
//# sourceMappingURL=customer.functions.js.map