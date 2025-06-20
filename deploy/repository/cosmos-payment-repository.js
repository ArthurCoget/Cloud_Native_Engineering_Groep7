"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CosmosPaymentRepository = void 0;
const cosmos_1 = require("@azure/cosmos");
const payment_1 = require("../model/payment");
const custom_error_1 = require("../model/custom-error");
class CosmosPaymentRepository {
    container;
    static instance;
    constructor(container) {
        this.container = container;
    }
    static async getInstance() {
        if (!this.instance) {
            const endpoint = process.env.COSMOS_ENDPOINT;
            const key = process.env.COSMOS_KEY;
            const databaseName = process.env.COSMOS_DATABASE_NAME;
            const containerName = 'payments';
            if (!endpoint || !key || !databaseName) {
                throw new Error('Missing Cosmos DB credentials.');
            }
            const client = new cosmos_1.CosmosClient({ endpoint, key });
            const { database } = await client.databases.createIfNotExists({ id: databaseName });
            const { container } = await database.containers.createIfNotExists({
                id: containerName,
                partitionKey: { paths: ['/partition'] },
            });
            this.instance = new CosmosPaymentRepository(container);
        }
        return this.instance;
    }
    toPayment(doc) {
        return payment_1.Payment.fromCosmos(doc);
    }
    fromPayment(payment, orderId) {
        const id = payment.getId()?.toString() ?? `${orderId}`;
        return {
            id,
            orderId,
            amount: payment.getAmount(),
            date: payment.getDate().toISOString(),
            paymentStatus: payment.getPaymentStatus(),
            partition: `order-${orderId}`,
        };
    }
    async getPayments() {
        const query = {
            query: 'SELECT * FROM c',
        };
        const { resources } = await this.container.items
            .query(query)
            .fetchAll();
        return resources.map(this.toPayment);
    }
    async getPaymentById(id) {
        const partition = `order-${id}`;
        try {
            const { resource } = await this.container.item(id.toString(), partition).read();
            return resource ? this.toPayment(resource) : null;
        }
        catch (error) {
            if (typeof error === "object" && error !== null && "code" in error && error.code === 404)
                return null;
            console.error(error);
            throw custom_error_1.CustomError.internal('Database error. See server log for details.');
        }
    }
    async addPayment({ orderId, amount }) {
        const partition = `order-${orderId}`;
        const id = orderId.toString();
        try {
            const { resource: existing } = await this.container.item(id, partition).read();
            if (!existing) {
                throw new Error(`No payment associated with order id ${orderId}.`);
            }
            if (existing.paymentStatus === 'paid') {
                throw new Error('Payment has already been made.');
            }
            const updatedDoc = {
                ...existing,
                amount,
                date: new Date().toISOString(),
                paymentStatus: 'paid',
            };
            const { resource } = await this.container.items.upsert(updatedDoc);
            return this.toPayment(resource);
        }
        catch (error) {
            if (typeof error === "object" && error !== null && "code" in error && error.code === 404) {
                throw new Error(`Payment for order id ${orderId} not found.`);
            }
            console.error(error);
            throw custom_error_1.CustomError.internal('Database error. See server log for details.');
        }
    }
    async createInitialPayment(orderId, payment) {
        const doc = this.fromPayment(payment, orderId);
        const { resource } = await this.container.items.create(doc);
        return this.toPayment(resource);
    }
}
exports.CosmosPaymentRepository = CosmosPaymentRepository;
exports.default = CosmosPaymentRepository;
//# sourceMappingURL=cosmos-payment-repository.js.map