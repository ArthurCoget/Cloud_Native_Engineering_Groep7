"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discountCode_1 = require("../../model/discountCode");
const percentageDiscountTestData = {
    code: 'SAVE10',
    type: 'percentage',
    value: 10,
    expirationDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
    isActive: true,
};
const fixedDiscountTestData = {
    code: 'SAVE110',
    type: 'fixed',
    value: 110,
    expirationDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
    isActive: true,
};
let percentageDiscountCode;
let fixedDiscountCode;
beforeEach(() => {
    percentageDiscountCode = new discountCode_1.DiscountCode(percentageDiscountTestData);
    fixedDiscountCode = new discountCode_1.DiscountCode(fixedDiscountTestData);
});
test('given: valid percentage discount code, when: created, then: it initializes correctly', () => {
    expect(percentageDiscountCode.getCode()).toEqual('SAVE10');
    expect(percentageDiscountCode.getType()).toEqual('percentage');
    expect(percentageDiscountCode.getValue()).toEqual(10);
    expect(percentageDiscountCode.getExpirationDate()).toEqual(percentageDiscountTestData.expirationDate);
    expect(percentageDiscountCode.getIsActive()).toEqual(true);
});
test('given: valid fixed discount code, when: created, then: it initializes correctly', () => {
    expect(fixedDiscountCode.getCode()).toEqual('SAVE110');
    expect(fixedDiscountCode.getType()).toEqual('fixed');
    expect(fixedDiscountCode.getValue()).toEqual(110);
    expect(fixedDiscountCode.getExpirationDate()).toEqual(fixedDiscountTestData.expirationDate);
    expect(fixedDiscountCode.getIsActive()).toEqual(true);
});
test('given: a discount code, when: value is invalid, then: throws an error', () => {
    expect(() => {
        new discountCode_1.DiscountCode(Object.assign(Object.assign({}, percentageDiscountTestData), { value: -10 }));
    }).toThrow('Value must be a positive number higher than zero.');
});
test('given: a percentage discount code, when: value exceeds 100, then: throws an error', () => {
    expect(() => {
        new discountCode_1.DiscountCode(Object.assign(Object.assign({}, percentageDiscountTestData), { value: 150 }));
    }).toThrow('Discountcode of type percentage must be between 0 and 100.');
});
test('given: a discount code, when: expiration date is in the past, then: throws an error', () => {
    expect(() => {
        new discountCode_1.DiscountCode(Object.assign(Object.assign({}, percentageDiscountTestData), { expirationDate: new Date(new Date().getTime() - 24 * 60 * 60 * 1000) }));
    }).toThrow('Expiration date must be a valid future date.');
});
test('given: a discount code, when: code is missing, then: throws an error', () => {
    expect(() => {
        new discountCode_1.DiscountCode(Object.assign(Object.assign({}, percentageDiscountTestData), { code: '' }));
    }).toThrow('Discount code is required.');
});
test('given: a discount code, when: type is invalid, then: throws an error', () => {
    expect(() => {
        new discountCode_1.DiscountCode(Object.assign(Object.assign({}, percentageDiscountTestData), { type: 'invalid' }));
    }).toThrow('Discountcode must be of type fixed or percentage.');
});
test('given: a discount code, when: deactivated, then: isActiveCode returns false', () => {
    percentageDiscountCode.deactivate();
    expect(percentageDiscountCode.isActiveCode()).toBe(false);
});
test('given: a discount code, when: activated after deactivation, then: isActiveCode returns true', () => {
    percentageDiscountCode.deactivate();
    expect(percentageDiscountCode.isActiveCode()).toBe(false);
    percentageDiscountCode.activate();
    expect(percentageDiscountCode.isActiveCode()).toBe(true);
});
test('given: a discount code with expired date, when: check isActiveCode, then: isActiveCode returns false', () => {
    const expiredDiscountCode = new discountCode_1.DiscountCode(percentageDiscountTestData);
    expiredDiscountCode.expirationDate = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
    expect(expiredDiscountCode.isActiveCode()).toBe(false);
});
