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
const express_jwt_1 = require("express-jwt");
const product_1 = require("../model/product");
const product_db_1 = __importDefault(require("../repository/product.db"));
const customer_service_1 = __importDefault(require("./customer.service"));
const createProduct = ({ name, price, stock, categories, description, images, sizes, colors, reviews }, email, role) => __awaiter(void 0, void 0, void 0, function* () {
    if (role === 'admin') {
        const existingProduct = yield product_db_1.default.getProductByName({ name });
        if (existingProduct)
            throw new Error('A product with this name already exists.');
        const productId = (yield product_db_1.default.getProducts()).length + 1;
        const product = new product_1.Product({
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
        return product_db_1.default.createProduct(product);
    }
    else {
        throw new express_jwt_1.UnauthorizedError('credentials_required', {
            message: 'You must be an admin to manage products.',
        });
    }
});
const getProducts = () => __awaiter(void 0, void 0, void 0, function* () { return yield product_db_1.default.getProducts(); });
const getProductById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield product_db_1.default.getProductById({ id });
    if (!product)
        throw new Error(`Product with id ${id} does not exist.`);
    return product;
});
const updateProduct = (id, productData, email, role) => __awaiter(void 0, void 0, void 0, function* () {
    if (role === 'admin') {
        const existingProduct = yield product_db_1.default.getProductById({ id });
        if (!existingProduct)
            throw new Error(`Product with id ${id} does not exist.`);
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
        if (productData.name)
            existingProduct.setName(productData.name);
        if (productData.price)
            existingProduct.setPrice(productData.price);
        if (productData.stock)
            existingProduct.setStock(productData.stock);
        if (productData.categories)
            existingProduct.setCategories(productData.categories);
        if (productData.description)
            existingProduct.setDescription(productData.description);
        if (productData.images)
            existingProduct.setImages(productData.images);
        if (productData.sizes)
            existingProduct.setSizes(productData.sizes);
        if (productData.colors)
            existingProduct.setColors(productData.colors);
        return yield product_db_1.default.updateProduct(existingProduct);
    }
    else {
        throw new express_jwt_1.UnauthorizedError('credentials_required', {
            message: 'You must be an admin to manage products.',
        });
    }
});
const deleteProduct = (productId, email, role) => __awaiter(void 0, void 0, void 0, function* () {
    if (role === 'admin') {
        const existingProduct = yield product_db_1.default.getProductById({ id: productId });
        if (!existingProduct)
            throw new Error('This product does not exist.');
        return yield product_db_1.default.deleteProduct({ id: productId });
    }
    else {
        throw new express_jwt_1.UnauthorizedError('credentials_required', {
            message: 'You must be an admin to manage products.',
        });
    }
});
const addReviewToProduct = (productId, rating, comment, email, role) => __awaiter(void 0, void 0, void 0, function* () {
    if (!productId)
        throw new Error('The product id is incorrect.');
    if (rating < 1 || rating > 5)
        throw new Error('The rating must be between 1 and 5');
    const user = yield customer_service_1.default.getCustomerByEmail(email, email, role);
    const userId = user === null || user === void 0 ? void 0 : user.getId();
    if (!user || userId === undefined)
        throw new Error('The user does not exist.');
    const updatedProduct = yield product_db_1.default.addReviewToProduct(productId, userId, rating, comment);
    if (!updatedProduct)
        throw new Error('Failed to add review to product.');
    return updatedProduct;
});
exports.default = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    addReviewToProduct,
};
