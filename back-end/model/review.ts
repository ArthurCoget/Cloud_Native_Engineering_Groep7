import {
    Customer as CustomerPrisma,
    Review as PrismaReview,
    Product as ProductPrisma,
} from '@prisma/client';
import { Customer } from './customer';
import { Product } from './product';

export class Review {
    private id: number;
    private productId: number;
    private rating: number;
    private comment?: string;
    private customer: Customer;
    private product: Product;
    private createdAt: Date;

    constructor(review: {
        id: number;
        productId: number;
        rating: number;
        comment?: string;
        customer: Customer;
        product: Product;
        createdAt: Date;
    }) {
        this.validate(review);
        this.id = review.id;
        this.productId = review.productId;
        this.rating = review.rating;
        this.comment = review.comment;
        this.customer = review.customer;
        this.product = review.product;
        this.createdAt = review.createdAt;
    }

    getId(): number | undefined {
        return this.id;
    }

    getProductId(): number {
        return this.productId;
    }

    getCreatedAt(): Date {
        return this.createdAt;
    }
    getRating(): number {
        return this.rating;
    }
    getComment(): string | undefined {
        return this.comment;
    }
    getCustomer(): Customer {
        return this.customer;
    }
    getProduct(): Product {
        return this.product;
    }

    setId(id: number): void {
        this.id = id;
    }

    setProductId(productId: number): void {
        this.productId = productId;
    }

    setCustomer(customer: Customer): void {
        this.customer = customer;
    }

    setRating(rating: number): void {
        this.rating = rating;
    }

    setComment(comment: string): void {
        this.comment = comment;
    }

    setProduct(product: Product): void {
        this.product = product;
    }

    setCreatedAt(createdAt: Date): void {
        this.createdAt = createdAt;
    }
    validate(review: { productId: number; rating: number; comment?: string }) {
        if (review.rating < 1 || review.rating > 5) {
            throw new Error('Rating must be between 1 and 5');
        }
        if (review.comment && review.comment.length > 500) {
            throw new Error('Comment must be less than 500 characters');
        }
    }

    static from({
        id,
        productId,
        rating,
        comment,
        createdAt,
        customer,
        product,
    }: PrismaReview & { customer: CustomerPrisma; product: ProductPrisma }) {
        return new Review({
            id,
            productId,
            rating,
            comment: comment || undefined,
            createdAt,
            customer: Customer.fromWithoutWishlist(customer),
            product: Product.from(product),
        });
    }
}
