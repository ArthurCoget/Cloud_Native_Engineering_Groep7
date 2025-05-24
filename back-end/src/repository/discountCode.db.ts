import { DiscountCode } from '../model/discountCode';
import database from './database';

const getDiscountCodes = async (): Promise<DiscountCode[]> => {
    try {
        const discountCodesPrisma = await database.discountCode.findMany({});
        return discountCodesPrisma.map((discountCodePrisma) =>
            DiscountCode.from(discountCodePrisma)
        );
    } catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
};

const getDiscountCodeById = async ({ id }: { id: number }): Promise<DiscountCode | null> => {
    try {
        const discountCodePrisma = await database.discountCode.findUnique({
            where: { id: id },
        });

        if (!discountCodePrisma) {
            return null;
        }
        return DiscountCode.from(discountCodePrisma);
    } catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
};

const getDiscountCodeByCode = async ({ code }: { code: string }): Promise<DiscountCode | null> => {
    try {
        const discountCodePrisma = await database.discountCode.findUnique({
            where: { code: code },
        });

        if (!discountCodePrisma) {
            return null;
        }
        return DiscountCode.from(discountCodePrisma);
    } catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
};

const createDiscountCode = async (discountCode: DiscountCode): Promise<DiscountCode> => {
    try {
        const discountCodePrisma = await database.discountCode.create({
            data: {
                code: discountCode.getCode(),
                type: discountCode.getType(),
                value: discountCode.getValue(),
                expirationDate: discountCode.getExpirationDate(),
                isActive: discountCode.getIsActive(),
            },
        });
        return DiscountCode.from(discountCodePrisma);
    } catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
};

const updateDiscountCode = async (updatedDiscountCode: DiscountCode): Promise<DiscountCode> => {
    try {
        const discountCodePrisma = await database.discountCode.update({
            where: { id: updatedDiscountCode.getId() },
            data: {
                code: updatedDiscountCode.getCode(),
                type: updatedDiscountCode.getType(),
                value: updatedDiscountCode.getValue(),
                expirationDate: updatedDiscountCode.getExpirationDate(),
                isActive: updatedDiscountCode.getIsActive(),
            },
        });
        return DiscountCode.from(discountCodePrisma);
    } catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
};

const deleteDiscountCode = async ({ code }: { code: string }): Promise<string> => {
    try {
        await database.discountCode.delete({
            where: { code: code },
        });
        return 'DiscountCode has been deleted.';
    } catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
};

export default {
    getDiscountCodes,
    getDiscountCodeById,
    createDiscountCode,
    getDiscountCodeByCode,
    updateDiscountCode,
    deleteDiscountCode,
};
