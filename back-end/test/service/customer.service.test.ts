import { Cart } from '../../src/model/cart';
import { Customer } from '../../src/model/customer';
import { Order } from '../../src/model/order';
import { OrderItem } from '../../src/model/orderItem';
import { Payment } from '../../src/model/payment';
import { Product } from '../../src/model/product';
import cartDb from '../../src/repository/cart.db';
import customerDb from '../../src/repository/customer.db';
// import orderDb from '../../repository/order.db';
import productDb from '../../src/repository/product.db';
import customerService from '../../src/service/customer.service';
import { CustomerInput } from '../../types';

const products: Product[] = [
    new Product({
        name: 'Plain T-Shirt',
        price: 19.99,
        stock: 100,
        categories: ['Clothing', 'Tops'],
        description: 'A comfortable, everyday t-shirt available in multiple colors.',
        images: 'shirt',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Red', 'Blue', 'Black'],
        rating: [1, 3, 5],
        id: 1,
    }),
    new Product({
        name: 'Sports Shoes',
        price: 69.99,
        stock: 50,
        categories: ['Footwear', 'Sports'],
        description: 'Lightweight and comfortable shoes designed for running.',
        images: 'shoes',
        sizes: ['M', 'L', 'XL'],
        colors: ['White', 'Black'],
        rating: [1, 3, 5],
        id: 2,
    }),
];

const customers: Customer[] = [
    new Customer({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        role: 'customer',
        wishlist: [products[0]],
        id: 1,
    }),
    new Customer({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        password: 'password456',
        role: 'customer',
        wishlist: [],
        id: 2,
    }),
];

let mockCustomerDbGetCustomers: jest.Mock;
let mockCustomerDbGetCustomerById: jest.Mock;
let mockCustomerDbGetCustomerByEmail: jest.Mock;
let mockCustomerDbCreateCustomer: jest.Mock;
let mockCartDbCreateCart: jest.Mock;
let mockCustomerDbUpdateCustomer: jest.Mock;
let mockCustomerDbDeleteCustomer: jest.Mock;
let mockCartDbDeleteCart: jest.Mock;
let mockCartDbGetCartByCustomerId: jest.Mock;
let mockCustomerDbAddProductToWishlist: jest.Mock;
let mockCustomerDbRemoveProductFromWishlist: jest.Mock;
let mockProductDbGetProductById: jest.Mock;

beforeEach(() => {
    mockCustomerDbGetCustomers = jest.fn();
    mockCustomerDbGetCustomerById = jest.fn();
    mockCustomerDbGetCustomerByEmail = jest.fn();
    mockCustomerDbCreateCustomer = jest.fn();
    mockCartDbCreateCart = jest.fn();
    mockCustomerDbUpdateCustomer = jest.fn();
    mockCustomerDbDeleteCustomer = jest.fn();
    mockCartDbDeleteCart = jest.fn();
    mockCartDbGetCartByCustomerId = jest.fn();
    mockCustomerDbAddProductToWishlist = jest.fn();
    mockCustomerDbRemoveProductFromWishlist = jest.fn();
    mockProductDbGetProductById = jest.fn();
});

afterEach(() => {
    jest.clearAllMocks();
});

test('given customers in the DB, when getting all customers, then all customers are returned', async () => {
    customerDb.getCustomers = mockCustomerDbGetCustomers.mockResolvedValue(customers);

    const result = await customerService.getCustomers('admin@example.com', 'admin');

    expect(result).toEqual(customers);
    expect(mockCustomerDbGetCustomers).toHaveBeenCalled();
});

test('given customers in the DB, when getting customer by email, then customer with that id is returned', async () => {
    customerDb.getCustomerByEmail = mockCustomerDbGetCustomerByEmail.mockReturnValue(customers[0]);

    const result = await customerService.getCustomerByEmail(
        'john.doe@example.com',
        'john.doe@example.com',
        'customer'
    );

    expect(result).toEqual(customers[0]);
    expect(mockCustomerDbGetCustomerByEmail).toHaveBeenCalledWith({
        email: 'john.doe@example.com',
    });
});

test('given customers in the DB, when getting customer by incorrect email, then an error is thrown', async () => {
    customerDb.getCustomerByEmail = mockCustomerDbGetCustomerByEmail.mockReturnValue(null);

    const email = 'invalid@example.com';
    const getCustomerByEmail = async () =>
        await customerService.getCustomerByEmail(email, 'invalid@example.com', 'customer');

    await expect(getCustomerByEmail()).rejects.toThrow(
        `Customer with email ${email} does not exist.`
    );
    expect(mockCustomerDbGetCustomerByEmail).toHaveBeenCalledWith({ email });
});

test('given customers in the DB, when getting wishlist by customer email, then that wishlist is returned', async () => {
    customerDb.getCustomerByEmail = mockCustomerDbGetCustomerByEmail.mockReturnValue(customers[0]);

    const result = await customerService.getWishlistByEmail(
        'john.doe@example.com',
        'john.doe@example.com',
        'customer'
    );

    expect(result).toEqual(customers[0].getWishlist());
    expect(mockCustomerDbGetCustomerByEmail).toHaveBeenCalledWith({
        email: 'john.doe@example.com',
    });
});

test('given customers in the DB, when getting wishlist by incorrect customer email, then an error is thrown', async () => {
    customerDb.getCustomerByEmail = mockCustomerDbGetCustomerByEmail.mockReturnValue(null);

    const email = 'invalid@example.com';
    const getWishlistByEmail = async () =>
        await customerService.getWishlistByEmail(email, 'invalid@example.com', 'customer');

    await expect(getWishlistByEmail()).rejects.toThrow(
        `Customer with email ${email} does not exist.`
    );
    expect(mockCustomerDbGetCustomerByEmail).toHaveBeenCalledWith({ email });
});

test('given a valid customer input, when creating a new customer, then it successfully creates the customer', async () => {
    const newCustomerInput: CustomerInput = {
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob.johnson@example.com',
        password: 'password789',
        role: 'customer',
    };

    customerDb.getCustomerByEmail = mockCustomerDbGetCustomerByEmail.mockReturnValue(null);

    const createdCustomer = new Customer({
        ...newCustomerInput,
        wishlist: [],
        id: 1,
    });

    customerDb.createCustomer = mockCustomerDbCreateCustomer.mockReturnValue(createdCustomer);

    const cart = new Cart({ customer: createdCustomer, products: [], discountCodes: [] });

    cartDb.createCart = mockCartDbCreateCart.mockReturnValue(cart);

    const result = await customerService.createCustomer(newCustomerInput);

    expect(result).toEqual(createdCustomer);
    expect(mockCustomerDbGetCustomerByEmail).toHaveBeenCalledWith({
        email: newCustomerInput.email,
    });
    expect(mockCustomerDbCreateCustomer).toHaveBeenCalledWith(
        expect.objectContaining({
            ...newCustomerInput,
            wishlist: [],
            id: undefined,
            password: expect.any(String),
        })
    );
    expect(mockCartDbCreateCart).toHaveBeenCalledWith(createdCustomer);
});

test('given an existing customer, when creating that customer again, then an error is thrown', async () => {
    const newCustomerInput: CustomerInput = {
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'john.doe@example.com',
        password: 'password789',
        role: 'customer',
    };

    customerDb.getCustomerByEmail = mockCustomerDbGetCustomerByEmail.mockReturnValue(customers[0]);

    const createCustomer = async () => await customerService.createCustomer(newCustomerInput);

    await expect(createCustomer).rejects.toThrow('A customer with this email already exists.');
    expect(mockCustomerDbGetCustomerByEmail).toHaveBeenCalledWith({
        email: newCustomerInput.email,
    });
    expect(mockCustomerDbCreateCustomer).not.toHaveBeenCalled();
});

test('given an existing customer, when updating customer details, then customer is updated', async () => {
    const updatedCustomerData: CustomerInput = {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@example.com',
        password: 'newpassword123',
        role: 'customer',
    };

    const createdCustomer = new Customer({
        ...updatedCustomerData,
        wishlist: [],
        id: 1,
    });

    customerDb.getCustomerByEmail = mockCustomerDbGetCustomerByEmail.mockReturnValue(customers[0]);
    customerDb.updateCustomer = mockCustomerDbUpdateCustomer.mockReturnValue(createdCustomer);

    const result = await customerService.updateCustomer(
        'john.smith@example.com',
        updatedCustomerData,
        'john.smith@example.com',
        'customer'
    );

    expect(result.getFirstName()).toEqual(updatedCustomerData.firstName);
    expect(result.getLastName()).toEqual(updatedCustomerData.lastName);
    expect(result.getEmail()).toEqual(updatedCustomerData.email);
    expect(result.getPassword()).toEqual(updatedCustomerData.password);

    expect(mockCustomerDbGetCustomerByEmail).toHaveBeenCalledWith({
        email: 'john.smith@example.com',
    });
    expect(mockCustomerDbUpdateCustomer).toHaveBeenCalledWith(
        expect.objectContaining(updatedCustomerData)
    );
});

test('given a non-existent customer, when updating customer, then an error is thrown', async () => {
    customerDb.getCustomerByEmail = mockCustomerDbGetCustomerByEmail.mockReturnValue(null);

    const updatedCustomerData: CustomerInput = {
        firstName: 'Non',
        lastName: 'Existent',
        email: 'non.existent@example.com',
        password: 'nopassword',
        role: 'customer',
    };

    const updateCustomer = async () =>
        await customerService.updateCustomer(
            'invalid@example.com',
            updatedCustomerData,
            'invalid@example.com',
            'customer'
        );

    await expect(updateCustomer).rejects.toThrow('This customer does not exist.');
    expect(mockCustomerDbGetCustomerByEmail).toHaveBeenCalledWith({
        email: 'invalid@example.com',
    });
});

test('given an existing customer, when deleting the customer, then the customer is deleted', async () => {
    customerDb.getCustomerByEmail = mockCustomerDbGetCustomerByEmail.mockReturnValue(customers[0]);
    cartDb.getCartByCustomerEmail = mockCustomerDbGetCustomerByEmail.mockReturnValue(
        new Cart({ customer: customers[0], products: [], discountCodes: [], id: 1 })
    );

    customerDb.deleteCustomer = mockCustomerDbDeleteCustomer.mockReturnValue(
        'Customer has been deleted.'
    );
    cartDb.deleteCart = mockCartDbDeleteCart.mockReturnValue('Cart deleted');

    const result = await customerService.deleteCustomer(
        'john.doe@example.com',
        'john.doe@example.com',
        'customer'
    );

    expect(result).toEqual('Customer has been deleted.');
    expect(mockCustomerDbGetCustomerByEmail).toHaveBeenCalledWith({
        email: 'john.doe@example.com',
    });
    expect(mockCartDbDeleteCart).toHaveBeenCalledWith({ id: 1 });
    expect(mockCustomerDbDeleteCustomer).toHaveBeenCalledWith({ email: 'john.doe@example.com' });
});

test('given a non-existent customer, when deleting the customer, then an error is thrown', async () => {
    customerDb.getCustomerByEmail = mockCustomerDbGetCustomerByEmail.mockReturnValue(null);

    const deleteCustomer = async () =>
        await customerService.deleteCustomer(
            'nonExisting@example.com',
            'nonExisting@example.com',
            'customer'
        );

    await expect(deleteCustomer).rejects.toThrow('This customer does not exist.');
    expect(mockCustomerDbGetCustomerByEmail).toHaveBeenCalledWith({
        email: 'nonExisting@example.com',
    });
});

test('given a customer, when adding a product to wishlist, then the product is added', async () => {
    customerDb.getCustomerByEmail = mockCustomerDbGetCustomerByEmail.mockReturnValue(customers[0]);
    productDb.getProductById = mockProductDbGetProductById.mockReturnValue(products[1]);
    customerDb.addProductToWishlist = mockCustomerDbAddProductToWishlist.mockReturnValue(
        products[1]
    );

    const result = await customerService.addProductToWishlist(
        'john.doe@example.com',
        2,
        'john.doe@example.com',
        'customer'
    );

    expect(result).toEqual(products[1]);
    expect(mockCustomerDbAddProductToWishlist).toHaveBeenCalledWith(customers[0], products[1]);
});

test('given a customer with existing wishlist, when adding a duplicate product to wishlist, then an error is thrown', async () => {
    customerDb.getCustomerByEmail = mockCustomerDbGetCustomerByEmail.mockReturnValue(customers[0]);
    productDb.getProductById = mockProductDbGetProductById.mockReturnValue(products[0]);

    const addProductToWishlist = async () =>
        await customerService.addProductToWishlist(
            'john.doe@example.com',
            1,
            'john.doe@example.com',
            'customer'
        );

    await expect(addProductToWishlist).rejects.toThrow(
        'Product with id 1 is already in the wishlist.'
    );
});

test('given a customer, when removing a product from wishlist, then the product is removed', async () => {
    customerDb.getCustomerByEmail = mockCustomerDbGetCustomerByEmail.mockReturnValue(customers[0]);
    productDb.getProductById = mockProductDbGetProductById.mockReturnValue(products[0]);
    customerDb.removeProductFromWishlist = mockCustomerDbRemoveProductFromWishlist.mockReturnValue(
        'Product removed from wishlist.'
    );

    const result = await customerService.removeProductFromWishlist(
        'john.doe@example.com',
        1,
        'john.doe@example.com',
        'customer'
    );

    expect(result).toEqual('Product removed from wishlist.');
    expect(mockCustomerDbRemoveProductFromWishlist).toHaveBeenCalledWith(customers[0], products[0]);
});

test('given a customer, when removing a product not in the wishlist, then an error is thrown', async () => {
    customerDb.getCustomerByEmail = mockCustomerDbGetCustomerByEmail.mockReturnValue(customers[0]);
    productDb.getProductById = mockProductDbGetProductById.mockReturnValue(products[1]);

    const removeProductFromWishlist = async () =>
        await customerService.removeProductFromWishlist(
            'john.doe@example.com',
            2,
            'john.doe@example.com',
            'customer'
        );

    await expect(removeProductFromWishlist).rejects.toThrow(
        'Product with id 2 is not in the wishlist.'
    );
});

test('given a non-existent product, when adding to wishlist, then an error is thrown', async () => {
    customerDb.getCustomerByEmail = mockCustomerDbGetCustomerByEmail.mockReturnValue(customers[0]);
    productDb.getProductById = mockProductDbGetProductById.mockReturnValue(null);

    const addProductToWishlist = async () =>
        await customerService.addProductToWishlist(
            'john.doe@example.com',
            3,
            'john.doe@example.com',
            'customer'
        );

    await expect(addProductToWishlist).rejects.toThrow('Product with id 3 does not exist.');
});

test('given non-admin role, when getting all customers, then UnauthorizedError is thrown', async () => {
    const getCustomers = async () => {
        await customerService.getCustomers('user@example.com', 'customer');
    };

    await expect(getCustomers).rejects.toThrowError('You must be an admin to access all users.');
});

test('given non-admin role, when getting customer by email, then UnauthorizedError is thrown', async () => {
    const getCustomerByEmail = async () => {
        await customerService.getCustomerByEmail(
            'john.doe@example.com',
            'user@example.com',
            'customer'
        );
    };

    await expect(getCustomerByEmail).rejects.toThrowError(
        'You must be an admin, salesman or be logged in as the same user.'
    );
});

test('given non-admin role, when getting wishlist by email, then UnauthorizedError is thrown', async () => {
    const getWishlistByEmail = async () => {
        await customerService.getWishlistByEmail(
            'john.doe@example.com',
            'user@example.com',
            'customer'
        );
    };

    await expect(getWishlistByEmail).rejects.toThrowError(
        'You must be an admin, salesman or be logged in as the same user.'
    );
});

test('given non-admin role, when updating a customer, then UnauthorizedError is thrown', async () => {
    const updatedCustomerData: CustomerInput = {
        firstName: 'Updated',
        lastName: 'User',
        email: 'updated@example.com',
        password: 'password',
        role: 'customer',
    };
    const updateCustomer = async () => {
        await customerService.updateCustomer(
            'john.doe@example.com',
            updatedCustomerData,
            'user@example.com',
            'customer'
        );
    };

    await expect(updateCustomer).rejects.toThrowError(
        'You must be an admin, salesman or be logged in as the same user.'
    );
});

test('given non-admin role, when deleting a customer, then UnauthorizedError is thrown', async () => {
    const deleteCustomer = async () => {
        await customerService.deleteCustomer(
            'john.doe@example.com',
            'user@example.com',
            'customer'
        );
    };

    await expect(deleteCustomer).rejects.toThrowError(
        'You must be an admin, salesman or be logged in as the same user.'
    );
});

test('given non-admin role, when adding a product to wishlist, then UnauthorizedError is thrown', async () => {
    const addProductToWishlist = async () => {
        await customerService.addProductToWishlist(
            'john.doe@example.com',
            1,
            'user@example.com',
            'customer'
        );
    };

    await expect(addProductToWishlist).rejects.toThrowError(
        'You must be an admin, salesman or be logged in as the same user.'
    );
});

test('given non-admin role, when removing a product from wishlist, then UnauthorizedError is thrown', async () => {
    const removeProductFromWishlist = async () => {
        await customerService.removeProductFromWishlist(
            'john.doe@example.com',
            1,
            'user@example.com',
            'customer'
        );
    };

    await expect(removeProductFromWishlist).rejects.toThrowError(
        'You must be an admin, salesman or be logged in as the same user.'
    );
});
