import { Product } from '../model/product';
import database from './database';

const createProduct = async (product: Product): Promise<Product> => {
    try {
        const productPrisma = await database.product.create({
            data: {
                name: product.getName(),
                price: product.getPrice(),
                stock: product.getStock(),
                categories: product.getCategories(),
                description: product.getDescription(),
                images: product.getImages(),
                sizes: product.getSizes(),
                colors: product.getColors(),
            },
        });
        return Product.from(productPrisma);
    } catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
};

const getProducts = async (): Promise<Product[]> => {
    try {
        const productsPrisma = await database.product.findMany({
            include: {
                reviews: {
                    include: {
                        customer: true,
                        product: true,
                    },
                },
            },
        });
        return productsPrisma.map(Product.from);
    } catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
};

const getProductById = async ({ id }: { id: number }): Promise<Product | null> => {
    try {
        const productPrisma = await database.product.findUnique({
            where: { id: id },
            include: {
                reviews: { include: { customer: true, product: true } },
            },
        });

        if (!productPrisma) {
            return null;
        }
        return Product.from(productPrisma);
    } catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
};

const getProductByName = async ({ name }: { name: string }): Promise<Product | null> => {
    try {
        const productPrisma = await database.product.findUnique({
            where: { name: name },
            include: {
                reviews: { include: { customer: true, product: true } },
            },
        });

        if (!productPrisma) {
            return null;
        }
        return Product.from(productPrisma);
    } catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
};

const updateProduct = async (updatedProduct: Product): Promise<Product> => {
    try {
        const productPrisma = await database.product.update({
            where: { id: updatedProduct.getId() },
            data: {
                name: updatedProduct.getName(),
                price: updatedProduct.getPrice(),
                stock: updatedProduct.getStock(),
                categories: updatedProduct.getCategories(),
                description: updatedProduct.getDescription(),
                images: updatedProduct.getImages(),
                sizes: updatedProduct.getSizes(),
                colors: updatedProduct.getColors(),
            },
        });
        return Product.from(productPrisma);
    } catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
};

const deleteProduct = async ({ id }: { id: number }): Promise<string> => {
    try {
        await database.cartItem.deleteMany({
            where: { productId: id },
        });

        await database.product.delete({
            where: { id: id },
        });
        return 'Product has been deleted.';
    } catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
};

// const addRatingToProduct = async (productId: number, rating: number): Promise<Product | null> => {
//     try {
//         const updatedProductPrisma = await database.product.update({
//             where: { id: productId },
//             data: {
//                 rating: {
//                     push: rating,
//                 },
//             },
//         });
//         return Product.from(updatedProductPrisma);
//     } catch (error) {
//         console.error(error);
//         throw new Error('Database error. See server log for details.');
//     }
// };

/**
 * Instead of “pushing” into an array, we now create a Review row
 */
const addReviewToProduct = async (
    productId: number,
    customerId: number,
    rating: number,
    comment?: string
): Promise<Product> => {
    try {
        await database.review.create({
            data: {
                product: { connect: { id: productId } },
                customer: { connect: { id: customerId } },
                rating,
                comment: comment ?? null,
            },
        });

        // re‐fetch the updated product including its reviews
        const updated = await database.product.findUnique({
            where: { id: productId },
            include: { reviews: { include: { customer: true, product: true } } },
        });
        if (!updated) throw new Error('Product not found');

        return Product.from(updated);
    } catch (e) {
        console.error(e);
        throw new Error('Database error. See server log for details.');
    }
};

export default {
    createProduct,
    getProducts,
    getProductById,
    getProductByName,
    updateProduct,
    deleteProduct,
    addReviewToProduct,
};
