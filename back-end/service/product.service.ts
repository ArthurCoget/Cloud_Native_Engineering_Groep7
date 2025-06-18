import { UnauthorizedError } from 'express-jwt';
import { Product } from '../model/product';
import productDb from '../repository/product.db';
import { ProductInput, Role } from '../types';
import customerService from './customer.service';
import { CosmosProductRepository } from '../repository/cosmos-product-repository';
import { Review } from '../model/review';


const getCosmosRepo = async () => await CosmosProductRepository.getInstance();

const createProduct = async (
    { name, price, stock, categories, description, images, sizes, colors, reviews }: ProductInput,
    email: string,
    role: Role
): Promise<Product> => {
    if (role === 'admin') {
         const repo = await getCosmosRepo();

        const exists = await repo.productExists(name);
        if (exists) throw new Error('A product with this name already exists.');

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
            id: Date.now(),
        });

        return await repo.createProduct(product);
    } else {
        throw new UnauthorizedError('credentials_required', {
            message: 'You must be an admin to manage products.',
        });
    }
};

const getProducts = async (): Promise<Product[]> => {
    const repo = await getCosmosRepo();
    console.log('b')
    return await repo.getAllProducts();
};

const getProductById = async (id: number): Promise<Product> => {
    const repo = await getCosmosRepo();
    return await repo.getProductById(id);
};

const updateProduct = async (
    id: number,
    productData: Partial<ProductInput>,
    email: string,
    role: Role
): Promise<Product> => {
    if (role !== 'admin') {
        throw new UnauthorizedError('credentials_required', {
            message: 'You must be an admin to manage products.',
        });
    }

    const repo = await getCosmosRepo();
    const product = await repo.getProductById(id);

    product.validate({
        name: productData.name || product.getName(),
        price: productData.price || product.getPrice(),
        stock: productData.stock || product.getStock(),
        categories: productData.categories || product.getCategories(),
        description: productData.description || product.getDescription(),
        images: productData.images || product.getImages(),
        sizes: productData.sizes || product.getSizes(),
        colors: productData.colors || product.getColors(),
    });

    if (productData.name) product.setName(productData.name);
    if (productData.price) product.setPrice(productData.price);
    if (productData.stock) product.setStock(productData.stock);
    if (productData.categories) product.setCategories(productData.categories);
    if (productData.description) product.setDescription(productData.description);
    if (productData.images) product.setImages(productData.images);
    if (productData.sizes) product.setSizes(productData.sizes);
    if (productData.colors) product.setColors(productData.colors);

    return await repo.updateProduct(product);
};


const deleteProduct = async (productId: number, email: string, role: Role): Promise<string> => {
    if (role !== 'admin') {
        throw new UnauthorizedError('credentials_required', {
            message: 'You must be an admin to manage products.',
        });
    }

    const repo = await getCosmosRepo();
    const success = await repo.deleteProduct(productId);

    if (!success) throw new Error('Failed to delete product.');

    return 'Product has been deleted.';
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

    const repo = await getCosmosRepo();
    const product = await repo.getProductById(productId);

    const reviewToAdd = new Review({
        id: Date.now(), 
        rating,
        comment,
        productId,
        customerId: userId,
        createdAt: new Date(),
    });
    product.addReview(reviewToAdd);

    return await repo.updateProduct(product);
};

export default {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    addReviewToProduct,
};
