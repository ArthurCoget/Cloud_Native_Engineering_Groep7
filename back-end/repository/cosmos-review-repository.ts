import { Container, CosmosClient } from "@azure/cosmos";
import { Review } from "../model/review";
import { CustomError } from "../model/custom-error";


export interface CosmosReviewDocument {
  id: string;
  productId: number;
  customerId: number;
  rating: number;
  comment?: string;
  createdAt: string; 
  partition: string;
}


export class CosmosReviewRepository {
  private static instance: CosmosReviewRepository;

  private constructor(private readonly container: Container) {
    if (!container) throw new Error("Review Cosmos DB container is required.");
  }

  static async getInstance(): Promise<CosmosReviewRepository> {
    if (!this.instance) {
      const key = process.env.COSMOS_KEY!;
      const endpoint = process.env.COSMOS_ENDPOINT!;
      const databaseName = process.env.COSMOS_DATABASE_NAME!;
      const containerName = "reviews";
      const partitionKeyPath = ["/partition"];

      const client = new CosmosClient({ endpoint, key });

      const { database } = await client.databases.createIfNotExists({ id: databaseName });
      const { container } = await database.containers.createIfNotExists({
        id: containerName,
        partitionKey: { paths: partitionKeyPath }
      });

      this.instance = new CosmosReviewRepository(container);
    }
    return this.instance;
  }

  private toReview(doc: CosmosReviewDocument): Review {
    return new Review({
      id: parseInt(doc.id),
      productId: doc.productId,
      rating: doc.rating,
      comment: doc.comment,
      customerId: doc.customerId,
      createdAt: new Date(doc.createdAt)
    });
  }

  async createReview(review: Review): Promise<Review> {
    const id = review.getId()?.toString() ?? Date.now().toString();
    const partition = review.getProductId().toString();
    review.setId(parseInt(id));

    const document: CosmosReviewDocument = {
      id,
      productId: review.getProductId(),
      customerId: review.getCustomerId(),
      rating: review.getRating(),
      comment: review.getComment(),
      createdAt: review.getCreatedAt().toISOString(),
      partition
    };

    const result = await this.container.items.create(document);

    if (result.statusCode >= 200 && result.statusCode < 300) {
      return review;
    } else {
      throw CustomError.internal("Could not create review.");
    }
  }

  async getReviewById(id: number, productId: number): Promise<Review> {
    const idStr = id.toString();
    const partition = productId.toString();

    const { resource } = await this.container.item(idStr, partition).read<CosmosReviewDocument>();

    if (!resource) {
      throw CustomError.notFound("Review not found.");
    }

    return this.toReview(resource);
  }

  async getReviewsByProductId(productId: number): Promise<Review[]> {
    const query = {
      query: "SELECT * FROM reviews r WHERE r.productId = @productId",
      parameters: [{ name: "@productId", value: productId }]
    };

    const { resources } = await this.container.items
      .query<CosmosReviewDocument>(query, { partitionKey: productId.toString() })
      .fetchAll();

    return resources.map(this.toReview.bind(this));
  }

  async deleteReview(id: number, productId: number): Promise<boolean> {
    const idStr = id.toString();
    const partition = productId.toString();

    const { statusCode } = await this.container.item(idStr, partition).delete();
    return statusCode === 204;
  }

  async updateReview(review: Review): Promise<Review> {
    const id = review.getId()?.toString();
    if (!id) throw CustomError.invalid("Missing review ID");

    const partition = review.getProductId().toString();

    const document: CosmosReviewDocument = {
      id,
      productId: review.getProductId(),
      customerId: review.getCustomerId(),
      rating: review.getRating(),
      comment: review.getComment(),
      createdAt: review.getCreatedAt().toISOString(),
      partition
    };

    const { resource } = await this.container.items.upsert<CosmosReviewDocument>(document);

    if (!resource) throw CustomError.internal("Review update failed.");
    return this.toReview(resource);
  }
}
