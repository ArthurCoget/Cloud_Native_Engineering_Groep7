"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CosmosProductRepository = exports.reviewToCosmos = void 0;
const cosmos_1 = require("@azure/cosmos");
const product_1 = require("../model/product");
const custom_error_1 = require("../model/custom-error");
const reviewToCosmos = (review) => ({
    id: review.getId.toString(),
    rating: review.getRating(),
    comment: review.getComment() ?? undefined,
    productId: review.getProductId(),
    customerId: review.getCustomerId(),
    createdAt: review.getCreatedAt().toISOString(),
    partition: review.getId.toString().substring(0, 3),
});
exports.reviewToCosmos = reviewToCosmos;
class CosmosProductRepository {
    container;
    static instance;
    constructor(container) {
        this.container = container;
        if (!container) {
            throw new Error("Product Cosmos DB container is required.");
        }
    }
    static async getInstance() {
        if (!this.instance) {
            const key = process.env.COSMOS_KEY;
            const endpoint = process.env.COSMOS_ENDPOINT;
            const databaseName = process.env.COSMOS_DATABASE_NAME;
            const containerName = "products";
            const partitionKeyPath = ["/partition"];
            if (!key || !endpoint || !databaseName) {
                throw new Error("Missing Cosmos DB credentials.");
            }
            const client = new cosmos_1.CosmosClient({ endpoint, key });
            const { database } = await client.databases.createIfNotExists({
                id: databaseName,
            });
            const { container } = await database.containers.createIfNotExists({
                id: containerName,
                partitionKey: { paths: partitionKeyPath },
            });
            this.instance = new CosmosProductRepository(container);
        }
        return this.instance;
    }
    toProduct(doc) {
        return product_1.Product.fromCosmos(doc);
    }
    async createProduct(product) {
        const generatedId = product.getId()?.toString() ?? Date.now().toString();
        const partition = generatedId.substring(0, 3);
        product.setId(parseInt(generatedId));
        const reviews = product.getReviews().map((r) => (0, exports.reviewToCosmos)({
            id: r.getId(),
            rating: r.getRating(),
            comment: r.getComment(),
            createdAt: r.getCreatedAt(),
            productId: r.getProductId(),
            customerId: r.getCustomerId(),
        }));
        const document = {
            id: generatedId,
            name: product.getName(),
            price: product.getPrice(),
            stock: product.getStock(),
            categories: product.getCategories() ?? [], // Ensure array
            description: product.getDescription(),
            images: product.getImages() ?? "none", // Default to valid image
            sizes: product.getSizes() ?? [], // Ensure array
            colors: product.getColors() ?? [], // Ensure array
            reviews,
            partition,
        };
        const result = await this.container.items.create(document);
        if (result.statusCode >= 200 && result.statusCode < 300) {
            return product;
        }
        else {
            throw custom_error_1.CustomError.internal("Could not create product.");
        }
    }
    async updateProduct(product) {
        const id = product.getId()?.toString();
        if (!id)
            throw custom_error_1.CustomError.invalid("Missing product ID");
        const reviews = product.getReviews().map((r) => (0, exports.reviewToCosmos)({
            id: r.getId(),
            rating: r.getRating(),
            comment: r.getComment(),
            createdAt: r.getCreatedAt(),
            productId: r.getProductId(),
            customerId: r.getCustomerId(),
        }));
        const partition = id.substring(0, 3);
        const document = {
            id,
            name: product.getName(),
            price: product.getPrice(),
            stock: product.getStock(),
            categories: product.getCategories() ?? [], // Ensure array
            description: product.getDescription(),
            images: product.getImages() ?? "none", // Default to valid image
            sizes: product.getSizes() ?? [], // Ensure array
            colors: product.getColors() ?? [], // Ensure array
            reviews,
            partition,
        };
        const { resource } = await this.container.items.upsert(document);
        if (!resource) {
            throw custom_error_1.CustomError.internal("Product update failed.");
        }
        return this.toProduct(resource);
    }
    async getProductById(id) {
        const idStr = id.toString();
        const query = {
            query: "SELECT * FROM c WHERE c.id = @id",
            parameters: [{ name: "@id", value: idStr }],
        };
        const { resources } = await this.container.items
            .query(query)
            .fetchAll();
        if (!resources || resources.length === 0) {
            throw custom_error_1.CustomError.notFound("Product not found.");
        }
        return this.toProduct(resources[0]);
    }
    async productExists(name) {
        const id = name;
        const partitionKey = id.substring(0, 3);
        try {
            const { resource } = await this.container.item(id, partitionKey).read();
            return !!resource;
        }
        catch (err) {
            if (err.code === 404)
                return false;
            throw err;
        }
    }
    async getAllProducts() {
        console.log("c");
        const query = {
            query: "SELECT * FROM c",
        };
        console.log("d");
        const { resources } = await this.container.items
            .query(query)
            .fetchAll();
        console.log("e");
        return resources.map(this.toProduct.bind(this));
    }
    async deleteProduct(id) {
        const idStr = id.toString();
        const partition = idStr.substring(0, 3);
        const { statusCode } = await this.container.item(idStr, partition).delete();
        return statusCode === 204;
    }
}
exports.CosmosProductRepository = CosmosProductRepository;
//# sourceMappingURL=cosmos-product-repository.js.map