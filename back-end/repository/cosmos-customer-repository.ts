import { CosmosClient, Container } from '@azure/cosmos';
import { Customer } from '../model/customer';
import { Product } from '../model/product';
import { Product as ProductPrisma } from '@prisma/client';
import { CustomError } from '../model/custom-error';
import { CosmosProductDocument } from './cosmos-product-repository';



export interface CosmosCustomerDocument {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  wishlist: CosmosProductDocument[];
  partition: string;
}

export class CosmosCustomerRepository {
  private static instance: CosmosCustomerRepository;

  private constructor(private readonly container: Container) {}

  static async getInstance(): Promise<CosmosCustomerRepository> {
    if (!this.instance) {
      const endpoint = process.env.COSMOS_ENDPOINT;
      const key = process.env.COSMOS_KEY;
      const databaseName = process.env.COSMOS_DATABASE_NAME;
      const containerName = 'customers';

      if (!endpoint || !key || !databaseName) {
        throw new Error('Missing Cosmos DB credentials.');
      }

      const client = new CosmosClient({ endpoint, key });

      const { database } = await client.databases.createIfNotExists({ id: databaseName });

      const { container } = await database.containers.createIfNotExists({
        id: containerName,
        partitionKey: { paths: ['/partition'] },
      });

      this.instance = new CosmosCustomerRepository(container);
    }

    return this.instance;
  }

  private toCustomer(doc: CosmosCustomerDocument): Customer {
    return new Customer({
      id: parseInt(doc.id, 10),
      firstName: doc.firstName,
      lastName: doc.lastName,
      email: doc.email,
      password: doc.password,
      role: doc.role as any,
      wishlist: doc.wishlist.map((productDoc) =>
        Product.fromCosmos({ 
          ...productDoc,
          
        })
      ),
    });
  }

  private fromCustomer(customer: Customer): CosmosCustomerDocument {
  return {
    id: customer.getId()?.toString() ?? customer.getEmail(),
    firstName: customer.getFirstName(),
    lastName: customer.getLastName(),
    email: customer.getEmail(),
    password: customer.getPassword(),
    role: customer.getRole(),
    wishlist: customer.getWishlist().map((product) => ({
      id: product.getId()?.toString() ?? '', 
      name: product.getName(),
      price: product.getPrice(),
      stock: product.getStock(),
      categories: product.getCategories(),
      description: product.getDescription(),
      images: product.getImages(),
      sizes: product.getSizes(),
      colors: product.getColors(),
      reviews: product.getReviews().map((review) => ({
        id: review.getId()?.toString() ?? '',
        rating: review.getRating(),
        comment: review.getComment(),
        createdAt: review.getCreatedAt().toISOString(),
        productId: review.getProductId(),
        customerId: review.getCustomerId(),
        partition: 'review',
      })),
      partition: 'product',
    })),
    partition: 'customer',
  };
}


  async getCustomers(): Promise<Customer[]> {
    const query = { query: 'SELECT * FROM c' };
    const { resources } = await this.container.items.query<CosmosCustomerDocument>(query).fetchAll();
    return resources.map(this.toCustomer);
  }

  async getCustomerById(id: number): Promise<Customer | null> {
    try {
      const { resource } = await this.container.item(id.toString(), 'customer').read<CosmosCustomerDocument>();
      return resource ? this.toCustomer(resource as unknown as CosmosCustomerDocument) : null;
    } catch (error) {
      if ((error as any).code === 404) return null;
      console.error(error);
      throw CustomError.internal('Database error. See server log for details.');
    }
  }

  async getCustomerByEmail(email: string): Promise<Customer | null> {
  const query = {
    query: 'SELECT * FROM c WHERE c.email = @email',
    parameters: [{ name: '@email', value: email }],
  };

  const { resources } = await this.container.items
    .query<CosmosCustomerDocument>(query, {
      partitionKey: 'customer', 
    })
    .fetchAll();

  return resources.length ? this.toCustomer(resources[0]) : null;
}

  async createCustomer(customer: Customer): Promise<Customer> {
    const doc = this.fromCustomer(customer);
    const { resource } = await this.container.items.create(doc);
    return this.toCustomer(resource as unknown as CosmosCustomerDocument);
  }

  async updateCustomer(customer: Customer): Promise<Customer> {
    const doc = this.fromCustomer(customer);
    const { resource } = await this.container.items.upsert(doc);
    return this.toCustomer(resource as unknown as CosmosCustomerDocument);
  }

  async deleteCustomer(email: string): Promise<string> {
    const customer = await this.getCustomerByEmail(email);
    if (!customer) {
      throw new Error('Customer not found.');
    }
    await this.container.item(customer.getId()!.toString(), 'customer').delete();
    return 'Customer has been deleted.';
  }

  async addProductToWishlist(customer: Customer, product: Product): Promise<Product> {
    const wishlist = [...customer.getWishlist(), product];
    customer = new Customer({ 
      id: customer.getId(),
      firstName: customer.getFirstName(),
      lastName: customer.getLastName(),
      email: customer.getEmail(),
      password: customer.getPassword(),
      role: customer.getRole(),
      wishlist
    });
    await this.updateCustomer(customer);
    return product;
  }

  async removeProductFromWishlist(customer: Customer, product: Product): Promise<string> {
    const wishlist = customer.getWishlist().filter((p) => p.getId() !== product.getId());
    customer = new Customer({ 
      id: customer.getId(),
      firstName: customer.getFirstName(),
      lastName: customer.getLastName(),
      email: customer.getEmail(),
      password: customer.getPassword(),
      role: customer.getRole(),
      wishlist
    });
    await this.updateCustomer(customer);
    return 'Product has been removed from the wishlist.';
  }
}
