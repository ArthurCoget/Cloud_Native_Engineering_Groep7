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
const discountCode_1 = require("../../model/discountCode");
const discountCode_service_1 = __importDefault(require("../../service/discountCode.service"));
const discountCode_db_1 = __importDefault(require("../../repository/discountCode.db"));
const percentageDiscountTestData = {
    id: 1,
    code: 'SAVE10',
    type: 'percentage',
    value: 10,
    expirationDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
    isActive: true,
};
const fixedDiscountTestData = {
    id: 2,
    code: 'SAVE110',
    type: 'fixed',
    value: 110,
    expirationDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
    isActive: true,
};
let percentageDiscountCode;
let fixedDiscountCode;
let mockDiscountCodeDbGetDiscountCodes;
let mockDiscountCodeDbGetDiscountCodeById;
let mockDiscountCodeDbGetDiscountCodeByCode;
let mockDiscountCodeDbCreateDiscountCode;
let mockDiscountCodeDbUpdateDiscountCode;
let mockDiscountCodeDbDeleteDiscountCode;
beforeEach(() => {
    percentageDiscountCode = new discountCode_1.DiscountCode(percentageDiscountTestData);
    fixedDiscountCode = new discountCode_1.DiscountCode(fixedDiscountTestData);
    mockDiscountCodeDbGetDiscountCodes = jest.fn();
    mockDiscountCodeDbGetDiscountCodeById = jest.fn();
    mockDiscountCodeDbGetDiscountCodeByCode = jest.fn();
    mockDiscountCodeDbCreateDiscountCode = jest.fn();
    mockDiscountCodeDbUpdateDiscountCode = jest.fn();
    mockDiscountCodeDbDeleteDiscountCode = jest.fn();
});
afterEach(() => {
    jest.clearAllMocks();
});
test('given discount codes in the DB, when getting all discount codes, then all discount codes are returned', () => __awaiter(void 0, void 0, void 0, function* () {
    discountCode_db_1.default.getDiscountCodes = mockDiscountCodeDbGetDiscountCodes.mockResolvedValue([
        percentageDiscountCode,
        fixedDiscountCode,
    ]);
    const result = yield discountCode_service_1.default.getDiscountCodes('salesman@example.com', 'salesman');
    expect(result).toEqual([percentageDiscountCode, fixedDiscountCode]);
    expect(mockDiscountCodeDbGetDiscountCodes).toHaveBeenCalled();
}));
test('given a discount code exists in the DB, when getting a discount code by code, then that discount code is returned', () => __awaiter(void 0, void 0, void 0, function* () {
    discountCode_db_1.default.getDiscountCodeByCode =
        mockDiscountCodeDbGetDiscountCodeByCode.mockResolvedValue(percentageDiscountCode);
    const result = yield discountCode_service_1.default.getDiscountCodeByCode('SAVE10', 'salesman@example.com', 'salesman');
    expect(result).toEqual(percentageDiscountCode);
    expect(mockDiscountCodeDbGetDiscountCodeByCode).toHaveBeenCalledWith({ code: 'SAVE10' });
}));
test('given discount codes in the DB, when getting an invalid discount code by code, then an error is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
    discountCode_db_1.default.getDiscountCodeByCode =
        mockDiscountCodeDbGetDiscountCodeByCode.mockResolvedValue(null);
    const getDiscountCode = () => __awaiter(void 0, void 0, void 0, function* () {
        return yield discountCode_service_1.default.getDiscountCodeByCode('INVALIDCODE', 'salesman@example.com', 'salesman');
    });
    yield expect(getDiscountCode).rejects.toThrow('Discountcode with code INVALIDCODE does not exist.');
    expect(mockDiscountCodeDbGetDiscountCodeByCode).toHaveBeenCalledWith({ code: 'INVALIDCODE' });
}));
test('given no existing discount code with the same code, when creating a new discount code, then the discount code is created successfully', () => __awaiter(void 0, void 0, void 0, function* () {
    const newDiscountCodeData = {
        code: 'SAVE15',
        type: 'percentage',
        value: 15,
        expirationDate: new Date(new Date().getTime() + 48 * 60 * 60 * 1000),
        isActive: true,
    };
    const newDiscountCode = new discountCode_1.DiscountCode(newDiscountCodeData);
    discountCode_db_1.default.getDiscountCodeByCode =
        mockDiscountCodeDbGetDiscountCodeByCode.mockResolvedValue(null);
    discountCode_db_1.default.createDiscountCode =
        mockDiscountCodeDbCreateDiscountCode.mockResolvedValue(newDiscountCode);
    const result = yield discountCode_service_1.default.createDiscountCode(newDiscountCodeData, 'salesman@example.com', 'salesman');
    expect(result).toEqual(newDiscountCode);
    expect(mockDiscountCodeDbGetDiscountCodeByCode).toHaveBeenCalledWith({ code: 'SAVE15' });
    expect(mockDiscountCodeDbCreateDiscountCode).toHaveBeenCalledWith(newDiscountCode);
}));
test('given an existing discount code, when creating a discount code with the same code, then an error is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
    discountCode_db_1.default.getDiscountCodeByCode =
        mockDiscountCodeDbGetDiscountCodeByCode.mockResolvedValue(percentageDiscountCode);
    const createDiscountCode = () => __awaiter(void 0, void 0, void 0, function* () {
        yield discountCode_service_1.default.createDiscountCode(percentageDiscountTestData, 'salesman@example.com', 'salesman');
    });
    yield expect(createDiscountCode).rejects.toThrow('A discountcode with this code already exists.');
    expect(mockDiscountCodeDbGetDiscountCodeByCode).toHaveBeenCalledWith({ code: 'SAVE10' });
}));
test('given an existing discount code, when updating it with valid data, then the discount code is updated successfully', () => __awaiter(void 0, void 0, void 0, function* () {
    const updatedDiscountCodeData = {
        id: 1,
        code: 'SAVE20',
        type: 'percentage',
        value: 20,
        expirationDate: new Date(new Date().getTime() + 48 * 60 * 60 * 1000),
        isActive: true,
    };
    const updatedDiscountCode = new discountCode_1.DiscountCode(updatedDiscountCodeData);
    discountCode_db_1.default.getDiscountCodeByCode =
        mockDiscountCodeDbGetDiscountCodeByCode.mockResolvedValue(percentageDiscountCode);
    discountCode_db_1.default.updateDiscountCode =
        mockDiscountCodeDbUpdateDiscountCode.mockResolvedValue(updatedDiscountCode);
    const result = yield discountCode_service_1.default.updateDiscountCode('SAVE10', updatedDiscountCodeData, 'salesman@example.com', 'salesman');
    expect(result).toEqual(updatedDiscountCode);
    expect(mockDiscountCodeDbGetDiscountCodeByCode).toHaveBeenCalledWith({ code: 'SAVE10' });
    expect(mockDiscountCodeDbUpdateDiscountCode).toHaveBeenCalledWith(updatedDiscountCode);
}));
test('given no discount code with the current code, when updating a discount code, then an error is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
    const updatedDiscountCodeData = {
        id: 1,
        code: 'SAVE20',
        type: 'percentage',
        value: 20,
        expirationDate: new Date(new Date().getTime() + 48 * 60 * 60 * 1000),
        isActive: true,
    };
    discountCode_db_1.default.getDiscountCodeByCode =
        mockDiscountCodeDbGetDiscountCodeByCode.mockResolvedValue(null);
    const updateDiscountCode = () => __awaiter(void 0, void 0, void 0, function* () {
        yield discountCode_service_1.default.updateDiscountCode('INVALIDCODE', updatedDiscountCodeData, 'salesman@example.com', 'salesman');
    });
    yield expect(updateDiscountCode).rejects.toThrow('This discountcode does not exist.');
    expect(mockDiscountCodeDbGetDiscountCodeByCode).toHaveBeenCalledWith({ code: 'INVALIDCODE' });
}));
test('given an existing discount code, when deleting it, then the discount code is deleted successfully', () => __awaiter(void 0, void 0, void 0, function* () {
    discountCode_db_1.default.getDiscountCodeByCode =
        mockDiscountCodeDbGetDiscountCodeByCode.mockResolvedValue(percentageDiscountCode);
    discountCode_db_1.default.deleteDiscountCode = mockDiscountCodeDbDeleteDiscountCode.mockResolvedValue('DiscountCode has been deleted.');
    const result = yield discountCode_service_1.default.deleteDiscountCode('SAVE10', 'salesman@example.com', 'salesman');
    expect(result).toBe('DiscountCode has been deleted.');
    expect(mockDiscountCodeDbGetDiscountCodeByCode).toHaveBeenCalledWith({ code: 'SAVE10' });
    expect(mockDiscountCodeDbDeleteDiscountCode).toHaveBeenCalledWith({ code: 'SAVE10' });
}));
test('given no discount code with the specified code, when deleting a discount code, then an error is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
    discountCode_db_1.default.getDiscountCodeByCode =
        mockDiscountCodeDbGetDiscountCodeByCode.mockResolvedValue(null);
    const deleteDiscountCode = () => __awaiter(void 0, void 0, void 0, function* () {
        yield discountCode_service_1.default.deleteDiscountCode('INVALIDCODE', 'salesman@example.com', 'salesman');
    });
    yield expect(deleteDiscountCode).rejects.toThrow('This discountcode does not exist.');
    expect(mockDiscountCodeDbGetDiscountCodeByCode).toHaveBeenCalledWith({ code: 'INVALIDCODE' });
}));
test('given non-salesman role, when getting all discount codes, then UnauthorizedError is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
    const getDiscountCodes = () => __awaiter(void 0, void 0, void 0, function* () {
        yield discountCode_service_1.default.getDiscountCodes('user@example.com', 'customer');
    });
    yield expect(getDiscountCodes).rejects.toThrowError('You must be a salesman to access discount codes.');
}));
test('given non-salesman role, when getting a discount code by code, then UnauthorizedError is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
    const getDiscountCodeByCode = () => __awaiter(void 0, void 0, void 0, function* () {
        yield discountCode_service_1.default.getDiscountCodeByCode('SAVE10', 'user@example.com', 'customer');
    });
    yield expect(getDiscountCodeByCode).rejects.toThrowError('You must be a salesman to access discount codes.');
}));
test('given non-salesman role, when creating a discount code, then UnauthorizedError is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
    const newDiscountCodeData = {
        code: 'SAVE15',
        type: 'percentage',
        value: 15,
        expirationDate: new Date(new Date().getTime() + 48 * 60 * 60 * 1000),
        isActive: true,
    };
    const createDiscountCode = () => __awaiter(void 0, void 0, void 0, function* () {
        yield discountCode_service_1.default.createDiscountCode(newDiscountCodeData, 'user@example.com', 'customer');
    });
    yield expect(createDiscountCode).rejects.toThrowError('You must be a salesman to access discount codes.');
}));
test('given non-salesman role, when updating a discount code, then UnauthorizedError is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
    const updatedDiscountCodeData = {
        code: 'SAVE20',
        type: 'percentage',
        value: 20,
        expirationDate: new Date(new Date().getTime() + 48 * 60 * 60 * 1000),
        isActive: true,
    };
    const updateDiscountCode = () => __awaiter(void 0, void 0, void 0, function* () {
        yield discountCode_service_1.default.updateDiscountCode('SAVE10', updatedDiscountCodeData, 'user@example.com', 'customer');
    });
    yield expect(updateDiscountCode).rejects.toThrowError('You must be a salesman to access discount codes.');
}));
test('given non-salesman role, when deleting a discount code, then UnauthorizedError is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
    const deleteDiscountCode = () => __awaiter(void 0, void 0, void 0, function* () {
        yield discountCode_service_1.default.deleteDiscountCode('SAVE10', 'user@example.com', 'customer');
    });
    yield expect(deleteDiscountCode).rejects.toThrowError('You must be a salesman to access discount codes.');
}));
