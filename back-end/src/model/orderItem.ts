import { CartItem } from './cartItem';
import { Order } from './order';
import { Product } from './product';
import { OrderItem as OrderItemPrisma, Product as ProductPrisma } from '@prisma/client';

export class OrderItem {
    private id?: number;
    private product: Product;
    private quantity: number;

    constructor(orderItem: { product: Product; quantity: number; id?: number }) {
        this.validate(orderItem);
        this.id = orderItem.id;
        this.product = orderItem.product;
        this.quantity = orderItem.quantity;
        this.product.updateStock(-this.quantity);
    }

    getId(): number | undefined {
        return this.id;
    }

    getProduct(): Product {
        return this.product;
    }

    getQuantity(): number {
        return this.quantity;
    }

    getTotalPrice(): number {
        return this.product.getPrice() * this.quantity;
    }

    validate(orderItem: { product: Product; quantity: number }) {
        if (!orderItem.product) {
            throw new Error('Product cannot be null or undefined.');
        }

        if (orderItem.quantity <= 0) {
            throw new Error('Quantity must be greater than zero.');
        }
    }

    static from({ id, product, quantity }: OrderItemPrisma & { product: ProductPrisma }) {
        return new OrderItem({
            id,
            product: Product.from(product),
            quantity,
        });
    }
}
