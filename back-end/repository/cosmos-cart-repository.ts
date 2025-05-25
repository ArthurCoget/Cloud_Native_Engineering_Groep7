import { Container, CosmosClient } from "@azure/cosmos";
import { Cart } from "../model/cart";
import { CartItem } from "../model/cartItem";
import { Customer } from "../model/customer";
import { DiscountCode } from "../model/discountCode";
import { Product } from "../model/product";
import { CustomError } from "../model/custom-error";
import { CosmosDiscountCodeDocument } from "./cosmos-discountCode-repository";
import { CosmosProductDocument } from "./cosmos-product-repository";
import { CosmosCustomerDocument } from "./cosmos-customer-repository";

export interface CosmosCartDocument {
  id: string;
  customer: CosmosCustomerDocument;
  products: {
    product: CosmosProductDocument;
    quantity: number;
  }[];
  discountCodes: CosmosDiscountCodeDocument[];
  totalAmount: number;
  partition: string;
}

export class CosmosCartRepository {
  private static instance: CosmosCartRepository;

  private constructor(private readonly container: Container) {
    if (!container) throw new Error("Cart Cosmos DB container is required.");
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

      const client = new CosmosClient({ endpoint, key });
      const { database } = await client.databases.createIfNotExists({ id: databaseName });
      const { container } = await database.containers.createIfNotExists({
        id: containerName,
        partitionKey: { paths: partitionKeyPath }
      });

      this.instance = new CosmosCartRepository(container);
    }
    return this.instance;
  }

  private toCart(document: CosmosCartDocument): Cart {
  const customerDoc = { 
    ...document.customer, 
    id: Number(document.customer.id),
    wishlist: document.customer.wishlist.map((product: CosmosProductDocument) => ({
      id: Number(product.id),
      name: product.name,
      price: product.price,
      stock: product.stock,
      categories: product.categories,
      description: product.description,
      images: product.images,
      sizes: product.sizes,
      colors: product.colors,
      rating: product.rating
    }))
  };
  const customer = Customer.from(customerDoc);
  const cart = new Cart({
    customer: customer,
    products: [],
    discountCodes: [],
    id: Number(document.id)
  });
  cart.setTotalAmount(document.totalAmount);

  document.products.forEach(item => {
    const product = Product.from({
      ...item.product,
      id: typeof item.product.id === 'string' ? parseInt(item.product.id, 10) : item.product.id,
    });
    cart.addItem(product, item.quantity);
  });

  document.discountCodes.forEach(dc => {
    cart.applyDiscountCode(DiscountCode.from({
      ...dc,
      id: typeof dc.id === 'string' ? parseInt(dc.id, 10) : dc.id,
      expirationDate: typeof dc.expirationDate === 'string' ? new Date(dc.expirationDate) : dc.expirationDate
    }));
  });

  return cart;
}

  async createCart(customer: Customer): Promise<Cart> {
    const cart = new Cart({
      customer: customer,
      products: [],
      discountCodes: []
    });
    const id = cart.getId();
    if (id === undefined) {
      throw CustomError.internal("Cart ID is undefined.");
    }
    const partition = customer.getEmail().substring(0, 3);

    const result = await this.container.items.create({
      id: id.toString(),
      customer: customer,
      products: [],
      discountCodes: [],
      totalAmount: 0,
      partition
    });

    if (result.statusCode >= 200 && result.statusCode < 300) {
      return this.getCartById(id.toString());
    } else {
      throw CustomError.internal("Could not create cart.");
    }
  }

  async getCartById(id: string): Promise<Cart> {
    const partition = id.substring(0, 3);
    const { resource } = await this.container.item(id, partition).read<CosmosCartDocument>();
    if (!resource) {
      throw CustomError.notFound("Cart not found.");
    }
    return this.toCart(resource);
  }

  async getCartByCustomerEmail(email: string): Promise<Cart> {
    const query = {
      query: "SELECT * FROM c WHERE c.customer.email = @email",
      parameters: [{ name: "@email", value: email }]
    };
    const { resources } = await this.container.items.query<CosmosCartDocument>(query).fetchAll();
    if (resources.length === 0) {
      throw CustomError.notFound("Cart not found.");
    }
    return this.toCart(resources[0]);
  }

  async deleteCart(id: string): Promise<boolean> {
    const partition = id.substring(0, 3);
    const { statusCode } = await this.container.item(id, partition).delete();
    return statusCode === 204;
  }

  async getAllCarts(): Promise<Cart[]> {
    const query = { query: "SELECT * FROM carts" };
    const { resources } = await this.container.items.query<CosmosCartDocument>(query).fetchAll();
    return resources.map(this.toCart.bind(this));
  }

  async addCartItem(cart: Cart, product: Product, quantity: number): Promise<CartItem> {
    cart.addItem(product, quantity);
    await this.updateCart(cart);
    return cart.getProducts().find(i => i.getProduct().getId() === product.getId())!;
  }

  async removeCartItem(cart: Cart, product: Product, quantity: number): Promise<CartItem | string> {
    const result = cart.removeItem(product, quantity);
    await this.updateCart(cart);
    return result;
  }

  async applyDiscountCode(cart: Cart, discountCode: DiscountCode): Promise<DiscountCode> {
    cart.applyDiscountCode(discountCode);
    await this.updateCart(cart);
    return discountCode;
  }

  async removeDiscountCode(cart: Cart, code: string): Promise<string> {
    const dc = cart.getDiscountCodes().find(d => d.getCode() === code);
    if (!dc) throw CustomError.notFound("Discount code not found in cart.");
    cart.removeDiscountCode(dc);
    await this.updateCart(cart);
    return "Discount code successfully removed.";
  }

  async emptyCart(cart: Cart): Promise<string> {
    cart.emptyCart();
    await this.updateCart(cart);
    return "Cart successfully emptied.";
  }

  private async updateCart(cart: Cart): Promise<void> {
    const id = cart.getId();
    if (id === undefined) {
      throw CustomError.internal("Cart ID is undefined.");
    }
    const idStr = id.toString();
    const partition = cart.getCustomer().getEmail().substring(0, 3);

    const result = await this.container.item(idStr, partition).replace({
      id: idStr,
      customer: cart.getCustomer(),
      products: cart.getProducts(),
      discountCodes: cart.getDiscountCodes(),
      totalAmount: cart.getTotalAmount(),
      partition
    });

    if (!(result.statusCode >= 200 && result.statusCode < 300)) {
      throw CustomError.internal("Failed to update cart.");
    }
  }
}
