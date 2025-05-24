"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const review_1 = require("./review");
class Product {
    constructor(data) {
        var _a;
        this.validate(data);
        this.id = data.id;
        this.name = data.name;
        this.price = data.price;
        this.stock = data.stock;
        this.categories = data.categories;
        this.description = data.description;
        this.images = data.images;
        this.sizes = data.sizes;
        this.colors = data.colors;
        this.reviews = (_a = data.reviews) !== null && _a !== void 0 ? _a : [];
    }
    // getters...
    getId() {
        return this.id;
    }
    getName() {
        return this.name;
    }
    getPrice() {
        return this.price;
    }
    getStock() {
        return this.stock;
    }
    getCategories() {
        return this.categories;
    }
    getDescription() {
        return this.description;
    }
    getImages() {
        return this.images;
    }
    getSizes() {
        return this.sizes;
    }
    getColors() {
        return this.colors;
    }
    getReviews() {
        return this.reviews ? this.reviews : [];
    }
    getAverageRating() {
        if (!this.reviews || this.reviews.length === 0)
            return 0;
        const totalRating = this.reviews.reduce((sum, review) => sum + review.getRating(), 0);
        return parseFloat((totalRating / this.reviews.length).toFixed(1));
    }
    getReviewCount() {
        return this.reviews ? this.reviews.length : 0;
    }
    // getReviewById(reviewId: number): DomainReview | undefined {
    //     return this.reviews.find((review) => review.getId() === reviewId);
    // }
    getReviewByCustomerId(customerId) {
        if (!this.reviews)
            return undefined;
        return this.reviews.find((r) => r.getCustomer().getId() === customerId);
    }
    // getReviewByUserId(userId: number): DomainReview | undefined {
    //     return this.reviews.find((review) => review.getUserId() === userId);
    // }
    setName(name) {
        this.name = name;
    }
    setPrice(price) {
        this.price = price;
    }
    setStock(stock) {
        this.stock = stock;
    }
    setCategories(categories) {
        this.categories = categories;
    }
    setDescription(description) {
        this.description = description;
    }
    setImages(images) {
        this.images = images;
    }
    setSizes(sizes) {
        this.sizes = sizes;
    }
    setColors(colors) {
        this.colors = colors;
    }
    setReviews(reviews) {
        this.reviews = reviews;
    }
    addReview(review) {
        if (!this.reviews)
            this.reviews = [];
        this.reviews.push(review);
    }
    removeReview(reviewId) {
        if (!this.reviews)
            return;
        this.reviews = this.reviews.filter((review) => review.getId() !== reviewId);
    }
    updateReview(reviewId, updatedReview) {
        if (!this.reviews)
            return;
        const index = this.reviews.findIndex((review) => review.getId() === reviewId);
        if (index !== -1) {
            this.reviews[index] = updatedReview;
        }
    }
    // Validation logic
    validate(product) {
        if (!product.name.trim())
            throw new Error('The product name is required.');
        if (product.name.length < 2 || product.name.length > 50)
            throw new Error('The product name must be between 2 and 50 characters.');
        if (product.price <= 0)
            throw new Error('Price must be greater than zero.');
        if (product.stock < 0)
            throw new Error('Stock must be zero or a positive number.');
        if (!product.categories.length)
            throw new Error('Product must belong to at least one category.');
        if (!product.description.trim())
            throw new Error('The product description is required.');
        const VALID_IMAGES = [
            'shoes',
            'shirt',
            'hoodie',
            'watch',
            'jeans',
            'gloves',
            'cap',
            'socks',
            '3d-glasses',
            'coog-glasses',
            'heart-shirt',
            'pearl-necklace',
            'sports-shoe',
            'watch2',
            'bag',
            'dress',
            'polo',
            'silver-ring',
            'sweater',
            'watch3',
            'beanie',
            'gloves2',
            'santa-hat',
            'skibidi-sunglasses',
            'swimming-short',
            'watch4',
            'bow',
            'kid-shirt',
            'skinny-jeans',
            'top-hat',
            'watch5',
            'hat',
            'kid-shoe',
            'shirt3',
            'skirt',
            'ugly-sweater',
            'ugly-shirt',
            'wishlist',
            'classic-shoe',
            'hat2',
            'work-shoe',
            'none',
        ];
        if (!VALID_IMAGES.includes(product.images.trim())) {
            throw new Error(`${product.images.trim()} is not a valid image. Valid images are: ${VALID_IMAGES.join(', ')}.`);
        }
        if (!product.sizes.length)
            throw new Error('Product must be available in at least one size.');
        const ALLOWED_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'One Size'];
        if (!product.sizes.every((size) => ALLOWED_SIZES.includes(size) || /^\d+$/.test(size))) {
            throw new Error(`Invalid sizes: ${product.sizes.join(', ')}. Allowed: ${ALLOWED_SIZES.join(', ')} or numbers.`);
        }
        if (!product.colors.length)
            throw new Error('Product must be available in at least one color.');
    }
    updateStock(delta) {
        const newStock = this.stock + delta;
        if (newStock < 0)
            throw new Error('Not enough stock available.');
        this.stock = newStock;
    }
    addStock(amount) {
        if (amount <= 0)
            throw new Error('Invalid quantity to add.');
        this.stock += amount;
    }
    static from(rec) {
        var _a, _b;
        return new Product({
            id: rec.id,
            name: rec.name,
            price: rec.price,
            stock: rec.stock,
            categories: rec.categories,
            description: rec.description,
            images: rec.images,
            sizes: rec.sizes,
            colors: rec.colors,
            // map each raw review record into your domain Review
            reviews: (_b = (_a = rec.reviews) === null || _a === void 0 ? void 0 : _a.map((r) => review_1.Review.from(r))) !== null && _b !== void 0 ? _b : [],
        });
    }
}
exports.Product = Product;
