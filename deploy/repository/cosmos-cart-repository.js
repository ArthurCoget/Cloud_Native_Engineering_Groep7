"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CosmosCartRepository = void 0;
const cosmos_1 = require("@azure/cosmos");
const custom_error_1 = require("../model/custom-error");
const cart_1 = require("../model/cart");
const cartItem_1 = require("../model/cartItem");
const cosmos_customer_repository_1 = require("./cosmos-customer-repository");
const cosmos_product_repository_1 = require("./cosmos-product-repository");
const cosmos_discountCode_repository_1 = require("./cosmos-discountCode-repository");
class CosmosCartRepository {
    container;
    static instance;
    constructor(container) {
        this.container = container;
        if (!container) {
            throw new Error("Cart Cosmos DB container is required.");
        }
    }
    static async getInstance() {
        if (!this.instance) {
            const key = process.env.COSMOS_KEY;
            const endpoint = process.env.COSMOS_ENDPOINT;
            const databaseName = process.env.COSMOS_DATABASE_NAME;
            const containerName = "carts";
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
            this.instance = new CosmosCartRepository(container);
        }
        return this.instance;
    }
    async toCart(doc) {
        const customerRepo = await cosmos_customer_repository_1.CosmosCustomerRepository.getInstance();
        const productRepo = await cosmos_product_repository_1.CosmosProductRepository.getInstance();
        const discountCodeRepo = await cosmos_discountCode_repository_1.CosmosDiscountCodeRepository.getInstance();
        let customer = await customerRepo.getCustomerById(doc.customerId);
        if (!customer) {
            throw custom_error_1.CustomError.notFound(`Customer with ID ${doc.customerId} not found`);
        }
        const products = await Promise.all(doc.products.map(async (item) => {
            const product = await productRepo.getProductById(parseInt(item.productId));
            if (!product) {
                throw custom_error_1.CustomError.notFound(`Product with ID ${item.productId} not found`);
            }
            return cartItem_1.CartItem.fromCosmos({
                id: parseInt(item.id),
                product,
                quantity: item.quantity,
            });
        }));
        const discountCodes = await Promise.all(doc.discountCodes.map(async (dc) => {
            const discountCode = await discountCodeRepo.getDiscountCodeByCode(dc.code);
            if (!discountCode) {
                throw custom_error_1.CustomError.notFound(`Discount code with ID ${dc.id} not found`);
            }
            return discountCode;
        }));
        return cart_1.Cart.fromCosmos({
            id: parseInt(doc.id),
            customer,
            products,
            discountCodes,
            totalAmount: doc.totalAmount,
        });
    }
    async createCart(customer) {
        const customerId = customer.getId();
        if (!customerId) {
            throw custom_error_1.CustomError.invalid("Customer ID is required to create a cart");
        }
        const id = Date.now().toString();
        const partition = id.substring(0, 3);
        const cart = new cart_1.Cart({
            customer,
            products: [],
            discountCodes: [],
        });
        cart.setTotalAmount(0);
        const document = {
            id,
            customerId: customerId.toString(),
            customer: {
                id: customerId.toString(),
                firstName: customer.getFirstName(),
                lastName: customer.getLastName(),
                email: customer.getEmail(),
            },
            products: [],
            discountCodes: [],
            totalAmount: 0,
            partition,
        };
        const { resource } = await this.container.items.create(document);
        if (!resource) {
            throw custom_error_1.CustomError.internal("Failed to create cart.");
        }
        cart.setId(parseInt(id));
        return cart;
    }
    async getCarts() {
        const query = { query: "SELECT * FROM c" };
        const { resources } = await this.container.items
            .query(query)
            .fetchAll();
        return Promise.all(resources.map((doc) => this.toCart(doc)));
    }
    async getCartById(id) {
        const idStr = id.toString();
        const partition = idStr.substring(0, 3);
        const { resource } = await this.container
            .item(idStr, partition)
            .read();
        if (!resource) {
            return null;
        }
        return this.toCart(resource);
    }
    async getCartByCustomerEmail(email) {
        const customerRepo = await cosmos_customer_repository_1.CosmosCustomerRepository.getInstance();
        const customer = await customerRepo.getCustomerByEmail(email);
        if (!customer) {
            return null;
        }
        const customerId = customer.getId();
        if (!customerId) {
            throw custom_error_1.CustomError.invalid(`Customer with email ${email} has no ID`);
        }
        const query = {
            query: "SELECT * FROM c WHERE c.customerId = @customerId",
            parameters: [{ name: "@customerId", value: customerId.toString() }],
        };
        const { resources } = await this.container.items
            .query(query)
            .fetchAll();
        if (resources.length === 0) {
            return await this.createCart(customer);
        }
        return this.toCart(resources[0]);
    }
    async addCartItem(cart, product, quantity) {
        const cartItem = cart.addItem(product, quantity);
        await this.updateCart(cart);
        return cartItem;
    }
    async removeCartItem(cart, product, quantity) {
        const result = cart.removeItem(product, quantity);
        await this.updateCart(cart);
        return result;
    }
    async addDiscountCode(cart, discountCode) {
        const appliedDiscountCode = cart.applyDiscountCode(discountCode);
        await this.updateCart(cart);
        return appliedDiscountCode;
    }
    async removeDiscountCode(cart, code) {
        const discountCode = cart
            .getDiscountCodes()
            .find((dc) => dc.getCode() === code);
        if (!discountCode) {
            throw custom_error_1.CustomError.notFound(`Discount code ${code} not applied to cart`);
        }
        const result = cart.removeDiscountCode(discountCode);
        await this.updateCart(cart);
        return result;
    }
    async emptyCart(cart) {
        cart.emptyCart();
        await this.updateCart(cart);
    }
    async updateCart(cart) {
        const id = cart.getId();
        if (!id) {
            throw custom_error_1.CustomError.invalid("Cart ID is required to update");
        }
        const customerId = cart.getCustomer().getId();
        if (!customerId) {
            throw custom_error_1.CustomError.invalid("Customer ID is required to update cart");
        }
        const idStr = id.toString();
        const partition = idStr.substring(0, 3);
        const document = {
            id: idStr,
            customerId: customerId.toString(),
            customer: {
                id: customerId.toString(),
                firstName: cart.getCustomer().getFirstName(),
                lastName: cart.getCustomer().getLastName(),
                email: cart.getCustomer().getEmail(),
            },
            products: cart.getProducts().map((item, index) => ({
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
                    reviews: [],
                    partition: item.getProduct().getId().toString().substring(0, 3),
                },
            })),
            discountCodes: cart.getDiscountCodes().map((dc) => ({
                id: dc.getId().toString(),
                code: dc.getCode(),
                type: dc.getType(),
                value: dc.getValue(),
                expirationDate: dc.getExpirationDate().toISOString(),
                isActive: dc.getIsActive(),
                partition: dc.getId().toString().substring(0, 3),
            })),
            totalAmount: cart.getTotalAmount(),
            partition,
        };
        const { resource } = await this.container
            .item(idStr, partition)
            .replace(document);
        if (!resource) {
            throw custom_error_1.CustomError.internal("Failed to update cart.");
        }
    }
}
exports.CosmosCartRepository = CosmosCartRepository;
//# sourceMappingURL=cosmos-cart-repository.js.map