"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = require("@azure/functions");
const customer_service_1 = __importDefault(require("../../../../service/customer.service"));
functions_1.app.http('getCustomers', {
    route: 'customers',
    methods: ['GET'],
    authLevel: 'function',
    handler: (request, context) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const auth = JSON.parse((_a = request.headers['x-auth']) !== null && _a !== void 0 ? _a : '{}');
            const customers = yield customer_service_1.default.getCustomers(auth.email, auth.role);
            return { status: 200, jsonBody: customers };
        }
        catch (error) {
            context.log.error(error);
            return { status: 500, body: 'Internal Server Error' };
        }
    })
});
