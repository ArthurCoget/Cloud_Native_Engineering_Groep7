import { Product as ProductPrisma } from '@prisma/client';

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
    private rating: number[];

    constructor(product: {
        name: string;
        price: number;
        stock: number;
        categories: string[];
        description: string;
        images: string;
        sizes: string[];
        colors: string[];
        rating: number[];
        id?: number;
    }) {
        this.validate(product);
        this.id = product.id;
        this.name = product.name;
        this.price = product.price;
        this.stock = product.stock;
        this.categories = product.categories;
        this.description = product.description;
        this.images = product.images;
        this.sizes = product.sizes;
        this.colors = product.colors;
        this.rating = product.rating;
    }

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

    getRating(): number[] {
        return this.rating;
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

    setRating(rating: number[]): void {
        this.rating = rating;
    }

    validate(product: {
        name: string;
        price: number;
        stock: number;
        categories: string[];
        description: string;
        images: string;
        sizes: string[];
        colors: string[];
        rating: number[];
    }) {
        if (!product.name.trim()) throw new Error('The product name is required.');

        if (product.name.length < 2 || product.name.length > 50)
            throw new Error('The product name must be between 2 and 50 characters.');

        if (product.price <= 0) {
            throw new Error('Price must be greater than zero.');
        }

        if (product.stock < 0) {
            throw new Error('Stock must be positive.');
        }

        if (product.categories.length === 0) {
            throw new Error('Product must belong to at least one categories.');
        }

        if (!product.description.trim()) throw new Error('The product description is required.');

        if (!product.images.trim()) {
            throw new Error('The product image is required.');
        }

        if (
            product.images.trim() !== 'shoes' &&
            product.images.trim() !== 'shirt' &&
            product.images.trim() !== 'hoodie' &&
            product.images.trim() !== 'watch' &&
            product.images.trim() !== 'jeans' &&
            product.images.trim() !== 'gloves' &&
            product.images.trim() !== 'cap' &&
            product.images.trim() !== 'socks' &&
            product.images.trim() !== 'none'
        ) {
            throw new Error(
                'Image must be one of the following: shoes, shirt, hoodie, watch, jeans, gloves, cap, socks or none.'
            );
        }

        if (product.sizes.length === 0) {
            throw new Error('Product must be available in at least one size.');
        }

        if (
            !product.sizes.every(
                (size) =>
                    size === 'XS' || size === 'S' || size === 'M' || size === 'L' || size === 'XL'
            )
        ) {
            throw new Error('All sizes must be "XS" or "S" or "M" or "L" or "XL".');
        }

        if (product.colors.length === 0) {
            throw new Error('Product must be available in at least one color.');
        }

        if (
            !Array.isArray(product.rating) ||
            !product.rating.every((r: number) => typeof r === 'number' && r >= 1 && r <= 5)
        ) {
            throw new Error('All ratings must be numbers between 1 and 5.');
        }
    }

    updateStock(quantityChange: number): void {
        const newStock = this.stock + quantityChange;

        if (newStock < 0) {
            throw new Error('Not enough stock available');
        }

        this.stock = newStock;
    }

    addStock(quantity: number): void {
        if (quantity <= 0) {
            throw new Error('Invalid quantity to add');
        }

        this.stock += quantity;
    }

    static from({
        id,
        name,
        price,
        stock,
        categories,
        description,
        images,
        sizes,
        colors,
        rating,
    }: ProductPrisma) {
        return new Product({
            id,
            name,
            price,
            stock,
            categories,
            description,
            images,
            sizes,
            colors,
            rating,
        });
    }
}
