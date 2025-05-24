"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const product_1 = require("../model/product");
const database_1 = __importDefault(require("./database"));
const createProduct = (product) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productPrisma = yield database_1.default.product.create({
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
        return product_1.Product.from(productPrisma);
    }
    catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
});
const getProducts = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productsPrisma = yield database_1.default.product.findMany({
            include: {
                reviews: {
                    include: {
                        customer: true,
                        product: true,
                    },
                },
            },
        });
        return productsPrisma.map(product_1.Product.from);
    }
    catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
});
const getProductById = ({ id }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productPrisma = yield database_1.default.product.findUnique({
            where: { id: id },
            include: {
                reviews: { include: { customer: true, product: true } },
            },
        });
        if (!productPrisma) {
            return null;
        }
        return product_1.Product.from(productPrisma);
    }
    catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
});
const getProductByName = ({ name }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productPrisma = yield database_1.default.product.findUnique({
            where: { name: name },
            include: {
                reviews: { include: { customer: true, product: true } },
            },
        });
        if (!productPrisma) {
            return null;
        }
        return product_1.Product.from(productPrisma);
    }
    catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
});
const updateProduct = (updatedProduct) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productPrisma = yield database_1.default.product.update({
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
        return product_1.Product.from(productPrisma);
    }
    catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
});
const deleteProduct = ({ id }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield database_1.default.cartItem.deleteMany({
            where: { productId: id },
        });
        yield database_1.default.product.delete({
            where: { id: id },
        });
        return 'Product has been deleted.';
    }
    catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
});
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
const addReviewToProduct = (productId, customerId, rating, comment) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield database_1.default.review.create({
            data: {
                product: { connect: { id: productId } },
                customer: { connect: { id: customerId } },
                rating,
                comment: comment !== null && comment !== void 0 ? comment : null,
            },
        });
        // re‐fetch the updated product including its reviews
        const updated = yield database_1.default.product.findUnique({
            where: { id: productId },
            include: { reviews: { include: { customer: true, product: true } } },
        });
        if (!updated)
            throw new Error('Product not found');
        return product_1.Product.from(updated);
    }
    catch (e) {
        console.error(e);
        throw new Error('Database error. See server log for details.');
    }
});
exports.default = {
    createProduct,
    getProducts,
    getProductById,
    getProductByName,
    updateProduct,
    deleteProduct,
    addReviewToProduct,
};
