import { Container, CosmosClient } from "@azure/cosmos";
import { Product } from "../model/product";
import { CustomError } from "../model/custom-error";
import crypto from "crypto";

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
  rating: number[];
  partition: string;
}

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

      const { database } = await client.databases.createIfNotExists({ id: databaseName });
      const { container } = await database.containers.createIfNotExists({
        id: containerName,
        partitionKey: { paths: partitionKeyPath }
      });

      this.instance = new CosmosProductRepository(container);
    }
    return this.instance;
  }

  private toProduct(doc: CosmosProductDocument): Product {
    const product = new Product({
      name: doc.name,
      price: doc.price,
      stock: doc.stock,
      categories: doc.categories,
      description: doc.description,
      images: doc.images,
      sizes: doc.sizes,
      colors: doc.colors,
      rating: doc.rating
    });
    product.setId(parseInt(doc.id));
    return product;
  }

  async createProduct(product: Product): Promise<Product> {
    const generatedId = product.getId()?.toString() ?? Date.now().toString();
    const partition = generatedId.substring(0, 3);
    product.setId(parseInt(generatedId));

    const document: CosmosProductDocument = {
      id: generatedId,
      name: product.getName(),
      price: product.getPrice(),
      stock: product.getStock(),
      categories: product.getCategories(),
      description: product.getDescription(),
      images: product.getImages(),
      sizes: product.getSizes(),
      colors: product.getColors(),
      rating: product.getRating(),
      partition
    };

    const result = await this.container.items.create(document);

    if (result.statusCode >= 200 && result.statusCode < 300) {
      return product;
    } else {
      throw CustomError.internal("Could not create product.");
    }
  }

  async getProductById(id: number): Promise<Product> {
    const idStr = id.toString();
    const partition = idStr.substring(0, 3);

    const { resource } = await this.container.item(idStr, partition).read<CosmosProductDocument>();

    if (!resource) {
      throw CustomError.notFound("Product not found.");
    }

    return this.toProduct(resource);
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
    const query = {
      query: "SELECT * FROM products"
    };

    const { resources } = await this.container.items.query<CosmosProductDocument>(query).fetchAll();
    return resources.map(this.toProduct.bind(this));
  }

  async deleteProduct(id: number): Promise<boolean> {
    const idStr = id.toString();
    const partition = idStr.substring(0, 3);

    const { statusCode } = await this.container.item(idStr, partition).delete();
    return statusCode === 204;
  }

  async updateProduct(product: Product): Promise<Product> {
    const id = product.getId()?.toString();
    if (!id) throw CustomError.invalid("Missing product ID");

    const partition = id.substring(0, 3);
    const document: CosmosProductDocument = {
      id,
      name: product.getName(),
      price: product.getPrice(),
      stock: product.getStock(),
      categories: product.getCategories(),
      description: product.getDescription(),
      images: product.getImages(),
      sizes: product.getSizes(),
      colors: product.getColors(),
      rating: product.getRating(),
      partition
    };

    const { resource } = await this.container.items.upsert<CosmosProductDocument>(document);

    if (!resource) {
      throw CustomError.internal("Product update failed.");
    }

    return this.toProduct(resource);
  }

  async addRating(productId: number, rating: number): Promise<Product> {
    const product = await this.getProductById(productId);
    const updatedRatings = [...product.getRating(), rating];
    product.setRating(updatedRatings);
    return await this.updateProduct(product);
  }
}
