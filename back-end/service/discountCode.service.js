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
const express_jwt_1 = require("express-jwt");
const discountCode_1 = require("../model/discountCode");
const discountCode_db_1 = __importDefault(require("../repository/discountCode.db"));
const getDiscountCodes = (email, role) => __awaiter(void 0, void 0, void 0, function* () {
    if (role === 'salesman') {
        return yield discountCode_db_1.default.getDiscountCodes();
    }
    else {
        throw new express_jwt_1.UnauthorizedError('credentials_required', {
            message: 'You must be a salesman to access discount codes.',
        });
    }
});
const getDiscountCodeByCode = (code, email, role) => __awaiter(void 0, void 0, void 0, function* () {
    if (role === 'salesman') {
        const discountCode = yield discountCode_db_1.default.getDiscountCodeByCode({ code });
        if (!discountCode)
            throw new Error(`Discountcode with code ${code} does not exist.`);
        return discountCode;
    }
    else {
        throw new express_jwt_1.UnauthorizedError('credentials_required', {
            message: 'You must be a salesman to access discount codes.',
        });
    }
});
const createDiscountCode = (_a, email_1, role_1) => __awaiter(void 0, [_a, email_1, role_1], void 0, function* ({ code, type, value, expirationDate, isActive }, email, role) {
    if (role === 'salesman') {
        const existingDiscountCode = yield discountCode_db_1.default.getDiscountCodeByCode({ code });
        if (existingDiscountCode)
            throw new Error('A discountcode with this code already exists.');
        const discountCode = new discountCode_1.DiscountCode({
            code,
            type,
            value,
            expirationDate,
            isActive,
        });
        return yield discountCode_db_1.default.createDiscountCode(discountCode);
    }
    else {
        throw new express_jwt_1.UnauthorizedError('credentials_required', {
            message: 'You must be a salesman to access discount codes.',
        });
    }
});
const updateDiscountCode = (currentCode_1, _a, email_1, role_1) => __awaiter(void 0, [currentCode_1, _a, email_1, role_1], void 0, function* (currentCode, { code, type, value, expirationDate, isActive }, email, role) {
    if (role === 'salesman') {
        const existingDiscountCode = yield discountCode_db_1.default.getDiscountCodeByCode({
            code: currentCode,
        });
        if (!existingDiscountCode)
            throw new Error('This discountcode does not exist.');
        const newDiscountData = {
            code,
            type,
            value,
            expirationDate,
            isActive,
        };
        existingDiscountCode.updateCode(newDiscountData);
        return yield discountCode_db_1.default.updateDiscountCode(existingDiscountCode);
    }
    else {
        throw new express_jwt_1.UnauthorizedError('credentials_required', {
            message: 'You must be a salesman to access discount codes.',
        });
    }
});
const deleteDiscountCode = (code, email, role) => __awaiter(void 0, void 0, void 0, function* () {
    if (role === 'salesman') {
        const existingDiscountCode = yield discountCode_db_1.default.getDiscountCodeByCode({ code });
        if (!existingDiscountCode)
            throw new Error('This discountcode does not exist.');
        return yield discountCode_db_1.default.deleteDiscountCode({ code });
    }
    else {
        throw new express_jwt_1.UnauthorizedError('credentials_required', {
            message: 'You must be a salesman to access discount codes.',
        });
    }
});
exports.default = {
    getDiscountCodes,
    getDiscountCodeByCode,
    createDiscountCode,
    updateDiscountCode,
    deleteDiscountCode,
};
