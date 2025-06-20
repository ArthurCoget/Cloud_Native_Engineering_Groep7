"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Review = void 0;
class Review {
    id;
    productId;
    rating;
    comment;
    customerId;
    createdAt;
    constructor(review) {
        this.validate(review);
        this.id = review.id;
        this.productId = review.productId;
        this.rating = review.rating;
        this.comment = review.comment;
        this.customerId = review.customerId;
        this.createdAt = review.createdAt;
    }
    getId() {
        return this.id;
    }
    getProductId() {
        return this.productId;
    }
    getCreatedAt() {
        return this.createdAt;
    }
    getRating() {
        return this.rating;
    }
    getComment() {
        return this.comment;
    }
    getCustomerId() {
        return this.customerId;
    }
    // getProduct(): Product {
    //     return this.product;
    // }
    setId(id) {
        this.id = id;
    }
    setProductId(productId) {
        this.productId = productId;
    }
    setCustomer(customerId) {
        this.customerId = customerId;
    }
    setRating(rating) {
        this.rating = rating;
    }
    setComment(comment) {
        this.comment = comment;
    }
    // setProduct(product: Product): void {
    //     this.product = product;
    // }
    setCreatedAt(createdAt) {
        this.createdAt = createdAt;
    }
    validate(review) {
        if (review.rating < 1 || review.rating > 5) {
            throw new Error("Rating must be between 1 and 5");
        }
        if (review.comment && review.comment.length > 500) {
            throw new Error("Comment must be less than 500 characters");
        }
    }
    static fromCosmos(doc) {
        return new Review({
            id: typeof doc.id === "string" ? parseInt(doc.id, 10) : doc.id,
            productId: doc.productId,
            rating: doc.rating,
            comment: doc.comment ?? undefined,
            customerId: doc.customerId,
            createdAt: typeof doc.createdAt === "string"
                ? new Date(doc.createdAt)
                : doc.createdAt,
        });
    }
}
exports.Review = Review;
//# sourceMappingURL=review.js.map