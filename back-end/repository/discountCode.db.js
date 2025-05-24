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
const discountCode_1 = require("../model/discountCode");
const database_1 = __importDefault(require("./database"));
const getDiscountCodes = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const discountCodesPrisma = yield database_1.default.discountCode.findMany({});
        return discountCodesPrisma.map((discountCodePrisma) => discountCode_1.DiscountCode.from(discountCodePrisma));
    }
    catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
});
const getDiscountCodeById = ({ id }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const discountCodePrisma = yield database_1.default.discountCode.findUnique({
            where: { id: id },
        });
        if (!discountCodePrisma) {
            return null;
        }
        return discountCode_1.DiscountCode.from(discountCodePrisma);
    }
    catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
});
const getDiscountCodeByCode = ({ code }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const discountCodePrisma = yield database_1.default.discountCode.findUnique({
            where: { code: code },
        });
        if (!discountCodePrisma) {
            return null;
        }
        return discountCode_1.DiscountCode.from(discountCodePrisma);
    }
    catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
});
const createDiscountCode = (discountCode) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const discountCodePrisma = yield database_1.default.discountCode.create({
            data: {
                code: discountCode.getCode(),
                type: discountCode.getType(),
                value: discountCode.getValue(),
                expirationDate: discountCode.getExpirationDate(),
                isActive: discountCode.getIsActive(),
            },
        });
        return discountCode_1.DiscountCode.from(discountCodePrisma);
    }
    catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
});
const updateDiscountCode = (updatedDiscountCode) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const discountCodePrisma = yield database_1.default.discountCode.update({
            where: { id: updatedDiscountCode.getId() },
            data: {
                code: updatedDiscountCode.getCode(),
                type: updatedDiscountCode.getType(),
                value: updatedDiscountCode.getValue(),
                expirationDate: updatedDiscountCode.getExpirationDate(),
                isActive: updatedDiscountCode.getIsActive(),
            },
        });
        return discountCode_1.DiscountCode.from(discountCodePrisma);
    }
    catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
});
const deleteDiscountCode = ({ code }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield database_1.default.discountCode.delete({
            where: { code: code },
        });
        return 'DiscountCode has been deleted.';
    }
    catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
});
exports.default = {
    getDiscountCodes,
    getDiscountCodeById,
    createDiscountCode,
    getDiscountCodeByCode,
    updateDiscountCode,
    deleteDiscountCode,
};
