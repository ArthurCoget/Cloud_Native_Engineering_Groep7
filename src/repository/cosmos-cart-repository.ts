import { Container, CosmosClient } from "@azure/cosmos";
import { CustomError } from "../model/custom-error";
import { Cart } from "../model/cart";
import { CartItem } from "../model/cartItem";
import { Customer } from "../model/customer";
import { Product } from "../model/product";
import { DiscountCode } from "../model/discountCode";
import { CosmosCustomerRepository } from "./cosmos-customer-repository";
import { CosmosProductRepository } from "./cosmos-product-repository";
import { CosmosDiscountCodeRepository } from "./cosmos-discountCode-repository";
import { CosmosProductDocument } from "./cosmos-product-repository";
import { Role } from "../types";

export interface CosmosDiscountCodeDocument {
  id: string;
  code: string;
  type: "fixed" | "percentage";
  value: number;
  expirationDate: string; // Aligned with updateCart
  isActive: boolean;
  partition: string;
}

export interface CosmosCartItemDocument {
  id: string;
  productId: string;
  quantity: number;
  product: CosmosProductDocument;
}

export interface CosmosCartDocument {
  id: string;
  customerId: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  products: CosmosCartItemDocument[];
  discountCodes: CosmosDiscountCodeDocument[];
  totalAmount: number;
  partition: string;
}

export class CosmosCartRepository {
  private static instance: CosmosCartRepository;

  private constructor(private readonly container: Container) {
    if (!container) {
      throw new Error("Cart Cosmos DB container is required.");
    }
  }

  static async getInstance(): Promise<CosmosCartRepository> {
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

  private async toCart(doc: CosmosCartDocument): Promise<Cart> {
    const customerRepo = await CosmosCustomerRepository.getInstance();
    const productRepo = await CosmosProductRepository.getInstance();
    const discountCodeRepo = await CosmosDiscountCodeRepository.getInstance();

    let customer = await customerRepo.getCustomerById(doc.customerId);

    if (!customer) {
      throw CustomError.notFound(
        `Customer with ID ${doc.customerId} not found`
      );
    }

    const products = await Promise.all(
      doc.products.map(async (item) => {
        const product = await productRepo.getProductById(
          parseInt(item.productId)
        );
        if (!product) {
          throw CustomError.notFound(
            `Product with ID ${item.productId} not found`
          );
        }
        return CartItem.fromCosmos({
          id: parseInt(item.id),
          product,
          quantity: item.quantity,
        });
      })
    );

    const discountCodes = await Promise.all(
      doc.discountCodes.map(async (dc) => {
        const discountCode = await discountCodeRepo.getDiscountCodeByCode(
          dc.code
        );
        if (!discountCode) {
          throw CustomError.notFound(
            `Discount code with ID ${dc.id} not found`
          );
        }
        return discountCode;
      })
    );

    return Cart.fromCosmos({
      id: parseInt(doc.id),
      customer,
      products,
      discountCodes,
      totalAmount: doc.totalAmount,
    });
  }

  async createCart(customer: Customer): Promise<Cart> {
    const customerId = customer.getId();
    if (!customerId) {
      throw CustomError.invalid("Customer ID is required to create a cart");
    }

    const id = Date.now().toString();
    const partition = id.substring(0, 3);
    const cart = new Cart({
      customer,
      products: [],
      discountCodes: [],
    });
    cart.setTotalAmount(0);

    const document: CosmosCartDocument = {
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
      throw CustomError.internal("Failed to create cart.");
    }

    cart.setId(parseInt(id));
    return cart;
  }

  async getCarts(): Promise<Cart[]> {
    const query = { query: "SELECT * FROM c" };
    const { resources } = await this.container.items
      .query<CosmosCartDocument>(query)
      .fetchAll();
    return Promise.all(resources.map((doc) => this.toCart(doc)));
  }

  async getCartById(id: number): Promise<Cart | null> {
    const idStr = id.toString();
    const partition = idStr.substring(0, 3);
    const { resource } = await this.container
      .item(idStr, partition)
      .read<CosmosCartDocument>();
    if (!resource) {
      return null;
    }
    return this.toCart(resource);
  }

  async getCartByCustomerEmail(email: string): Promise<Cart | null> {
    const customerRepo = await CosmosCustomerRepository.getInstance();
    const customer = await customerRepo.getCustomerByEmail(email);
    if (!customer) {
      return null;
    }

    const customerId = customer.getId();
    if (!customerId) {
      throw CustomError.invalid(`Customer with email ${email} has no ID`);
    }

    const query = {
      query: "SELECT * FROM c WHERE c.customerId = @customerId",
      parameters: [{ name: "@customerId", value: customerId.toString() }],
    };
    const { resources } = await this.container.items
      .query<CosmosCartDocument>(query)
      .fetchAll();
    if (resources.length === 0) {
      return await this.createCart(customer);
    }
    return this.toCart(resources[0]);
  }

  async addCartItem(
    cart: Cart,
    product: Product,
    quantity: number
  ): Promise<CartItem> {
    const cartItem = cart.addItem(product, quantity);
    await this.updateCart(cart);
    return cartItem;
  }

  async removeCartItem(
    cart: Cart,
    product: Product,
    quantity: number
  ): Promise<CartItem | string> {
    const result = cart.removeItem(product, quantity);
    await this.updateCart(cart);
    return result;
  }

  async addDiscountCode(
    cart: Cart,
    discountCode: DiscountCode
  ): Promise<DiscountCode> {
    const appliedDiscountCode = cart.applyDiscountCode(discountCode);
    await this.updateCart(cart);
    return appliedDiscountCode;
  }

  async removeDiscountCode(cart: Cart, code: string): Promise<string> {
    const discountCode = cart
      .getDiscountCodes()
      .find((dc) => dc.getCode() === code);
    if (!discountCode) {
      throw CustomError.notFound(`Discount code ${code} not applied to cart`);
    }
    const result = cart.removeDiscountCode(discountCode);
    await this.updateCart(cart);
    return result;
  }

  async emptyCart(cart: Cart): Promise<void> {
    cart.emptyCart();
    await this.updateCart(cart);
  }

  private async updateCart(cart: Cart): Promise<void> {
    const id = cart.getId();
    if (!id) {
      throw CustomError.invalid("Cart ID is required to update");
    }
    const customerId = cart.getCustomer().getId();
    if (!customerId) {
      throw CustomError.invalid("Customer ID is required to update cart");
    }

    const idStr = id.toString();
    const partition = idStr.substring(0, 3);

    const document: CosmosCartDocument = {
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
          reviews: [],
          partition: item.getProduct().getId()!.toString().substring(0, 3),
        },
      })),
      discountCodes: cart.getDiscountCodes().map((dc) => ({
        id: dc.getId()!.toString(),
        code: dc.getCode(),
        type: dc.getType() as "fixed" | "percentage",
        value: dc.getValue(),
        expirationDate: dc.getExpirationDate().toISOString(),
        isActive: dc.getIsActive(),
        partition: dc.getId()!.toString().substring(0, 3),
      })),
      totalAmount: cart.getTotalAmount(),
      partition,
    };

    const { resource } = await this.container
      .item(idStr, partition)
      .replace(document);
    if (!resource) {
      throw CustomError.internal("Failed to update cart.");
    }
  }
}
