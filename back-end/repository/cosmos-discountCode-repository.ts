
import { Container, CosmosClient } from "@azure/cosmos";
import { DiscountCode } from "../model/discountCode";
import { CustomError } from "../model/custom-error";

export interface CosmosDiscountCodeDocument {
  id: string; 
  code: string;
  type: string;
  value: number;
  expirationDate: string; 
  isActive: boolean;
  partition: string;
}

export class CosmosDiscountCodeRepository {
  private static instance: CosmosDiscountCodeRepository;

  private constructor(private readonly container: Container) {
    if (!container) {
      throw new Error("DiscountCode Cosmos DB container is required.");
    }
  }

  static async getInstance() {
    if (!this.instance) {
      const key = process.env.COSMOS_KEY;
      const endpoint = process.env.COSMOS_ENDPOINT;
      const databaseName = process.env.COSMOS_DATABASE_NAME;
      const containerName = "discountCodes";
      const partitionKeyPath = ["/partition"];

      if (!key || !endpoint || !databaseName) {
        throw new Error("Missing Cosmos DB credentials.");
      }

      const client = new CosmosClient({ endpoint, key });

      const { database } = await client.databases.createIfNotExists({ id: databaseName });
      const { container } = await database.containers.createIfNotExists({
        id: containerName,
        partitionKey: { paths: partitionKeyPath }
      });

      this.instance = new CosmosDiscountCodeRepository(container);
    }
    return this.instance;
  }

  private toDiscountCode(document: CosmosDiscountCodeDocument): DiscountCode {
    const discountCode = new DiscountCode({
      code: document.code,
      type: document.type,
      value: document.value,
      expirationDate: new Date(document.expirationDate),
      isActive: document.isActive
    });
    discountCode.id = parseInt(document.id); 
    return discountCode;
  }

  async createDiscountCode(discountCode: DiscountCode): Promise<DiscountCode> {
    const id = discountCode.id?.toString() ?? discountCode.getCode();
    const partition = discountCode.getCode().substring(0, 3);

    const result = await this.container.items.create({
      id,
      code: discountCode.getCode(),
      type: discountCode.getType(),
      value: discountCode.getValue(),
      expirationDate: discountCode.getExpirationDate().toISOString(),
      isActive: discountCode.getIsActive(),
      partition
    });

    if (result.statusCode >= 200 && result.statusCode < 300) {
      return this.getDiscountCodeByCode(discountCode.getCode());
    } else {
      throw CustomError.internal("Could not create discount code.");
    }
  }

  async getDiscountCodeByCode(code: string): Promise<DiscountCode> {
    const id = code;
    const partition = code.substring(0, 3);

    const { resource } = await this.container.item(id, partition).read<CosmosDiscountCodeDocument>();
    if (!resource) {
      throw CustomError.notFound("Discount code not found.");
    }

    return this.toDiscountCode(resource);
  }

  async discountCodeExists(code: string): Promise<boolean> {
    const id = code;
    const partition = code.substring(0, 3);

    const { resource } = await this.container.item(id, partition).read();
    return !!resource;
  }

  async deleteDiscountCode(code: string): Promise<boolean> {
    const id = code;
    const partition = code.substring(0, 3);

    const { statusCode } = await this.container.item(id, partition).delete();
    return statusCode === 204;
  }

  async getAllDiscountCodes(): Promise<DiscountCode[]> {
    const query = {
      query: "SELECT * FROM discountCodes"
    };

    const { resources } = await this.container.items.query<CosmosDiscountCodeDocument>(query).fetchAll();
    return resources.map(this.toDiscountCode);
  }
}
