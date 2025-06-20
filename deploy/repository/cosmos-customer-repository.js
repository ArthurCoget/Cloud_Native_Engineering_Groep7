"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CosmosCustomerRepository = void 0;
const cosmos_1 = require("@azure/cosmos");
const customer_1 = require("../model/customer");
const product_1 = require("../model/product");
const custom_error_1 = require("../model/custom-error");
class CosmosCustomerRepository {
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
            const containerName = "customers";
            if (!endpoint || !key || !databaseName) {
                throw new Error("Missing Cosmos DB credentials.");
            }
            const client = new cosmos_1.CosmosClient({ endpoint, key });
            const { database } = await client.databases.createIfNotExists({
                id: databaseName,
            });
            const { container } = await database.containers.createIfNotExists({
                id: containerName,
                partitionKey: { paths: ["/partition"] },
            });
            this.instance = new CosmosCustomerRepository(container);
        }
        return this.instance;
    }
    toCustomer(doc) {
        return new customer_1.Customer({
            id: doc.id,
            firstName: doc.firstName,
            lastName: doc.lastName,
            email: doc.email,
            password: doc.password,
            role: doc.role,
            wishlist: doc.wishlist.map((productDoc) => product_1.Product.fromCosmos({
                ...productDoc,
            })),
        });
    }
    fromCustomer(customer) {
        return {
            id: customer.getId(),
            firstName: customer.getFirstName(),
            lastName: customer.getLastName(),
            email: customer.getEmail(),
            password: customer.getPassword(),
            role: customer.getRole(),
            wishlist: customer.getWishlist().map((product) => ({
                id: product.getId()?.toString() ?? "",
                name: product.getName(),
                price: product.getPrice(),
                stock: product.getStock(),
                categories: product.getCategories(),
                description: product.getDescription(),
                images: product.getImages(),
                sizes: product.getSizes(),
                colors: product.getColors(),
                reviews: product.getReviews().map((review) => ({
                    id: review.getId()?.toString() ?? "",
                    rating: review.getRating(),
                    comment: review.getComment(),
                    createdAt: review.getCreatedAt().toISOString(),
                    productId: review.getProductId(),
                    customerId: review.getCustomerId(),
                    partition: "review",
                })),
                partition: "product",
            })),
            partition: "customer",
        };
    }
    async getCustomers() {
        const query = { query: "SELECT * FROM c" };
        const { resources } = await this.container.items
            .query(query)
            .fetchAll();
        return resources.map(this.toCustomer);
    }
    async getCustomerById(id) {
        try {
            const { resource } = await this.container
                .item(id.toString(), "customer")
                .read();
            return resource
                ? this.toCustomer(resource)
                : null;
        }
        catch (error) {
            if (error.code === 404)
                return null;
            console.error(error);
            throw custom_error_1.CustomError.internal("Database error. See server log for details.");
        }
    }
    async getCustomerByEmail(email) {
        const query = {
            query: "SELECT * FROM c WHERE c.email = @email",
            parameters: [{ name: "@email", value: email }],
        };
        const { resources } = await this.container.items
            .query(query, {
            partitionKey: "customer",
        })
            .fetchAll();
        return resources.length ? this.toCustomer(resources[0]) : null;
    }
    async createCustomer(customer) {
        const doc = this.fromCustomer(customer);
        const { resource } = await this.container.items.create(doc);
        return this.toCustomer(resource);
    }
    async updateCustomer(customer) {
        const doc = this.fromCustomer(customer);
        const { resource } = await this.container.items.upsert(doc);
        return this.toCustomer(resource);
    }
    async deleteCustomer(email) {
        const customer = await this.getCustomerByEmail(email);
        if (!customer) {
            throw new Error("Customer not found.");
        }
        await this.container
            .item(customer.getId().toString(), "customer")
            .delete();
        return "Customer has been deleted.";
    }
    async addProductToWishlist(customer, product) {
        const wishlist = [...customer.getWishlist(), product];
        customer = new customer_1.Customer({
            id: customer.getId(),
            firstName: customer.getFirstName(),
            lastName: customer.getLastName(),
            email: customer.getEmail(),
            password: customer.getPassword(),
            role: customer.getRole(),
            wishlist,
        });
        await this.updateCustomer(customer);
        return product;
    }
    async removeProductFromWishlist(customer, product) {
        const wishlist = customer
            .getWishlist()
            .filter((p) => p.getId() !== product.getId());
        customer = new customer_1.Customer({
            id: customer.getId(),
            firstName: customer.getFirstName(),
            lastName: customer.getLastName(),
            email: customer.getEmail(),
            password: customer.getPassword(),
            role: customer.getRole(),
            wishlist,
        });
        await this.updateCustomer(customer);
        return "Product has been removed from the wishlist.";
    }
}
exports.CosmosCustomerRepository = CosmosCustomerRepository;
//# sourceMappingURL=cosmos-customer-repository.js.map