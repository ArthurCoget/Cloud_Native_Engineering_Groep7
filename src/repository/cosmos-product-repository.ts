import { Container, CosmosClient } from "@azure/cosmos";
import { Product } from "../model/product";
import { Review } from "../model/review";

import { CustomError } from "../model/custom-error";
import crypto from "crypto";
import { CosmosReviewDocument } from "./cosmos-review-repository";

export interface CosmosProductDocument {
  id: string;
  name: string;
  price: number;
  stock: number;
  categories: string[];
  description: string;
  images: string;
  sizes: string[];
  colors: string[];
  reviews: CosmosReviewDocument[];
  partition: string;
}

export const reviewToCosmos = (review: Review): CosmosReviewDocument => ({
  id: review.getId.toString(),
  rating: review.getRating(),
  comment: review.getComment() ?? undefined,
  productId: review.getProductId(),
  customerId: review.getCustomerId(),
  createdAt: review.getCreatedAt().toISOString(),
  partition: review.getId.toString().substring(0, 3),
});

export class CosmosProductRepository {
  private static instance: CosmosProductRepository;

  private constructor(private readonly container: Container) {
    if (!container) {
      throw new Error("Product Cosmos DB container is required.");
    }
  }

  static async getInstance() {
    if (!this.instance) {
      const key = process.env.COSMOS_KEY;
      const endpoint = process.env.COSMOS_ENDPOINT;
      const databaseName = process.env.COSMOS_DATABASE_NAME;
      const containerName = "products";
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

      this.instance = new CosmosProductRepository(container);
    }
    return this.instance;
  }

  private toProduct(doc: CosmosProductDocument): Product {
    return Product.fromCosmos(doc);
  }

  async createProduct(product: Product): Promise<Product> {
    const generatedId = product.getId()?.toString() ?? Date.now().toString();
    const partition = generatedId.substring(0, 3);
    product.setId(parseInt(generatedId));
    const reviews = product.getReviews().map((r) =>
      reviewToCosmos({
        id: r.getId(),
        rating: r.getRating(),
        comment: r.getComment(),
        createdAt: r.getCreatedAt(),
        productId: r.getProductId(),
        customerId: r.getCustomerId(),
      } as unknown as Review)
    );

    const document: CosmosProductDocument = {
      id: generatedId,
      name: product.getName(),
      price: product.getPrice(),
      stock: product.getStock(),
      categories: product.getCategories() ?? [], // Ensure array
      description: product.getDescription(),
      images: product.getImages() ?? "none", // Default to valid image
      sizes: product.getSizes() ?? [], // Ensure array
      colors: product.getColors() ?? [], // Ensure array
      reviews,
      partition,
    };

    const result = await this.container.items.create(document);

    if (result.statusCode >= 200 && result.statusCode < 300) {
      return product;
    } else {
      throw CustomError.internal("Could not create product.");
    }
  }

  async updateProduct(product: Product): Promise<Product> {
    const id = product.getId()?.toString();
    if (!id) throw CustomError.invalid("Missing product ID");

    const reviews = product.getReviews().map((r) =>
      reviewToCosmos({
        id: r.getId(),
        rating: r.getRating(),
        comment: r.getComment(),
        createdAt: r.getCreatedAt(),
        productId: r.getProductId(),
        customerId: r.getCustomerId(),
      } as unknown as Review)
    );

    const partition = id.substring(0, 3);
    const document: CosmosProductDocument = {
      id,
      name: product.getName(),
      price: product.getPrice(),
      stock: product.getStock(),
      categories: product.getCategories() ?? [], // Ensure array
      description: product.getDescription(),
      images: product.getImages() ?? "none", // Default to valid image
      sizes: product.getSizes() ?? [], // Ensure array
      colors: product.getColors() ?? [], // Ensure array
      reviews,
      partition,
    };

    const { resource } =
      await this.container.items.upsert<CosmosProductDocument>(document);

    if (!resource) {
      throw CustomError.internal("Product update failed.");
    }

    return this.toProduct(resource);
  }

  async getProductById(id: number): Promise<Product> {
    const idStr = id.toString();
    const query = {
      query: "SELECT * FROM c WHERE c.id = @id",
      parameters: [{ name: "@id", value: idStr }],
    };

    const { resources } = await this.container.items
      .query<CosmosProductDocument>(query)
      .fetchAll();

    if (!resources || resources.length === 0) {
      throw CustomError.notFound("Product not found.");
    }

    return this.toProduct(resources[0]);
  }

  async productExists(name: string): Promise<boolean> {
    const id = name;
    const partitionKey = id.substring(0, 3);

    try {
      const { resource } = await this.container.item(id, partitionKey).read();
      return !!resource;
    } catch (err: any) {
      if (err.code === 404) return false;
      throw err;
    }
  }

  async getAllProducts(): Promise<Product[]> {
    console.log("c");
    const query = {
      query: "SELECT * FROM c",
    };
    console.log("d");
    const { resources } = await this.container.items
      .query<CosmosProductDocument>(query)
      .fetchAll();
    console.log("e");
    return resources.map(this.toProduct.bind(this));
  }

  async deleteProduct(id: number): Promise<boolean> {
    const idStr = id.toString();
    const partition = idStr.substring(0, 3);

    const { statusCode } = await this.container.item(idStr, partition).delete();
    return statusCode === 204;
  }

  // async addRating(productId: number, rating: number): Promise<Product> {
  //   const product = await this.getProductById(productId);
  //   const updatedRatings = [...product.getRating(), rating];
  //   product.setRating(updatedRatings);
  //   return await this.updateProduct(product);
  // }
}
