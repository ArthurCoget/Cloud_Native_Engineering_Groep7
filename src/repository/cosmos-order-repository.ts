import { Container, CosmosClient } from "@azure/cosmos";
import { CustomError } from "../model/custom-error";
import { Order } from "../model/order";
import { OrderItem } from "../model/orderItem";
import { Payment } from "../model/payment";
import { Customer } from "../model/customer";
import { Product } from "../model/product";
import { CosmosCustomerRepository } from "./cosmos-customer-repository"; // Assume this exists
import { CosmosProductRepository } from "./cosmos-product-repository";
import { CosmosProductDocument } from "./cosmos-product-repository"; // Reuse existing interfaces
import { CosmosPaymentDocument } from "./cosmos-payment-repository";

export interface CosmosOrderItemDocument {
  id: string;
  productId: string; // Reference to product
  quantity: number;
  product: CosmosProductDocument; // Embedded product data for display
}

export interface CosmosOrderDocument {
  id: string;
  customerId: string; // Reference to customer
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  }; // Embedded customer data for display
  items: CosmosOrderItemDocument[];
  date: string; // ISO string
  payment: CosmosPaymentDocument;
  partition: string;
}

export class CosmosOrderRepository {
  private static instance: CosmosOrderRepository;

  private constructor(private readonly container: Container) {
    if (!container) {
      throw new Error("Order Cosmos DB container is required.");
    }
  }

  static async getInstance(): Promise<CosmosOrderRepository> {
    if (!this.instance) {
      const key = process.env.COSMOS_KEY;
      const endpoint = process.env.COSMOS_ENDPOINT;
      const databaseName = process.env.COSMOS_DATABASE_NAME;
      const containerName = "orders";
      const partitionKeyPath = ["/partition"];

      if (!key || !endpoint || !databaseName) {
        throw new Error("Missing Cosmos DB credentials.");
      }

      const client = new CosmosClient({ endpoint, key });
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

  private async toOrder(doc: CosmosOrderDocument): Promise<Order> {
    // Fetch full Customer and Product objects
    const customerRepo = await CosmosCustomerRepository.getInstance();
    const productRepo = await CosmosProductRepository.getInstance();

    const customer = await customerRepo.getCustomerById(doc.customerId);
    if (!customer) {
      throw CustomError.notFound(
        `Customer with ID ${doc.customerId} not found`
      );
    }

    const items = await Promise.all(
      doc.items.map(async (item) => {
        const product = await productRepo.getProductById(
          parseInt(item.productId)
        );
        return OrderItem.fromCosmos({
          id: parseInt(item.id),
          product,
          quantity: item.quantity,
        });
      })
    );

    const payment = Payment.fromCosmos({
      id: doc.payment.id,
      amount: doc.payment.amount,
      date: doc.payment.date,
      paymentStatus: doc.payment.paymentStatus,
    });

    return Order.fromCosmos({
      id: parseInt(doc.id),
      customer,
      items,
      date: new Date(doc.date),
      payment,
    });
  }

  async getOrders(): Promise<Order[]> {
    const query = { query: "SELECT * FROM c" };
    const { resources } = await this.container.items
      .query<CosmosOrderDocument>(query)
      .fetchAll();
    return Promise.all(resources.map((doc) => this.toOrder(doc)));
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    const idStr = id.toString();
    const partition = idStr.substring(0, 3);
    const { resource } = await this.container
      .item(idStr, partition)
      .read<CosmosOrderDocument>();
    if (!resource) {
      return undefined;
    }
    return this.toOrder(resource);
  }

  async getOrdersByCustomer(email: string): Promise<Order[]> {
    const customerRepo = await CosmosCustomerRepository.getInstance();
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
      .query<CosmosOrderDocument>(query)
      .fetchAll();
    return Promise.all(resources.map((doc) => this.toOrder(doc)));
  }

  async deleteOrder(id: number): Promise<string> {
    const idStr = id.toString();
    const partition = idStr.substring(0, 3);
    const { statusCode } = await this.container.item(idStr, partition).delete();
    if (statusCode !== 204) {
      throw CustomError.internal("Failed to delete order.");
    }
    return "Order has been deleted.";
  }

  async createOrder(order: Order): Promise<Order> {
    try {
      const generatedId = order.getId()?.toString() ?? Date.now().toString();
      const partition = generatedId.substring(0, 3);
      order.setId(parseInt(generatedId));

      const customer = order.getCustomer();
      const items = order.getItems();
      const payment = order.getPayment();

      // Validate and update product stock
      const productRepo = await CosmosProductRepository.getInstance();
      for (const item of items) {
        const product = item.getProduct();
        const currentProduct = await productRepo.getProductById(
          product.getId()!
        );
        if (currentProduct.getStock() < item.getQuantity()) {
          throw CustomError.invalid(
            `Insufficient stock for product ${product.getName()}`
          );
        }
        currentProduct.updateStock(-item.getQuantity());
        await productRepo.updateProduct(currentProduct);
      }

      const document: CosmosOrderDocument = {
        id: generatedId,
        customerId: customer.getId()!.toString(),
        customer: {
          id: customer.getId()!.toString(),
          firstName: customer.getFirstName(),
          lastName: customer.getLastName(),
          email: customer.getEmail(),
        },
        items: items.map((item, index) => ({
          id: (item.getId() ?? Date.now() + index).toString(),
          productId: item.getProduct().getId()!.toString(),
          quantity: item.getQuantity(),
          product: {
            id: item.getProduct().getId()!.toString(),
            name: item.getProduct().getName(),
            price: item.getProduct().getPrice(),
            stock: item.getProduct().getStock(),
            categories: item.getProduct().getCategories(),
            description: item.getProduct().getDescription(),
            images: item.getProduct().getImages(),
            sizes: item.getProduct().getSizes(),
            colors: item.getProduct().getColors(),
            reviews: [], // Exclude reviews to avoid bloat
            partition: item.getProduct().getId()!.toString().substring(0, 3),
          },
        })),
        date: order.getDate().toISOString(),
        payment: {
          id: (payment.getId() ?? Date.now()).toString(),
          orderId: parseInt(generatedId),
          amount: payment.getAmount(),
          date: payment.getDate().toISOString(),
          paymentStatus:
            payment.getPaymentStatus() === "paid" ? "paid" : "unpaid",
          partition: partition, // Align with order's partition
        },
        partition,
      };

      const result = await this.container.items.create(document);
      if (result.statusCode < 200 || result.statusCode >= 300) {
        throw CustomError.internal("Could not create order.");
      }

      const createdOrder = await this.getOrderById(parseInt(generatedId));
      if (!createdOrder) {
        throw CustomError.internal("Order was not found after creation.");
      }
      return createdOrder;
    } catch (error) {
      // Rollback stock updates
      const productRepo = await CosmosProductRepository.getInstance();
      for (const item of order.getItems()) {
        const product = item.getProduct();
        const currentProduct = await productRepo.getProductById(
          product.getId()!
        );
        currentProduct.updateStock(item.getQuantity()); // Revert stock
        await productRepo.updateProduct(currentProduct);
      }
      throw error;
    }
  }
}
