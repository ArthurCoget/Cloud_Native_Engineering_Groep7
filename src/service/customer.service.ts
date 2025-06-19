import * as bcrypt from "bcrypt";
import { UnauthorizedError } from "express-jwt";
import { Customer } from "../model/customer";
import { Product } from "../model/product";
import { AuthenticationResponse, CustomerInput, Role } from "../types";
import { generateJwtToken } from "../util/jwt";
import { CosmosCartRepository } from "../repository/cosmos-cart-repository";

import { CosmosCustomerRepository } from "../repository/cosmos-customer-repository";
import { CosmosProductRepository } from "../repository/cosmos-product-repository";
// IDs
import { v4 as uuidv4 } from "uuid";

export class CustomerService {
  private static instance: CustomerService;

  public static getInstance() {
    if (!this.instance) {
      this.instance = new CustomerService();
    }
    return this.instance;
  }

  getCustomerRepo = async () => await CosmosCustomerRepository.getInstance();
  getCartRepo = async () => await CosmosCartRepository.getInstance();
  getProductRepo = async () => await CosmosProductRepository.getInstance();

  getCustomers = async (email: string, role: Role): Promise<Customer[]> => {
    if (role === "admin") {
      const customerDB = await this.getCustomerRepo();
      return await customerDB.getCustomers();
    } else {
      throw new UnauthorizedError("credentials_required", {
        message: "You must be an admin to access all users.",
      });
    }
  };

  getCustomerByEmail = async (
    email: string,
    authEmail: string,
    role: Role
  ): Promise<Customer | null> => {
    if (
      role === "admin" ||
      role === "salesman" ||
      (role === "customer" && email === authEmail)
    ) {
      const customerDB = await this.getCustomerRepo();
      const customer = await customerDB.getCustomerByEmail(email);

      if (!customer)
        throw new Error(`Customer with email ${email} does not exist.`);

      return customer;
    } else {
      throw new UnauthorizedError("credentials_required", {
        message:
          "You must be an admin, salesman or be logged in as the same user.",
      });
    }
  };

  getWishlistByEmail = async (
    email: string,
    authEmail: string,
    role: Role
  ): Promise<Product[] | null> => {
    const customerDB = await this.getCustomerRepo();
    const customer = await customerDB.getCustomerByEmail(email);
    return customer!.getWishlist();
  };

  createCustomer = async ({
    firstName,
    lastName,
    email,
    password,
  }: CustomerInput): Promise<Customer> => {
    const customerDB = await this.getCustomerRepo();
    const cartDB = await this.getCartRepo();

    const existingCustomer = await customerDB.getCustomerByEmail(email);
    if (existingCustomer)
      throw new Error("A customer with this email already exists.");

    const hashedPassword = await bcrypt.hash(password, 12);

    const id = uuidv4();

    const customer = new Customer({
      id,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: "customer",
      wishlist: [],
    });

    const existingCart = await cartDB.getCartByCustomerEmail(
      customer.getEmail()
    );
    if (existingCart) throw new Error("This customer already has a cart.");

    const newCustomer = await customerDB.createCustomer(customer);
    await cartDB.createCart(newCustomer);

    return newCustomer;
  };

  updateCustomer = async (
    currentEmail: string,
    { firstName, lastName, email, password }: CustomerInput,
    authEmail: string,
    role: Role
  ): Promise<Customer> => {
    if (
      role === "admin" ||
      role === "salesman" ||
      (role === "customer" && currentEmail === authEmail)
    ) {
      const customerDB = await this.getCustomerRepo();
      const existingCustomer = await customerDB.getCustomerByEmail(
        currentEmail
      );
      if (!existingCustomer) throw new Error("This customer does not exist.");

      const newUserData = {
        firstName,
        lastName,
        email,
        password,
        role: existingCustomer.getRole(),
      };

      existingCustomer.updateUser(newUserData);

      return await customerDB.updateCustomer(existingCustomer);
    } else {
      throw new UnauthorizedError("credentials_required", {
        message:
          "You must be an admin, salesman or be logged in as the same user.",
      });
    }
  };

  // const deleteCustomer = async (email: string, authEmail: string, role: Role): Promise<string> => {
  //     if (role === 'admin' || role === 'salesman' || (role === 'customer' && email === authEmail)) {
  //         const customerDB = await getCustomerRepo();
  //         const cartDB = await getCartRepo();

  //         const existingCustomer = await customerDB.getCustomerByEmail(email);
  //         if (!existingCustomer) throw new Error('This customer does not exist.');

  //         const existingCart = await cartDB.getCartByCustomerEmail(email);
  //         if (!existingCart) throw new Error('That customer does not have a cart.');

  //         await cartDB.deleteCart(existingCart.getId()!.toString());

  //         return await customerDB.deleteCustomer(email);
  //     } else {
  //         throw new UnauthorizedError('credentials_required', {
  //             message: 'You must be an admin, salesman or be logged in as the same user.',
  //         });
  //     }
  // };

  addProductToWishlist = async (
    email: string,
    productId: number,
    authEmail: string,
    role: Role
  ): Promise<Product> => {
    if (
      role === "admin" ||
      role === "salesman" ||
      (role === "customer" && email === authEmail)
    ) {
      const customerDB = await this.getCustomerRepo();
      const productDB = await this.getProductRepo();

      const customer = await customerDB.getCustomerByEmail(email);
      const product = await productDB.getProductById(productId);

      if (!product)
        throw new Error(`Product with id ${productId} does not exist.`);

      if (customer!.getWishlist().some((item) => item.getId() === productId)) {
        throw new Error(
          `Product with id ${productId} is already in the wishlist.`
        );
      }

      return await customerDB.addProductToWishlist(customer!, product);
    } else {
      throw new UnauthorizedError("credentials_required", {
        message:
          "You must be an admin, salesman or be logged in as the same user.",
      });
    }
  };

  removeProductFromWishlist = async (
    email: string,
    productId: number,
    authEmail: string,
    role: Role
  ): Promise<string> => {
    if (
      role === "admin" ||
      role === "salesman" ||
      (role === "customer" && email === authEmail)
    ) {
      const customerDB = await this.getCustomerRepo();
      const productDB = await this.getProductRepo();

      const customer = await customerDB.getCustomerByEmail(email);
      const product = await productDB.getProductById(productId);

      if (!product)
        throw new Error(`Product with id ${productId} does not exist.`);
      if (!customer!.getWishlist().some((item) => item.getId() === productId)) {
        throw new Error(`Product with id ${productId} is not in the wishlist.`);
      }

      return await customerDB.removeProductFromWishlist(customer!, product);
    } else {
      throw new UnauthorizedError("credentials_required", {
        message:
          "You must be an admin, salesman or be logged in as the same user.",
      });
    }
  };

  authenticate = async ({
    email,
    password,
  }: CustomerInput): Promise<AuthenticationResponse> => {
    const customerDB = await this.getCustomerRepo();
    console.log("Attempting login for email:", email);
    const customer = await customerDB.getCustomerByEmail(email);
    if (!customer) {
      console.error("Customer not found for email:", email);
      throw new Error("That email and password combination is incorrect.");
    }
    console.log("Customer found:", customer.getEmail());

    const isValidPassword = await bcrypt.compare(
      password,
      customer.getPassword()
    );
    if (!isValidPassword) {
      console.error("Password mismatch for email:", email);
      throw new Error("That email and password combination is incorrect.");
    }

    return {
      token: generateJwtToken({ email, role: customer.getRole() }),
      email: email,
      fullname: `${customer.getFirstName()} ${customer.getLastName()}`,
      role: customer.getRole(),
    };
  };
}
