"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_jwt_1 = require("express-jwt");
const product_1 = require("../model/product");
const customer_service_1 = require("./customer.service");
const cosmos_product_repository_1 = require("../repository/cosmos-product-repository");
const review_1 = require("../model/review");
const getCosmosRepo = async () => await cosmos_product_repository_1.CosmosProductRepository.getInstance();
const createProduct = async ({ name, price, stock, categories, description, images, sizes, colors, reviews, }, email, role) => {
    if (role === "admin") {
        const repo = await getCosmosRepo();
        const exists = await repo.productExists(name);
        if (exists)
            throw new Error("A product with this name already exists.");
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
            id: Date.now(),
        });
        return await repo.createProduct(product);
    }
    else {
        throw new express_jwt_1.UnauthorizedError("credentials_required", {
            message: "You must be an admin to manage products.",
        });
    }
};
const getProducts = async () => {
    const repo = await getCosmosRepo();
    console.log("b");
    return await repo.getAllProducts();
};
const getProductById = async (id) => {
    const repo = await getCosmosRepo();
    return await repo.getProductById(id);
};
const updateProduct = async (id, productData, email, role) => {
    if (role !== "admin") {
        throw new express_jwt_1.UnauthorizedError("credentials_required", {
            message: "You must be an admin to manage products.",
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
    if (productData.name)
        product.setName(productData.name);
    if (productData.price)
        product.setPrice(productData.price);
    if (productData.stock)
        product.setStock(productData.stock);
    if (productData.categories)
        product.setCategories(productData.categories);
    if (productData.description)
        product.setDescription(productData.description);
    if (productData.images)
        product.setImages(productData.images);
    if (productData.sizes)
        product.setSizes(productData.sizes);
    if (productData.colors)
        product.setColors(productData.colors);
    return await repo.updateProduct(product);
};
const deleteProduct = async (productId, email, role) => {
    if (role !== "admin") {
        throw new express_jwt_1.UnauthorizedError("credentials_required", {
            message: "You must be an admin to manage products.",
        });
    }
    const repo = await getCosmosRepo();
    const success = await repo.deleteProduct(productId);
    if (!success)
        throw new Error("Failed to delete product.");
    return "Product has been deleted.";
};
const addReviewToProduct = async (productId, rating, comment, email, role) => {
    if (!productId)
        throw new Error("The product id is incorrect.");
    if (rating < 1 || rating > 5)
        throw new Error("The rating must be between 1 and 5");
    const user = await customer_service_1.CustomerService.getInstance().getCustomerByEmail(email, email, role);
    const userId = user?.getId();
    if (!user || userId === undefined)
        throw new Error("The user does not exist.");
    const repo = await getCosmosRepo();
    const product = await repo.getProductById(productId);
    const reviewToAdd = new review_1.Review({
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
exports.default = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    addReviewToProduct,
};
//# sourceMappingURL=product.service.js.map