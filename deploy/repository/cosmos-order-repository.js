"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CosmosOrderRepository = void 0;
const cosmos_1 = require("@azure/cosmos");
const custom_error_1 = require("../model/custom-error");
const order_1 = require("../model/order");
const orderItem_1 = require("../model/orderItem");
const payment_1 = require("../model/payment");
const cosmos_customer_repository_1 = require("./cosmos-customer-repository"); // Assume this exists
const cosmos_product_repository_1 = require("./cosmos-product-repository");
class CosmosOrderRepository {
    container;
    static instance;
    constructor(container) {
        this.container = container;
        if (!container) {
            throw new Error("Order Cosmos DB container is required.");
        }
    }
    static async getInstance() {
        if (!this.instance) {
            const key = process.env.COSMOS_KEY;
            const endpoint = process.env.COSMOS_ENDPOINT;
            const databaseName = process.env.COSMOS_DATABASE_NAME;
            const containerName = "orders";
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
            this.instance = new CosmosOrderRepository(container);
        }
        return this.instance;
    }
    async toOrder(doc) {
        // Fetch full Customer and Product objects
        const customerRepo = await cosmos_customer_repository_1.CosmosCustomerRepository.getInstance();
        const productRepo = await cosmos_product_repository_1.CosmosProductRepository.getInstance();
        const customer = await customerRepo.getCustomerById(doc.customerId);
        if (!customer) {
            throw custom_error_1.CustomError.notFound(`Customer with ID ${doc.customerId} not found`);
        }
        const items = await Promise.all(doc.items.map(async (item) => {
            const product = await productRepo.getProductById(parseInt(item.productId));
            return orderItem_1.OrderItem.fromCosmos({
                id: parseInt(item.id),
                product,
                quantity: item.quantity,
            });
        }));
        const payment = payment_1.Payment.fromCosmos({
            id: doc.payment.id,
            amount: doc.payment.amount,
            date: doc.payment.date,
            paymentStatus: doc.payment.paymentStatus,
        });
        return order_1.Order.fromCosmos({
            id: parseInt(doc.id),
            customer,
            items,
            date: new Date(doc.date),
            payment,
        });
    }
    async getOrders() {
        const query = { query: "SELECT * FROM c" };
        const { resources } = await this.container.items
            .query(query)
            .fetchAll();
        return Promise.all(resources.map((doc) => this.toOrder(doc)));
    }
    async getOrderById(id) {
        const idStr = id.toString();
        const partition = idStr.substring(0, 3);
        const { resource } = await this.container
            .item(idStr, partition)
            .read();
        if (!resource) {
            return undefined;
        }
        return this.toOrder(resource);
    }
    async getOrdersByCustomer(email) {
        const customerRepo = await cosmos_customer_repository_1.CosmosCustomerRepository.getInstance();
        const customer = await customerRepo.getCustomerByEmail(email);
        if (!customer) {
            return [];
        }
        const customerId = customer.getId();
        if (customerId === undefined || customerId === null) {
            return [];
        }
        const query = {
            query: "SELECT * FROM c WHERE c.customerId = @customerId",
            parameters: [{ name: "@customerId", value: customerId.toString() }],
        };
        const { resources } = await this.container.items
            .query(query)
            .fetchAll();
        return Promise.all(resources.map((doc) => this.toOrder(doc)));
    }
    async deleteOrder(id) {
        const idStr = id.toString();
        const partition = idStr.substring(0, 3);
        const { statusCode } = await this.container.item(idStr, partition).delete();
        if (statusCode !== 204) {
            throw custom_error_1.CustomError.internal("Failed to delete order.");
        }
        return "Order has been deleted.";
    }
    async createOrder(order) {
        try {
            const generatedId = order.getId()?.toString() ?? Date.now().toString();
            const partition = generatedId.substring(0, 3);
            order.setId(parseInt(generatedId));
            const customer = order.getCustomer();
            const items = order.getItems();
            const payment = order.getPayment();
            // Validate and update product stock
            const productRepo = await cosmos_product_repository_1.CosmosProductRepository.getInstance();
            for (const item of items) {
                const product = item.getProduct();
                const currentProduct = await productRepo.getProductById(product.getId());
                if (currentProduct.getStock() < item.getQuantity()) {
                    throw custom_error_1.CustomError.invalid(`Insufficient stock for product ${product.getName()}`);
                }
                currentProduct.updateStock(-item.getQuantity());
                await productRepo.updateProduct(currentProduct);
            }
            const document = {
                id: generatedId,
                customerId: customer.getId().toString(),
                customer: {
                    id: customer.getId().toString(),
                    firstName: customer.getFirstName(),
                    lastName: customer.getLastName(),
                    email: customer.getEmail(),
                },
                items: items.map((item, index) => ({
                    id: (item.getId() ?? Date.now() + index).toString(),
                    productId: item.getProduct().getId().toString(),
                    quantity: item.getQuantity(),
                    product: {
                        id: item.getProduct().getId().toString(),
                        name: item.getProduct().getName(),
                        price: item.getProduct().getPrice(),
                        stock: item.getProduct().getStock(),
                        categories: item.getProduct().getCategories(),
                        description: item.getProduct().getDescription(),
                        images: item.getProduct().getImages(),
                        sizes: item.getProduct().getSizes(),
                        colors: item.getProduct().getColors(),
                        reviews: [], // Exclude reviews to avoid bloat
                        partition: item.getProduct().getId().toString().substring(0, 3),
                    },
                })),
                date: order.getDate().toISOString(),
                payment: {
                    id: (payment.getId() ?? Date.now()).toString(),
                    orderId: parseInt(generatedId),
                    amount: payment.getAmount(),
                    date: payment.getDate().toISOString(),
                    paymentStatus: payment.getPaymentStatus() === "paid" ? "paid" : "unpaid",
                    partition: partition, // Align with order's partition
                },
                partition,
            };
            const result = await this.container.items.create(document);
            if (result.statusCode < 200 || result.statusCode >= 300) {
                throw custom_error_1.CustomError.internal("Could not create order.");
            }
            const createdOrder = await this.getOrderById(parseInt(generatedId));
            if (!createdOrder) {
                throw custom_error_1.CustomError.internal("Order was not found after creation.");
            }
            return createdOrder;
        }
        catch (error) {
            // Rollback stock updates
            const productRepo = await cosmos_product_repository_1.CosmosProductRepository.getInstance();
            for (const item of order.getItems()) {
                const product = item.getProduct();
                const currentProduct = await productRepo.getProductById(product.getId());
                currentProduct.updateStock(item.getQuantity()); // Revert stock
                await productRepo.updateProduct(currentProduct);
            }
            throw error;
        }
    }
}
exports.CosmosOrderRepository = CosmosOrderRepository;
//# sourceMappingURL=cosmos-order-repository.js.map