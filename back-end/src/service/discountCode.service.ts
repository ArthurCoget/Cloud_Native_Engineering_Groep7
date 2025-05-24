import { UnauthorizedError } from 'express-jwt';
import { DiscountCode } from '../model/discountCode';
import discountCodeDB from '../repository/discountCode.db';
import { DiscountCodeInput, Role } from '../types';

const getDiscountCodes = async (email: string, role: Role): Promise<DiscountCode[]> => {
    if (role === 'salesman') {
        return await discountCodeDB.getDiscountCodes();
    } else {
        throw new UnauthorizedError('credentials_required', {
            message: 'You must be a salesman to access discount codes.',
        });
    }
};

const getDiscountCodeByCode = async (
    code: string,
    email: string,
    role: Role
): Promise<DiscountCode | null> => {
    if (role === 'salesman') {
        const discountCode = await discountCodeDB.getDiscountCodeByCode({ code });

        if (!discountCode) throw new Error(`Discountcode with code ${code} does not exist.`);

        return discountCode;
    } else {
        throw new UnauthorizedError('credentials_required', {
            message: 'You must be a salesman to access discount codes.',
        });
    }
};

const createDiscountCode = async (
    { code, type, value, expirationDate, isActive }: DiscountCodeInput,
    email: string,
    role: Role
): Promise<DiscountCode> => {
    if (role === 'salesman') {
        const existingDiscountCode = await discountCodeDB.getDiscountCodeByCode({ code });

        if (existingDiscountCode) throw new Error('A discountcode with this code already exists.');

        const discountCode = new DiscountCode({
            code,
            type,
            value,
            expirationDate,
            isActive,
        });

        return await discountCodeDB.createDiscountCode(discountCode);
    } else {
        throw new UnauthorizedError('credentials_required', {
            message: 'You must be a salesman to access discount codes.',
        });
    }
};

const updateDiscountCode = async (
    currentCode: string,
    { code, type, value, expirationDate, isActive }: DiscountCodeInput,
    email: string,
    role: Role
): Promise<DiscountCode> => {
    if (role === 'salesman') {
        const existingDiscountCode = await discountCodeDB.getDiscountCodeByCode({
            code: currentCode,
        });
        if (!existingDiscountCode) throw new Error('This discountcode does not exist.');

        const newDiscountData = {
            code,
            type,
            value,
            expirationDate,
            isActive,
        };

        existingDiscountCode.updateCode(newDiscountData);

        return await discountCodeDB.updateDiscountCode(existingDiscountCode);
    } else {
        throw new UnauthorizedError('credentials_required', {
            message: 'You must be a salesman to access discount codes.',
        });
    }
};

const deleteDiscountCode = async (code: string, email: string, role: Role): Promise<string> => {
    if (role === 'salesman') {
        const existingDiscountCode = await discountCodeDB.getDiscountCodeByCode({ code });

        if (!existingDiscountCode) throw new Error('This discountcode does not exist.');

        return await discountCodeDB.deleteDiscountCode({ code });
    } else {
        throw new UnauthorizedError('credentials_required', {
            message: 'You must be a salesman to access discount codes.',
        });
    }
};

export default {
    getDiscountCodes,
    getDiscountCodeByCode,
    createDiscountCode,
    updateDiscountCode,
    deleteDiscountCode,
};
