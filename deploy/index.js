"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
console.log('>>> Starting Azure Functions runtime <<<');
const functions_1 = require("@azure/functions");
require("./cart.functions");
require("./customer.functions");
require("./discountCode.functions");
require("./order.functions");
require("./payment.functions");
require("./product.functions");
// import dotenv from 'dotenv';
// dotenv.config();
// Global CORS handler for OPTIONS requests
functions_1.app.http('corsPreflight', {
    route: '{*any}',
    methods: ['OPTIONS'],
    authLevel: 'anonymous',
    handler: async () => {
        return {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Max-Age': '86400',
            },
        };
    },
});
functions_1.app.http('ping', {
    route: 'ping',
    methods: ['GET'],
    handler: async () => {
        return { status: 200, body: 'pong' };
    },
});
exports.default = functions_1.app;
//# sourceMappingURL=index.js.map