"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CosmosDiscountCodeRepository = void 0;
const cosmos_1 = require("@azure/cosmos");
const custom_error_1 = require("../model/custom-error");
const discountCode_1 = require("../model/discountCode");
class CosmosDiscountCodeRepository {
    container;
    static instance;
    constructor(container) {
        this.container = container;
        if (!container) {
            throw new Error('DiscountCode Cosmos DB container is required.');
        }
    }
    static async getInstance() {
        if (!this.instance) {
            const key = process.env.COSMOS_KEY;
            const endpoint = process.env.COSMOS_ENDPOINT;
            const databaseName = process.env.COSMOS_DATABASE_NAME;
            const containerName = 'discountCodes';
            const partitionKeyPath = ['/partition'];
            if (!key || !endpoint || !databaseName) {
                throw new Error('Missing Cosmos DB credentials.');
            }
            const client = new cosmos_1.CosmosClient({ endpoint, key });
            const { database } = await client.databases.createIfNotExists({
                id: databaseName,
            });
            const { container } = await database.containers.createIfNotExists({
                id: containerName,
                partitionKey: { paths: partitionKeyPath },
            });
            this.instance = new CosmosDiscountCodeRepository(container);
        }
        return this.instance;
    }
    toDiscountCode(document) {
        return discountCode_1.DiscountCode.fromCosmos(document);
    }
    async createDiscountCode(discountCode) {
        const id = discountCode.id?.toString() ?? discountCode.getCode();
        const partition = discountCode.getCode().substring(0, 3);
        const result = await this.container.items.create({
            id,
            code: discountCode.getCode(),
            type: discountCode.getType(),
            value: discountCode.getValue(),
            expirationDate: discountCode.getExpirationDate().toISOString(),
            isActive: discountCode.getIsActive(),
            partition,
        });
        if (result.statusCode >= 200 && result.statusCode < 300) {
            return this.getDiscountCodeByCode(discountCode.getCode());
        }
        else {
            throw custom_error_1.CustomError.internal('Could not create discount code.');
        }
    }
    async getDiscountCodeByCode(code) {
        const id = code;
        const partition = code.substring(0, 3);
        const { resource } = await this.container
            .item(id, partition)
            .read();
        if (!resource) {
            throw custom_error_1.CustomError.notFound('Discount code not found.');
        }
        return this.toDiscountCode(resource);
    }
    async discountCodeExists(code) {
        const id = code;
        const partition = code.substring(0, 3);
        const { resource } = await this.container.item(id, partition).read();
        return !!resource;
    }
    async deleteDiscountCode(code) {
        const id = code;
        const partition = code.substring(0, 3);
        const { statusCode } = await this.container.item(id, partition).delete();
        return statusCode === 204;
    }
    async getAllDiscountCodes() {
        const query = {
            query: 'SELECT * FROM c',
        };
        const { resources } = await this.container.items
            .query(query)
            .fetchAll();
        return resources.map(this.toDiscountCode);
    }
}
exports.CosmosDiscountCodeRepository = CosmosDiscountCodeRepository;
//# sourceMappingURL=cosmos-discountCode-repository.js.map