"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Review = void 0;
const customer_1 = require("./customer");
const product_1 = require("./product");
class Review {
    constructor(review) {
        this.validate(review);
        this.id = review.id;
        this.productId = review.productId;
        this.rating = review.rating;
        this.comment = review.comment;
        this.customer = review.customer;
        this.product = review.product;
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
    getCustomer() {
        return this.customer;
    }
    getProduct() {
        return this.product;
    }
    setId(id) {
        this.id = id;
    }
    setProductId(productId) {
        this.productId = productId;
    }
    setCustomer(customer) {
        this.customer = customer;
    }
    setRating(rating) {
        this.rating = rating;
    }
    setComment(comment) {
        this.comment = comment;
    }
    setProduct(product) {
        this.product = product;
    }
    setCreatedAt(createdAt) {
        this.createdAt = createdAt;
    }
    validate(review) {
        if (review.rating < 1 || review.rating > 5) {
            throw new Error('Rating must be between 1 and 5');
        }
        if (review.comment && review.comment.length > 500) {
            throw new Error('Comment must be less than 500 characters');
        }
    }
    static from({ id, productId, rating, comment, createdAt, customer, product, }) {
        return new Review({
            id,
            productId,
            rating,
            comment: comment || undefined,
            createdAt,
            customer: customer_1.Customer.fromWithoutWishlist(customer),
            product: product_1.Product.from(product),
        });
    }
}
exports.Review = Review;
