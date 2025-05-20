"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cart_1 = require("../../model/cart");
const customer_1 = require("../../model/customer");
const product_1 = require("../../model/product");
const cart_db_1 = __importDefault(require("../../repository/cart.db"));
const customer_db_1 = __importDefault(require("../../repository/customer.db"));
// import orderDb from '../../repository/order.db';
const product_db_1 = __importDefault(require("../../repository/product.db"));
const customer_service_1 = __importDefault(require("../../service/customer.service"));
const products = [
    new product_1.Product({
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
    new product_1.Product({
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
const customers = [
    new customer_1.Customer({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        role: 'customer',
        wishlist: [products[0]],
        id: 1,
    }),
    new customer_1.Customer({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        password: 'password456',
        role: 'customer',
        wishlist: [],
        id: 2,
    }),
];
let mockCustomerDbGetCustomers;
let mockCustomerDbGetCustomerById;
let mockCustomerDbGetCustomerByEmail;
let mockCustomerDbCreateCustomer;
let mockCartDbCreateCart;
let mockCustomerDbUpdateCustomer;
let mockCustomerDbDeleteCustomer;
let mockCartDbDeleteCart;
let mockCartDbGetCartByCustomerId;
let mockCustomerDbAddProductToWishlist;
let mockCustomerDbRemoveProductFromWishlist;
let mockProductDbGetProductById;
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
test('given customers in the DB, when getting all customers, then all customers are returned', () => __awaiter(void 0, void 0, void 0, function* () {
    customer_db_1.default.getCustomers = mockCustomerDbGetCustomers.mockResolvedValue(customers);
    const result = yield customer_service_1.default.getCustomers('admin@example.com', 'admin');
    expect(result).toEqual(customers);
    expect(mockCustomerDbGetCustomers).toHaveBeenCalled();
}));
test('given customers in the DB, when getting customer by email, then customer with that id is returned', () => __awaiter(void 0, void 0, void 0, function* () {
    customer_db_1.default.getCustomerByEmail = mockCustomerDbGetCustomerByEmail.mockReturnValue(customers[0]);
    const result = yield customer_service_1.default.getCustomerByEmail('john.doe@example.com', 'john.doe@example.com', 'customer');
    expect(result).toEqual(customers[0]);
    expect(mockCustomerDbGetCustomerByEmail).toHaveBeenCalledWith({
        email: 'john.doe@example.com',
    });
}));
test('given customers in the DB, when getting customer by incorrect email, then an error is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
    customer_db_1.default.getCustomerByEmail = mockCustomerDbGetCustomerByEmail.mockReturnValue(null);
    const email = 'invalid@example.com';
    const getCustomerByEmail = () => __awaiter(void 0, void 0, void 0, function* () { return yield customer_service_1.default.getCustomerByEmail(email, 'invalid@example.com', 'customer'); });
    yield expect(getCustomerByEmail()).rejects.toThrow(`Customer with email ${email} does not exist.`);
    expect(mockCustomerDbGetCustomerByEmail).toHaveBeenCalledWith({ email });
}));
test('given customers in the DB, when getting wishlist by customer email, then that wishlist is returned', () => __awaiter(void 0, void 0, void 0, function* () {
    customer_db_1.default.getCustomerByEmail = mockCustomerDbGetCustomerByEmail.mockReturnValue(customers[0]);
    const result = yield customer_service_1.default.getWishlistByEmail('john.doe@example.com', 'john.doe@example.com', 'customer');
    expect(result).toEqual(customers[0].getWishlist());
    expect(mockCustomerDbGetCustomerByEmail).toHaveBeenCalledWith({
        email: 'john.doe@example.com',
    });
}));
test('given customers in the DB, when getting wishlist by incorrect customer email, then an error is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
    customer_db_1.default.getCustomerByEmail = mockCustomerDbGetCustomerByEmail.mockReturnValue(null);
    const email = 'invalid@example.com';
    const getWishlistByEmail = () => __awaiter(void 0, void 0, void 0, function* () { return yield customer_service_1.default.getWishlistByEmail(email, 'invalid@example.com', 'customer'); });
    yield expect(getWishlistByEmail()).rejects.toThrow(`Customer with email ${email} does not exist.`);
    expect(mockCustomerDbGetCustomerByEmail).toHaveBeenCalledWith({ email });
}));
test('given a valid customer input, when creating a new customer, then it successfully creates the customer', () => __awaiter(void 0, void 0, void 0, function* () {
    const newCustomerInput = {
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob.johnson@example.com',
        password: 'password789',
        role: 'customer',
    };
    customer_db_1.default.getCustomerByEmail = mockCustomerDbGetCustomerByEmail.mockReturnValue(null);
    const createdCustomer = new customer_1.Customer(Object.assign(Object.assign({}, newCustomerInput), { wishlist: [], id: 1 }));
    customer_db_1.default.createCustomer = mockCustomerDbCreateCustomer.mockReturnValue(createdCustomer);
    const cart = new cart_1.Cart({ customer: createdCustomer, products: [], discountCodes: [] });
    cart_db_1.default.createCart = mockCartDbCreateCart.mockReturnValue(cart);
    const result = yield customer_service_1.default.createCustomer(newCustomerInput);
    expect(result).toEqual(createdCustomer);
    expect(mockCustomerDbGetCustomerByEmail).toHaveBeenCalledWith({
        email: newCustomerInput.email,
    });
    expect(mockCustomerDbCreateCustomer).toHaveBeenCalledWith(expect.objectContaining(Object.assign(Object.assign({}, newCustomerInput), { wishlist: [], id: undefined, password: expect.any(String) })));
    expect(mockCartDbCreateCart).toHaveBeenCalledWith(createdCustomer);
}));
test('given an existing customer, when creating that customer again, then an error is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
    const newCustomerInput = {
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'john.doe@example.com',
        password: 'password789',
        role: 'customer',
    };
    customer_db_1.default.getCustomerByEmail = mockCustomerDbGetCustomerByEmail.mockReturnValue(customers[0]);
    const createCustomer = () => __awaiter(void 0, void 0, void 0, function* () { return yield customer_service_1.default.createCustomer(newCustomerInput); });
    yield expect(createCustomer).rejects.toThrow('A customer with this email already exists.');
    expect(mockCustomerDbGetCustomerByEmail).toHaveBeenCalledWith({
        email: newCustomerInput.email,
    });
    expect(mockCustomerDbCreateCustomer).not.toHaveBeenCalled();
}));
test('given an existing customer, when updating customer details, then customer is updated', () => __awaiter(void 0, void 0, void 0, function* () {
    const updatedCustomerData = {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@example.com',
        password: 'newpassword123',
        role: 'customer',
    };
    const createdCustomer = new customer_1.Customer(Object.assign(Object.assign({}, updatedCustomerData), { wishlist: [], id: 1 }));
    customer_db_1.default.getCustomerByEmail = mockCustomerDbGetCustomerByEmail.mockReturnValue(customers[0]);
    customer_db_1.default.updateCustomer = mockCustomerDbUpdateCustomer.mockReturnValue(createdCustomer);
    const result = yield customer_service_1.default.updateCustomer('john.smith@example.com', updatedCustomerData, 'john.smith@example.com', 'customer');
    expect(result.getFirstName()).toEqual(updatedCustomerData.firstName);
    expect(result.getLastName()).toEqual(updatedCustomerData.lastName);
    expect(result.getEmail()).toEqual(updatedCustomerData.email);
    expect(result.getPassword()).toEqual(updatedCustomerData.password);
    expect(mockCustomerDbGetCustomerByEmail).toHaveBeenCalledWith({
        email: 'john.smith@example.com',
    });
    expect(mockCustomerDbUpdateCustomer).toHaveBeenCalledWith(expect.objectContaining(updatedCustomerData));
}));
test('given a non-existent customer, when updating customer, then an error is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
    customer_db_1.default.getCustomerByEmail = mockCustomerDbGetCustomerByEmail.mockReturnValue(null);
    const updatedCustomerData = {
        firstName: 'Non',
        lastName: 'Existent',
        email: 'non.existent@example.com',
        password: 'nopassword',
        role: 'customer',
    };
    const updateCustomer = () => __awaiter(void 0, void 0, void 0, function* () {
        return yield customer_service_1.default.updateCustomer('invalid@example.com', updatedCustomerData, 'invalid@example.com', 'customer');
    });
    yield expect(updateCustomer).rejects.toThrow('This customer does not exist.');
    expect(mockCustomerDbGetCustomerByEmail).toHaveBeenCalledWith({
        email: 'invalid@example.com',
    });
}));
test('given an existing customer, when deleting the customer, then the customer is deleted', () => __awaiter(void 0, void 0, void 0, function* () {
    customer_db_1.default.getCustomerByEmail = mockCustomerDbGetCustomerByEmail.mockReturnValue(customers[0]);
    cart_db_1.default.getCartByCustomerEmail = mockCustomerDbGetCustomerByEmail.mockReturnValue(new cart_1.Cart({ customer: customers[0], products: [], discountCodes: [], id: 1 }));
    customer_db_1.default.deleteCustomer = mockCustomerDbDeleteCustomer.mockReturnValue('Customer has been deleted.');
    cart_db_1.default.deleteCart = mockCartDbDeleteCart.mockReturnValue('Cart deleted');
    const result = yield customer_service_1.default.deleteCustomer('john.doe@example.com', 'john.doe@example.com', 'customer');
    expect(result).toEqual('Customer has been deleted.');
    expect(mockCustomerDbGetCustomerByEmail).toHaveBeenCalledWith({
        email: 'john.doe@example.com',
    });
    expect(mockCartDbDeleteCart).toHaveBeenCalledWith({ id: 1 });
    expect(mockCustomerDbDeleteCustomer).toHaveBeenCalledWith({ email: 'john.doe@example.com' });
}));
test('given a non-existent customer, when deleting the customer, then an error is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
    customer_db_1.default.getCustomerByEmail = mockCustomerDbGetCustomerByEmail.mockReturnValue(null);
    const deleteCustomer = () => __awaiter(void 0, void 0, void 0, function* () {
        return yield customer_service_1.default.deleteCustomer('nonExisting@example.com', 'nonExisting@example.com', 'customer');
    });
    yield expect(deleteCustomer).rejects.toThrow('This customer does not exist.');
    expect(mockCustomerDbGetCustomerByEmail).toHaveBeenCalledWith({
        email: 'nonExisting@example.com',
    });
}));
test('given a customer, when adding a product to wishlist, then the product is added', () => __awaiter(void 0, void 0, void 0, function* () {
    customer_db_1.default.getCustomerByEmail = mockCustomerDbGetCustomerByEmail.mockReturnValue(customers[0]);
    product_db_1.default.getProductById = mockProductDbGetProductById.mockReturnValue(products[1]);
    customer_db_1.default.addProductToWishlist = mockCustomerDbAddProductToWishlist.mockReturnValue(products[1]);
    const result = yield customer_service_1.default.addProductToWishlist('john.doe@example.com', 2, 'john.doe@example.com', 'customer');
    expect(result).toEqual(products[1]);
    expect(mockCustomerDbAddProductToWishlist).toHaveBeenCalledWith(customers[0], products[1]);
}));
test('given a customer with existing wishlist, when adding a duplicate product to wishlist, then an error is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
    customer_db_1.default.getCustomerByEmail = mockCustomerDbGetCustomerByEmail.mockReturnValue(customers[0]);
    product_db_1.default.getProductById = mockProductDbGetProductById.mockReturnValue(products[0]);
    const addProductToWishlist = () => __awaiter(void 0, void 0, void 0, function* () {
        return yield customer_service_1.default.addProductToWishlist('john.doe@example.com', 1, 'john.doe@example.com', 'customer');
    });
    yield expect(addProductToWishlist).rejects.toThrow('Product with id 1 is already in the wishlist.');
}));
test('given a customer, when removing a product from wishlist, then the product is removed', () => __awaiter(void 0, void 0, void 0, function* () {
    customer_db_1.default.getCustomerByEmail = mockCustomerDbGetCustomerByEmail.mockReturnValue(customers[0]);
    product_db_1.default.getProductById = mockProductDbGetProductById.mockReturnValue(products[0]);
    customer_db_1.default.removeProductFromWishlist = mockCustomerDbRemoveProductFromWishlist.mockReturnValue('Product removed from wishlist.');
    const result = yield customer_service_1.default.removeProductFromWishlist('john.doe@example.com', 1, 'john.doe@example.com', 'customer');
    expect(result).toEqual('Product removed from wishlist.');
    expect(mockCustomerDbRemoveProductFromWishlist).toHaveBeenCalledWith(customers[0], products[0]);
}));
test('given a customer, when removing a product not in the wishlist, then an error is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
    customer_db_1.default.getCustomerByEmail = mockCustomerDbGetCustomerByEmail.mockReturnValue(customers[0]);
    product_db_1.default.getProductById = mockProductDbGetProductById.mockReturnValue(products[1]);
    const removeProductFromWishlist = () => __awaiter(void 0, void 0, void 0, function* () {
        return yield customer_service_1.default.removeProductFromWishlist('john.doe@example.com', 2, 'john.doe@example.com', 'customer');
    });
    yield expect(removeProductFromWishlist).rejects.toThrow('Product with id 2 is not in the wishlist.');
}));
test('given a non-existent product, when adding to wishlist, then an error is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
    customer_db_1.default.getCustomerByEmail = mockCustomerDbGetCustomerByEmail.mockReturnValue(customers[0]);
    product_db_1.default.getProductById = mockProductDbGetProductById.mockReturnValue(null);
    const addProductToWishlist = () => __awaiter(void 0, void 0, void 0, function* () {
        return yield customer_service_1.default.addProductToWishlist('john.doe@example.com', 3, 'john.doe@example.com', 'customer');
    });
    yield expect(addProductToWishlist).rejects.toThrow('Product with id 3 does not exist.');
}));
test('given non-admin role, when getting all customers, then UnauthorizedError is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
    const getCustomers = () => __awaiter(void 0, void 0, void 0, function* () {
        yield customer_service_1.default.getCustomers('user@example.com', 'customer');
    });
    yield expect(getCustomers).rejects.toThrowError('You must be an admin to access all users.');
}));
test('given non-admin role, when getting customer by email, then UnauthorizedError is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
    const getCustomerByEmail = () => __awaiter(void 0, void 0, void 0, function* () {
        yield customer_service_1.default.getCustomerByEmail('john.doe@example.com', 'user@example.com', 'customer');
    });
    yield expect(getCustomerByEmail).rejects.toThrowError('You must be an admin, salesman or be logged in as the same user.');
}));
test('given non-admin role, when getting wishlist by email, then UnauthorizedError is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
    const getWishlistByEmail = () => __awaiter(void 0, void 0, void 0, function* () {
        yield customer_service_1.default.getWishlistByEmail('john.doe@example.com', 'user@example.com', 'customer');
    });
    yield expect(getWishlistByEmail).rejects.toThrowError('You must be an admin, salesman or be logged in as the same user.');
}));
test('given non-admin role, when updating a customer, then UnauthorizedError is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
    const updatedCustomerData = {
        firstName: 'Updated',
        lastName: 'User',
        email: 'updated@example.com',
        password: 'password',
        role: 'customer',
    };
    const updateCustomer = () => __awaiter(void 0, void 0, void 0, function* () {
        yield customer_service_1.default.updateCustomer('john.doe@example.com', updatedCustomerData, 'user@example.com', 'customer');
    });
    yield expect(updateCustomer).rejects.toThrowError('You must be an admin, salesman or be logged in as the same user.');
}));
test('given non-admin role, when deleting a customer, then UnauthorizedError is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
    const deleteCustomer = () => __awaiter(void 0, void 0, void 0, function* () {
        yield customer_service_1.default.deleteCustomer('john.doe@example.com', 'user@example.com', 'customer');
    });
    yield expect(deleteCustomer).rejects.toThrowError('You must be an admin, salesman or be logged in as the same user.');
}));
test('given non-admin role, when adding a product to wishlist, then UnauthorizedError is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
    const addProductToWishlist = () => __awaiter(void 0, void 0, void 0, function* () {
        yield customer_service_1.default.addProductToWishlist('john.doe@example.com', 1, 'user@example.com', 'customer');
    });
    yield expect(addProductToWishlist).rejects.toThrowError('You must be an admin, salesman or be logged in as the same user.');
}));
test('given non-admin role, when removing a product from wishlist, then UnauthorizedError is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
    const removeProductFromWishlist = () => __awaiter(void 0, void 0, void 0, function* () {
        yield customer_service_1.default.removeProductFromWishlist('john.doe@example.com', 1, 'user@example.com', 'customer');
    });
    yield expect(removeProductFromWishlist).rejects.toThrowError('You must be an admin, salesman or be logged in as the same user.');
}));
