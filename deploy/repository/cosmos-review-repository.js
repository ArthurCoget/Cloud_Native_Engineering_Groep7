"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CosmosReviewRepository = void 0;
const cosmos_1 = require("@azure/cosmos");
const review_1 = require("../model/review");
const custom_error_1 = require("../model/custom-error");
class CosmosReviewRepository {
    container;
    static instance;
    constructor(container) {
        this.container = container;
        if (!container)
            throw new Error("Review Cosmos DB container is required.");
    }
    static async getInstance() {
        if (!this.instance) {
            const key = process.env.COSMOS_KEY;
            const endpoint = process.env.COSMOS_ENDPOINT;
            const databaseName = process.env.COSMOS_DATABASE_NAME;
            const containerName = "reviews";
            const partitionKeyPath = ["/partition"];
            const client = new cosmos_1.CosmosClient({ endpoint, key });
            const { database } = await client.databases.createIfNotExists({
                id: databaseName,
            });
            const { container } = await database.containers.createIfNotExists({
                id: containerName,
                partitionKey: { paths: partitionKeyPath },
            });
            this.instance = new CosmosReviewRepository(container);
        }
        return this.instance;
    }
    toReview(doc) {
        return new review_1.Review({
            id: parseInt(doc.id),
            productId: doc.productId,
            rating: doc.rating,
            comment: doc.comment,
            customerId: doc.customerId,
            createdAt: new Date(doc.createdAt),
        });
    }
    async createReview(review) {
        const id = review.getId()?.toString() ?? Date.now().toString();
        const partition = review.getProductId().toString();
        review.setId(parseInt(id));
        const document = {
            id,
            productId: review.getProductId(),
            customerId: review.getCustomerId(),
            rating: review.getRating(),
            comment: review.getComment(),
            createdAt: review.getCreatedAt().toISOString(),
            partition,
        };
        const result = await this.container.items.create(document);
        if (result.statusCode >= 200 && result.statusCode < 300) {
            return review;
        }
        else {
            throw custom_error_1.CustomError.internal("Could not create review.");
        }
    }
    async getReviewById(id, productId) {
        const idStr = id.toString();
        const partition = productId.toString();
        const { resource } = await this.container
            .item(idStr, partition)
            .read();
        if (!resource) {
            throw custom_error_1.CustomError.notFound("Review not found.");
        }
        return this.toReview(resource);
    }
    async getReviewsByProductId(productId) {
        const query = {
            query: "SELECT * FROM reviews r WHERE r.productId = @productId",
            parameters: [{ name: "@productId", value: productId }],
        };
        const { resources } = await this.container.items
            .query(query, {
            partitionKey: productId.toString(),
        })
            .fetchAll();
        return resources.map(this.toReview.bind(this));
    }
    async deleteReview(id, productId) {
        const idStr = id.toString();
        const partition = productId.toString();
        const { statusCode } = await this.container.item(idStr, partition).delete();
        return statusCode === 204;
    }
    async updateReview(review) {
        const id = review.getId()?.toString();
        if (!id)
            throw custom_error_1.CustomError.invalid("Missing review ID");
        const partition = review.getProductId().toString();
        const document = {
            id,
            productId: review.getProductId(),
            customerId: review.getCustomerId(),
            rating: review.getRating(),
            comment: review.getComment(),
            createdAt: review.getCreatedAt().toISOString(),
            partition,
        };
        const { resource } = await this.container.items.upsert(document);
        if (!resource)
            throw custom_error_1.CustomError.internal("Review update failed.");
        return this.toReview(resource);
    }
}
exports.CosmosReviewRepository = CosmosReviewRepository;
//# sourceMappingURL=cosmos-review-repository.js.map