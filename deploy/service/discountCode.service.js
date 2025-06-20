"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discountCode_1 = require("../model/discountCode");
const custom_error_1 = require("../model/custom-error");
const cosmos_discountCode_repository_1 = require("../repository/cosmos-discountCode-repository");
const getRepo = async () => await cosmos_discountCode_repository_1.CosmosDiscountCodeRepository.getInstance();
const authorizeSalesman = (role) => {
    if (role !== "salesman") {
        throw custom_error_1.CustomError.unauthorized("You must be a salesman to access discount codes.");
    }
};
const getDiscountCodes = async (email, role) => {
    authorizeSalesman(role);
    return (await getRepo()).getAllDiscountCodes();
};
const getDiscountCodeByCode = async (code, email, role) => {
    authorizeSalesman(role);
    const repo = await getRepo();
    const exists = await repo.discountCodeExists(code);
    if (!exists) {
        throw custom_error_1.CustomError.notFound(`Discount code with code '${code}' does not exist.`);
    }
    return repo.getDiscountCodeByCode(code);
};
const createDiscountCode = async (input, email, role) => {
    authorizeSalesman(role);
    const repo = await getRepo();
    const exists = await repo.discountCodeExists(input.code);
    if (exists) {
        throw custom_error_1.CustomError.conflict("A discount code with this code already exists.");
    }
    const discountCode = new discountCode_1.DiscountCode(input);
    return repo.createDiscountCode(discountCode);
};
const updateDiscountCode = async (currentCode, input, email, role) => {
    authorizeSalesman(role);
    const repo = await getRepo();
    const existing = await repo.getDiscountCodeByCode(currentCode);
    if (!existing) {
        throw custom_error_1.CustomError.notFound("This discount code does not exist.");
    }
    existing.updateCode(input);
    return repo.createDiscountCode(existing);
};
const deleteDiscountCode = async (code, email, role) => {
    authorizeSalesman(role);
    const repo = await getRepo();
    const exists = await repo.discountCodeExists(code);
    if (!exists) {
        throw custom_error_1.CustomError.notFound("This discount code does not exist.");
    }
    const success = await repo.deleteDiscountCode(code);
    if (!success) {
        throw custom_error_1.CustomError.internal("Failed to delete discount code.");
    }
    return `Discount code '${code}' deleted successfully.`;
};
exports.default = {
    getDiscountCodes,
    getDiscountCodeByCode,
    createDiscountCode,
    updateDiscountCode,
    deleteDiscountCode,
};
//# sourceMappingURL=discountCode.service.js.map