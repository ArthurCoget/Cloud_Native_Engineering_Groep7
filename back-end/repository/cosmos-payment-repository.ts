import { Container, CosmosClient } from "@azure/cosmos";
import { Payment } from "../model/payment";
import { CustomError } from "../model/custom-error";

export interface CosmosPaymentDocument {
  id: string;
  orderId: number;
  amount: number;
  date: string;
  paymentStatus: 'paid' | 'unpaid';
  partition: string;
}

export class CosmosPaymentRepository {
  private static instance: CosmosPaymentRepository;

  private constructor(private readonly container: Container) {}

  static async getInstance(): Promise<CosmosPaymentRepository> {
    if (!this.instance) {
      const endpoint = process.env.COSMOS_ENDPOINT;
      const key = process.env.COSMOS_KEY;
      const databaseName = process.env.COSMOS_DATABASE_NAME;
      const containerName = 'payments';

      if (!endpoint || !key || !databaseName) {
        throw new Error('Missing Cosmos DB credentials.');
      }

      const client = new CosmosClient({ endpoint, key });

      const { database } = await client.databases.createIfNotExists({ id: databaseName });

      const { container } = await database.containers.createIfNotExists({
        id: containerName,
        partitionKey: { paths: ['/partition'] },
      });

      this.instance = new CosmosPaymentRepository(container);
    }

    return this.instance;
  }

  private toPayment(doc: CosmosPaymentDocument): Payment {
    return Payment.fromCosmos(doc);
  }

  private fromPayment(payment: Payment, orderId: number): CosmosPaymentDocument {
    const id = payment.getId()?.toString() ?? `${orderId}`;
    return {
      id,
      orderId,
      amount: payment.getAmount(),
      date: payment.getDate().toISOString(),
      paymentStatus: payment.getPaymentStatus() as 'paid' | 'unpaid',
      partition: `order-${orderId}`,
    };
  }

  async getPayments(): Promise<Payment[]> {
    const query = {
      query: 'SELECT * FROM c',
    };

    const { resources } = await this.container.items
      .query<CosmosPaymentDocument>(query)
      .fetchAll();

    return resources.map(this.toPayment);
  }

  async getPaymentById(id: number): Promise<Payment | null> {
    const partition = `order-${id}`;
    try {
      const { resource } = await this.container.item(id.toString(), partition).read<CosmosPaymentDocument>();
      return resource ? this.toPayment(resource) : null;
    } catch (error) {
      if (typeof error === "object" && error !== null && "code" in error && (error as any).code === 404) return null;
      console.error(error);
      throw CustomError.internal('Database error. See server log for details.');
    }
  }

  async addPayment({ orderId, amount }: { orderId: number; amount: number }): Promise<Payment> {
    const partition = `order-${orderId}`;
    const id = orderId.toString();

    try {
      const { resource: existing } = await this.container.item(id, partition).read<CosmosPaymentDocument>();

      if (!existing) {
        throw new Error(`No payment associated with order id ${orderId}.`);
      }

      if (existing.paymentStatus === 'paid') {
        throw new Error('Payment has already been made.');
      }

      const updatedDoc: CosmosPaymentDocument = {
        ...existing,
        amount,
        date: new Date().toISOString(),
        paymentStatus: 'paid',
      };

      const { resource } = await this.container.items.upsert(updatedDoc);
      return this.toPayment(resource as unknown as CosmosPaymentDocument);
    } catch (error) {
      if (typeof error === "object" && error !== null && "code" in error && (error as any).code === 404) {
        throw new Error(`Payment for order id ${orderId} not found.`);
      }
      console.error(error);
      throw CustomError.internal('Database error. See server log for details.');
    }
  }

  async createInitialPayment(orderId: number, payment: Payment): Promise<Payment> {
    const doc = this.fromPayment(payment, orderId);
    const { resource } = await this.container.items.create(doc);
    return this.toPayment(resource as CosmosPaymentDocument);
  }
}
export default CosmosPaymentRepository;