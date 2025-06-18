import {
    Customer as PrismaCustomer,
    Product as PrismaProduct,
    Review as PrismaReview,
} from '@prisma/client';
import { Review as DomainReview } from './review';
export class Product {
    private id?: number;
    private name: string;
    private price: number;
    private stock: number;
    private categories: string[];
    private description: string;
    private images: string;
    private sizes: string[];
    private colors: string[];
    private reviews?: DomainReview[];

    constructor(data: {
        id?: number;
        name: string;
        price: number;
        stock: number;
        categories: string[];
        description: string;
        images: string;
        sizes: string[];
        colors: string[];
        reviews?: DomainReview[];
    }) {
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
        this.reviews = data.reviews ?? [];
    }

    // getters...
    getId(): number | undefined {
        return this.id;
    }
    getName(): string {
        return this.name;
    }
    getPrice(): number {
        return this.price;
    }
    getStock(): number {
        return this.stock;
    }
    getCategories(): string[] {
        return this.categories;
    }
    getDescription(): string {
        return this.description;
    }
    getImages(): string {
        return this.images;
    }
    getSizes(): string[] {
        return this.sizes;
    }
    getColors(): string[] {
        return this.colors;
    }
    getReviews(): DomainReview[] {
        return this.reviews ? this.reviews : [];
    }
    getAverageRating(): number {
        if (!this.reviews || this.reviews.length === 0) return 0;
        const totalRating = this.reviews.reduce((sum, review) => sum + review.getRating(), 0);
        return parseFloat((totalRating / this.reviews.length).toFixed(1));
    }
    getReviewCount(): number {
        return this.reviews ? this.reviews.length : 0;
    }
    // getReviewById(reviewId: number): DomainReview | undefined {
    //     return this.reviews.find((review) => review.getId() === reviewId);
    // }


    /* getReviewByCustomerId(customerId: number): DomainReview | undefined {
        if (!this.reviews) return undefined;
        return this.reviews.find((r) => r.getCustomer().getId() === customerId);
    } */


    // getReviewByUserId(userId: number): DomainReview | undefined {
    //     return this.reviews.find((review) => review.getUserId() === userId);
    // }

    setId(id: number): void {
        this.id = id;
    }

    setName(name: string): void {
        this.name = name;
    }
    setPrice(price: number): void {
        this.price = price;
    }
    setStock(stock: number): void {
        this.stock = stock;
    }
    setCategories(categories: string[]): void {
        this.categories = categories;
    }
    setDescription(description: string): void {
        this.description = description;
    }
    setImages(images: string): void {
        this.images = images;
    }
    setSizes(sizes: string[]): void {
        this.sizes = sizes;
    }
    setColors(colors: string[]): void {
        this.colors = colors;
    }
    setReviews(reviews: DomainReview[]): void {
        this.reviews = reviews;
    }

    addReview(review: DomainReview): void {
        if (!this.reviews) this.reviews = [];
        this.reviews.push(review);
    }
    removeReview(reviewId: number): void {
        if (!this.reviews) return;
        this.reviews = this.reviews.filter((review) => review.getId() !== reviewId);
    }
    updateReview(reviewId: number, updatedReview: DomainReview): void {
        if (!this.reviews) return;
        const index = this.reviews.findIndex((review) => review.getId() === reviewId);
        if (index !== -1) {
            this.reviews[index] = updatedReview;
        }
    }
    // Validation logic
    public validate(product: {
        name: string;
        price: number;
        stock: number;
        categories: string[];
        description: string;
        images: string;
        sizes: string[];
        colors: string[];
    }) {
        if (!product.name.trim()) throw new Error('The product name is required.');
        if (product.name.length < 2 || product.name.length > 50)
            throw new Error('The product name must be between 2 and 50 characters.');
        if (product.price <= 0) throw new Error('Price must be greater than zero.');
        if (product.stock < 0) throw new Error('Stock must be zero or a positive number.');
        if (!product.categories.length)
            throw new Error('Product must belong to at least one category.');
        if (!product.description.trim()) throw new Error('The product description is required.');

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
            throw new Error(
                `${product.images.trim()} is not a valid image. Valid images are: ${VALID_IMAGES.join(
                    ', '
                )}.`
            );
        }

        if (!product.sizes.length)
            throw new Error('Product must be available in at least one size.');
        const ALLOWED_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'One Size'];
        if (!product.sizes.every((size) => ALLOWED_SIZES.includes(size) || /^\d+$/.test(size))) {
            throw new Error(
                `Invalid sizes: ${product.sizes.join(', ')}. Allowed: ${ALLOWED_SIZES.join(
                    ', '
                )} or numbers.`
            );
        }

        if (!product.colors.length)
            throw new Error('Product must be available in at least one color.');
    }

    updateStock(delta: number): void {
        const newStock = this.stock + delta;
        if (newStock < 0) throw new Error('Not enough stock available.');
        this.stock = newStock;
    }

    addStock(amount: number): void {
        if (amount <= 0) throw new Error('Invalid quantity to add.');
        this.stock += amount;
    }

    static from(
        rec: PrismaProduct & {
            reviews?: (PrismaReview & { customer: PrismaCustomer; product: PrismaProduct })[];
        }
    ): Product {
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
            reviews: rec.reviews?.map((r) => DomainReview.from(r)) ?? [],
        });
    }

    
}
