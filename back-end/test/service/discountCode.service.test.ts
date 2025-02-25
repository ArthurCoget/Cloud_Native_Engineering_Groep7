import { DiscountCode } from '../../model/discountCode';
import discountCodeService from '../../service/discountCode.service';
import discountCodeDb from '../../repository/discountCode.db';

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

let percentageDiscountCode: DiscountCode;
let fixedDiscountCode: DiscountCode;

let mockDiscountCodeDbGetDiscountCodes: jest.Mock;
let mockDiscountCodeDbGetDiscountCodeById: jest.Mock;
let mockDiscountCodeDbGetDiscountCodeByCode: jest.Mock;
let mockDiscountCodeDbCreateDiscountCode: jest.Mock;
let mockDiscountCodeDbUpdateDiscountCode: jest.Mock;
let mockDiscountCodeDbDeleteDiscountCode: jest.Mock;

beforeEach(() => {
    percentageDiscountCode = new DiscountCode(percentageDiscountTestData);
    fixedDiscountCode = new DiscountCode(fixedDiscountTestData);

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

test('given discount codes in the DB, when getting all discount codes, then all discount codes are returned', async () => {
    discountCodeDb.getDiscountCodes = mockDiscountCodeDbGetDiscountCodes.mockResolvedValue([
        percentageDiscountCode,
        fixedDiscountCode,
    ]);

    const result = await discountCodeService.getDiscountCodes('salesman@example.com', 'salesman');

    expect(result).toEqual([percentageDiscountCode, fixedDiscountCode]);
    expect(mockDiscountCodeDbGetDiscountCodes).toHaveBeenCalled();
});

test('given a discount code exists in the DB, when getting a discount code by code, then that discount code is returned', async () => {
    discountCodeDb.getDiscountCodeByCode =
        mockDiscountCodeDbGetDiscountCodeByCode.mockResolvedValue(percentageDiscountCode);

    const result = await discountCodeService.getDiscountCodeByCode(
        'SAVE10',
        'salesman@example.com',
        'salesman'
    );

    expect(result).toEqual(percentageDiscountCode);
    expect(mockDiscountCodeDbGetDiscountCodeByCode).toHaveBeenCalledWith({ code: 'SAVE10' });
});

test('given discount codes in the DB, when getting an invalid discount code by code, then an error is thrown', async () => {
    discountCodeDb.getDiscountCodeByCode =
        mockDiscountCodeDbGetDiscountCodeByCode.mockResolvedValue(null);

    const getDiscountCode = async () =>
        await discountCodeService.getDiscountCodeByCode(
            'INVALIDCODE',
            'salesman@example.com',
            'salesman'
        );

    await expect(getDiscountCode).rejects.toThrow(
        'Discountcode with code INVALIDCODE does not exist.'
    );
    expect(mockDiscountCodeDbGetDiscountCodeByCode).toHaveBeenCalledWith({ code: 'INVALIDCODE' });
});

test('given no existing discount code with the same code, when creating a new discount code, then the discount code is created successfully', async () => {
    const newDiscountCodeData = {
        code: 'SAVE15',
        type: 'percentage',
        value: 15,
        expirationDate: new Date(new Date().getTime() + 48 * 60 * 60 * 1000),
        isActive: true,
    };
    const newDiscountCode = new DiscountCode(newDiscountCodeData);

    discountCodeDb.getDiscountCodeByCode =
        mockDiscountCodeDbGetDiscountCodeByCode.mockResolvedValue(null);
    discountCodeDb.createDiscountCode =
        mockDiscountCodeDbCreateDiscountCode.mockResolvedValue(newDiscountCode);

    const result = await discountCodeService.createDiscountCode(
        newDiscountCodeData,
        'salesman@example.com',
        'salesman'
    );

    expect(result).toEqual(newDiscountCode);
    expect(mockDiscountCodeDbGetDiscountCodeByCode).toHaveBeenCalledWith({ code: 'SAVE15' });
    expect(mockDiscountCodeDbCreateDiscountCode).toHaveBeenCalledWith(newDiscountCode);
});

test('given an existing discount code, when creating a discount code with the same code, then an error is thrown', async () => {
    discountCodeDb.getDiscountCodeByCode =
        mockDiscountCodeDbGetDiscountCodeByCode.mockResolvedValue(percentageDiscountCode);

    const createDiscountCode = async () => {
        await discountCodeService.createDiscountCode(
            percentageDiscountTestData,
            'salesman@example.com',
            'salesman'
        );
    };

    await expect(createDiscountCode).rejects.toThrow(
        'A discountcode with this code already exists.'
    );
    expect(mockDiscountCodeDbGetDiscountCodeByCode).toHaveBeenCalledWith({ code: 'SAVE10' });
});

test('given an existing discount code, when updating it with valid data, then the discount code is updated successfully', async () => {
    const updatedDiscountCodeData = {
        id: 1,
        code: 'SAVE20',
        type: 'percentage',
        value: 20,
        expirationDate: new Date(new Date().getTime() + 48 * 60 * 60 * 1000),
        isActive: true,
    };
    const updatedDiscountCode = new DiscountCode(updatedDiscountCodeData);

    discountCodeDb.getDiscountCodeByCode =
        mockDiscountCodeDbGetDiscountCodeByCode.mockResolvedValue(percentageDiscountCode);
    discountCodeDb.updateDiscountCode =
        mockDiscountCodeDbUpdateDiscountCode.mockResolvedValue(updatedDiscountCode);

    const result = await discountCodeService.updateDiscountCode(
        'SAVE10',
        updatedDiscountCodeData,
        'salesman@example.com',
        'salesman'
    );

    expect(result).toEqual(updatedDiscountCode);
    expect(mockDiscountCodeDbGetDiscountCodeByCode).toHaveBeenCalledWith({ code: 'SAVE10' });
    expect(mockDiscountCodeDbUpdateDiscountCode).toHaveBeenCalledWith(updatedDiscountCode);
});

test('given no discount code with the current code, when updating a discount code, then an error is thrown', async () => {
    const updatedDiscountCodeData = {
        id: 1,
        code: 'SAVE20',
        type: 'percentage',
        value: 20,
        expirationDate: new Date(new Date().getTime() + 48 * 60 * 60 * 1000),
        isActive: true,
    };
    discountCodeDb.getDiscountCodeByCode =
        mockDiscountCodeDbGetDiscountCodeByCode.mockResolvedValue(null);

    const updateDiscountCode = async () => {
        await discountCodeService.updateDiscountCode(
            'INVALIDCODE',
            updatedDiscountCodeData,
            'salesman@example.com',
            'salesman'
        );
    };

    await expect(updateDiscountCode).rejects.toThrow('This discountcode does not exist.');
    expect(mockDiscountCodeDbGetDiscountCodeByCode).toHaveBeenCalledWith({ code: 'INVALIDCODE' });
});

test('given an existing discount code, when deleting it, then the discount code is deleted successfully', async () => {
    discountCodeDb.getDiscountCodeByCode =
        mockDiscountCodeDbGetDiscountCodeByCode.mockResolvedValue(percentageDiscountCode);
    discountCodeDb.deleteDiscountCode = mockDiscountCodeDbDeleteDiscountCode.mockResolvedValue(
        'DiscountCode has been deleted.'
    );

    const result = await discountCodeService.deleteDiscountCode(
        'SAVE10',
        'salesman@example.com',
        'salesman'
    );

    expect(result).toBe('DiscountCode has been deleted.');
    expect(mockDiscountCodeDbGetDiscountCodeByCode).toHaveBeenCalledWith({ code: 'SAVE10' });
    expect(mockDiscountCodeDbDeleteDiscountCode).toHaveBeenCalledWith({ code: 'SAVE10' });
});

test('given no discount code with the specified code, when deleting a discount code, then an error is thrown', async () => {
    discountCodeDb.getDiscountCodeByCode =
        mockDiscountCodeDbGetDiscountCodeByCode.mockResolvedValue(null);

    const deleteDiscountCode = async () => {
        await discountCodeService.deleteDiscountCode(
            'INVALIDCODE',
            'salesman@example.com',
            'salesman'
        );
    };

    await expect(deleteDiscountCode).rejects.toThrow('This discountcode does not exist.');
    expect(mockDiscountCodeDbGetDiscountCodeByCode).toHaveBeenCalledWith({ code: 'INVALIDCODE' });
});

test('given non-salesman role, when getting all discount codes, then UnauthorizedError is thrown', async () => {
    const getDiscountCodes = async () => {
        await discountCodeService.getDiscountCodes('user@example.com', 'customer');
    };

    await expect(getDiscountCodes).rejects.toThrowError(
        'You must be a salesman to access discount codes.'
    );
});

test('given non-salesman role, when getting a discount code by code, then UnauthorizedError is thrown', async () => {
    const getDiscountCodeByCode = async () => {
        await discountCodeService.getDiscountCodeByCode('SAVE10', 'user@example.com', 'customer');
    };

    await expect(getDiscountCodeByCode).rejects.toThrowError(
        'You must be a salesman to access discount codes.'
    );
});

test('given non-salesman role, when creating a discount code, then UnauthorizedError is thrown', async () => {
    const newDiscountCodeData = {
        code: 'SAVE15',
        type: 'percentage',
        value: 15,
        expirationDate: new Date(new Date().getTime() + 48 * 60 * 60 * 1000),
        isActive: true,
    };

    const createDiscountCode = async () => {
        await discountCodeService.createDiscountCode(
            newDiscountCodeData,
            'user@example.com',
            'customer'
        );
    };

    await expect(createDiscountCode).rejects.toThrowError(
        'You must be a salesman to access discount codes.'
    );
});

test('given non-salesman role, when updating a discount code, then UnauthorizedError is thrown', async () => {
    const updatedDiscountCodeData = {
        code: 'SAVE20',
        type: 'percentage',
        value: 20,
        expirationDate: new Date(new Date().getTime() + 48 * 60 * 60 * 1000),
        isActive: true,
    };

    const updateDiscountCode = async () => {
        await discountCodeService.updateDiscountCode(
            'SAVE10',
            updatedDiscountCodeData,
            'user@example.com',
            'customer'
        );
    };

    await expect(updateDiscountCode).rejects.toThrowError(
        'You must be a salesman to access discount codes.'
    );
});

test('given non-salesman role, when deleting a discount code, then UnauthorizedError is thrown', async () => {
    const deleteDiscountCode = async () => {
        await discountCodeService.deleteDiscountCode('SAVE10', 'user@example.com', 'customer');
    };

    await expect(deleteDiscountCode).rejects.toThrowError(
        'You must be a salesman to access discount codes.'
    );
});
