import { UnauthorizedError } from 'express-jwt';
import { Product } from '../model/product';
import productDb from '../repository/product.db';
import { ProductInput, Role } from '../types';
import customerService from './customer.service';

const createProduct = async (
    { name, price, stock, categories, description, images, sizes, colors, reviews }: ProductInput,
    email: string,
    role: Role
): Promise<Product> => {
    if (role === 'admin') {
        const existingProduct = await productDb.getProductByName({ name });

        if (existingProduct) throw new Error('A product with this name already exists.');

        const productId = (await productDb.getProducts()).length + 1;

        const product = new Product({
            name,
            price,
            stock,
            categories,
            description,
            images,
            sizes,
            colors,
            reviews: [],
            id: productId,
        });

        return productDb.createProduct(product);
    } else {
        throw new UnauthorizedError('credentials_required', {
            message: 'You must be an admin to manage products.',
        });
    }
};

const getProducts = async (): Promise<Product[]> => await productDb.getProducts();

const getProductById = async (id: number): Promise<Product> => {
    const product = await productDb.getProductById({ id });

    if (!product) throw new Error(`Product with id ${id} does not exist.`);

    return product;
};

const updateProduct = async (
    id: number,
    productData: Partial<ProductInput>,
    email: string,
    role: Role
): Promise<Product> => {
    if (role === 'admin') {
        const existingProduct = await productDb.getProductById({ id });

        if (!existingProduct) throw new Error(`Product with id ${id} does not exist.`);

        existingProduct.validate({
            name: productData.name || existingProduct.getName(),
            price: productData.price || existingProduct.getPrice(),
            stock: productData.stock || existingProduct.getStock(),
            categories: productData.categories || existingProduct.getCategories(),
            description: productData.description || existingProduct.getDescription(),
            images: productData.images || existingProduct.getImages(),
            sizes: productData.sizes || existingProduct.getSizes(),
            colors: productData.colors || existingProduct.getColors(),
        });

        if (productData.name) existingProduct.setName(productData.name);
        if (productData.price) existingProduct.setPrice(productData.price);
        if (productData.stock) existingProduct.setStock(productData.stock);
        if (productData.categories) existingProduct.setCategories(productData.categories);
        if (productData.description) existingProduct.setDescription(productData.description);
        if (productData.images) existingProduct.setImages(productData.images);
        if (productData.sizes) existingProduct.setSizes(productData.sizes);
        if (productData.colors) existingProduct.setColors(productData.colors);

        return await productDb.updateProduct(existingProduct);
    } else {
        throw new UnauthorizedError('credentials_required', {
            message: 'You must be an admin to manage products.',
        });
    }
};

const deleteProduct = async (productId: number, email: string, role: Role): Promise<string> => {
    if (role === 'admin') {
        const existingProduct = await productDb.getProductById({ id: productId });

        if (!existingProduct) throw new Error('This product does not exist.');

        return await productDb.deleteProduct({ id: productId });
    } else {
        throw new UnauthorizedError('credentials_required', {
            message: 'You must be an admin to manage products.',
        });
    }
};

const addReviewToProduct = async (
    productId: number,
    rating: number,
    comment: string,
    email: string,
    role: Role
): Promise<Product> => {
    if (!productId) throw new Error('The product id is incorrect.');

    if (rating < 1 || rating > 5) throw new Error('The rating must be between 1 and 5');
    const user = await customerService.getCustomerByEmail(email, email, role);
    const userId = user?.getId();
    if (!user || userId === undefined) throw new Error('The user does not exist.');

    const updatedProduct = await productDb.addReviewToProduct(productId, userId, rating, comment);

    if (!updatedProduct) throw new Error('Failed to add review to product.');

    return updatedProduct;
};

export default {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    addReviewToProduct,
};
