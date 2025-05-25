import { CosmosCustomerDocument } from "./cosmos-customer-repository";
import { CosmosProductDocument } from "./cosmos-product-repository";

export interface CosmosOrderDocument {
  id: string;
  customer: CosmosCustomerDocument; 
  items: {
    product: CosmosProductDocument; 
    quantity: number;
  }[];
  date: string; 
  payment: {
    amount: number;
    date: string;
    paymentStatus: string;
  };
  partition: string;
}

import { CosmosClient, Container } from '@azure/cosmos';
import { Order } from '../model/order';
import { Customer } from '../model/customer';
import { OrderItem } from '../model/orderItem';
import { Payment } from '../model/payment';
import { Product } from '../model/product';
import { CustomError } from '../model/custom-error';

export interface CosmosOrderItemDocument {
  product: {
    id: string;
    name: string;
    price: number;
    stock: number;
    categories: string[];
    description: string;
    images: string[];
    sizes: string[];
    colors: string[];
    rating: number;
    partition: string;
  };
  quantity: number;
}

export interface CosmosPaymentDocument {
  amount: number;
  date: string;
  paymentStatus: string;
}


export class CosmosOrderRepository {
  private static instance: CosmosOrderRepository;

  private constructor(private readonly container: Container) {}

  static async getInstance(): Promise<CosmosOrderRepository> {
    if (!this.instance) {
      const endpoint = process.env.COSMOS_ENDPOINT;
      const key = process.env.COSMOS_KEY;
      const databaseName = process.env.COSMOS_DATABASE_NAME;

      if (!endpoint || !key || !databaseName) {
        throw new Error('Missing Cosmos DB credentials.');
      }

      const client = new CosmosClient({ endpoint, key });
      const { database } = await client.databases.createIfNotExists({ id: databaseName });

      const { container } = await database.containers.createIfNotExists({
        id: 'orders',
        partitionKey: { paths: ['/partition'] },
      });

      this.instance = new CosmosOrderRepository(container);
    }

    return this.instance;
  }

  private fromOrder(order: Order): CosmosOrderDocument {
    return {
      id: order.getId()?.toString() ?? crypto.randomUUID(),
      customer: {
        id: order.getCustomer().getId()?.toString() ?? order.getCustomer().getEmail(),
        firstName: order.getCustomer().getFirstName(),
        lastName: order.getCustomer().getLastName(),
        email: order.getCustomer().getEmail(),
        password: order.getCustomer().getPassword(),
        role: order.getCustomer().getRole(),
        wishlist: [], // optional, since not needed here
        partition: 'customer',
      },
      items: order.getItems().map((item) => ({
        quantity: item.getQuantity(),
        product: {
          id: item.getProduct().getId()?.toString() ?? '',
          name: item.getProduct().getName(),
          price: item.getProduct().getPrice(),
          stock: item.getProduct().getStock(),
          categories: item.getProduct().getCategories(),
          description: item.getProduct().getDescription(),
          images: item.getProduct().getImages(),
          sizes: item.getProduct().getSizes(),
          colors: item.getProduct().getColors(),
          rating: item.getProduct().getRating(),
          partition: 'product',
        },
      })),
      date: order.getDate().toISOString(),
      payment: {
        amount: order.getPayment().getAmount(),
        date: order.getDate().toISOString(),
        paymentStatus: order.getPayment().getPaymentStatus(),
      },
      partition: 'order',
    };
  }

  private toOrder(doc: CosmosOrderDocument): Order {
    return new Order({
      id: parseInt(doc.id, 10),
      customer: new Customer({
        id: parseInt(doc.customer.id, 10),
        firstName: doc.customer.firstName,
        lastName: doc.customer.lastName,
        email: doc.customer.email,
        password: doc.customer.password,
        role: doc.customer.role as any,
        wishlist: [], // Optional
      }),
      items: doc.items.map(
        (item) =>
          new OrderItem({
            product: Product.from({
              ...item.product,
              id: parseInt(item.product.id, 10),
            }),
            quantity: item.quantity,
          })
      ),
      date: new Date(doc.date),
      payment: new Payment({
        amount: doc.payment.amount,
        date: new Date(doc.payment.date),
        paymentStatus: doc.payment.paymentStatus as any,
      }),
    });
  }

  async createOrder(order: Order): Promise<Order> {
    const doc = this.fromOrder(order);
    const { resource } = await this.container.items.create(doc);
    return this.toOrder(resource as CosmosOrderDocument);
  }

  async getOrders(): Promise<Order[]> {
    const query = { query: 'SELECT * FROM c WHERE c.partition = @partition', parameters: [{ name: '@partition', value: 'order' }] };
    const { resources } = await this.container.items.query<CosmosOrderDocument>(query).fetchAll();
    return resources.map(this.toOrder);
  }

  async getOrderById(id: number): Promise<Order | null> {
    try {
      const { resource } = await this.container.item(id.toString(), 'order').read<CosmosOrderDocument>();
      return resource ? this.toOrder(resource) : null;
    } catch (error) {
      if ((error as any).code === 404) return null;
      console.error(error);
      throw CustomError.internal('Database error. See server log for details.');
    }
  }

  async getOrdersByCustomerEmail(email: string): Promise<Order[]> {
    const query = {
      query: 'SELECT * FROM c WHERE c.partition = @partition AND c.customer.email = @customerEmail',
      parameters: [
        { name: '@partition', value: 'order' },
        { name: '@customerEmail', value: email },
      ],
    };
    const { resources } = await this.container.items.query<CosmosOrderDocument>(query).fetchAll();
    return resources.map(this.toOrder);
  }

  async deleteOrder(id: number): Promise<string> {
    try {
      await this.container.item(id.toString(), 'order').delete();
      return 'Order has been deleted.';
    } catch (error) {
      console.error(error);
      throw CustomError.internal('Database error. See server log for details.');
    }
  }
}
