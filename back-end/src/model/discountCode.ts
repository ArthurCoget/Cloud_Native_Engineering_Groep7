import { DiscountCode as DiscountCodePrisma } from '@prisma/client';

export class DiscountCode {
    private code: string;
    private type: string;
    private value: number;
    private expirationDate: Date;
    private isActive: boolean;
    public id?: number;

    constructor(discountCode: {
        code: string;
        type: string;
        value: number;
        expirationDate: Date;
        isActive: boolean;
        id?: number;
    }) {
        this.validate(discountCode);
        this.id = discountCode.id;
        this.code = discountCode.code;
        this.type = discountCode.type;
        this.value = discountCode.value;
        this.expirationDate = discountCode.expirationDate;
        this.isActive = discountCode.isActive;
    }

    validate(discountCode: {
        code: string;
        type: string;
        value: number;
        expirationDate: Date;
        isActive: boolean;
    }) {
        if (!discountCode.code) {
            throw new Error('Discount code is required.');
        }
        if (discountCode.type !== 'fixed' && discountCode.type !== 'percentage') {
            throw new Error('Discountcode must be of type fixed or percentage.');
        }
        if (discountCode.value <= 0) {
            throw new Error('Value must be a positive number higher than zero.');
        }
        if (discountCode.type === 'percentage' && discountCode.value > 100) {
            throw new Error('Discountcode of type percentage must be between 0 and 100.');
        }
        if (discountCode.expirationDate <= new Date()) {
            throw new Error('Expiration date must be a valid future date.');
        }
    }

    getId(): number | undefined {
        return this.id;
    }
    getCode() {
        return this.code;
    }

    getType() {
        return this.type;
    }

    getValue() {
        return this.value;
    }

    getExpirationDate() {
        return this.expirationDate;
    }

    getIsActive() {
        return this.isActive;
    }

    isActiveCode() {
        return this.isActive && this.expirationDate > new Date();
    }

    deactivate() {
        this.isActive = false;
    }
    activate() {
        this.isActive = true;
    }

    updateCode(discountCode: {
        code: string;
        type: string;
        value: number;
        expirationDate: Date;
        isActive: boolean;
    }) {
        this.validate(discountCode);
        this.code = discountCode.code;
        this.type = discountCode.type;
        this.value = discountCode.value;
        this.expirationDate = discountCode.expirationDate;
        this.isActive = discountCode.isActive;
    }

    static from({ id, code, type, value, expirationDate, isActive }: DiscountCodePrisma) {
        return new DiscountCode({
            id,
            code,
            type,
            value,
            expirationDate,
            isActive,
        });
    }
}
