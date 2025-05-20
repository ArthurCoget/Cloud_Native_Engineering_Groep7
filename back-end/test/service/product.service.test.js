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
const product_service_1 = __importDefault(require("../../service/product.service"));
const product_db_1 = __importDefault(require("../../repository/product.db"));
const product_1 = require("../../model/product");
let mockProductDbCreateProduct;
let mockProductDbGetProducts;
let mockProductDbGetProductById;
let mockProductDbGetProductByName;
let mockProductDbUpdateProduct;
let mockProductDbDeleteProduct;
let mockProductDbGetProductsBySearch;
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
beforeEach(() => {
    mockProductDbCreateProduct = jest.fn();
    mockProductDbGetProducts = jest.fn();
    mockProductDbGetProductById = jest.fn();
    mockProductDbGetProductByName = jest.fn();
    mockProductDbUpdateProduct = jest.fn();
    mockProductDbDeleteProduct = jest.fn();
    mockProductDbGetProductsBySearch = jest.fn();
    product_db_1.default.createProduct = mockProductDbCreateProduct;
    product_db_1.default.getProducts = mockProductDbGetProducts;
    product_db_1.default.getProductById = mockProductDbGetProductById;
    product_db_1.default.getProductByName = mockProductDbGetProductByName;
    product_db_1.default.updateProduct = mockProductDbUpdateProduct;
    product_db_1.default.deleteProduct = mockProductDbDeleteProduct;
});
afterEach(() => {
    jest.clearAllMocks();
});
test('given products in the DB, when getting all products, then all products are returned', () => __awaiter(void 0, void 0, void 0, function* () {
    mockProductDbGetProducts.mockResolvedValue(products);
    const result = yield product_service_1.default.getProducts();
    expect(result).toEqual(products);
    expect(mockProductDbGetProducts).toHaveBeenCalled();
}));
test('given a valid product ID, when getting product by ID, then the correct product is returned', () => __awaiter(void 0, void 0, void 0, function* () {
    mockProductDbGetProductById.mockResolvedValue(products[0]);
    const result = yield product_service_1.default.getProductById(1);
    expect(result).toEqual(products[0]);
    expect(mockProductDbGetProductById).toHaveBeenCalledWith({ id: 1 });
}));
test('given a non-existent product ID, when getting product by ID, then an error is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
    mockProductDbGetProductById.mockResolvedValue(null);
    yield expect(product_service_1.default.getProductById(3)).rejects.toThrow('Product with id 3 does not exist.');
    expect(mockProductDbGetProductById).toHaveBeenCalledWith({ id: 3 });
}));
test('given a valid product input, when creating a product, then the product is created', () => __awaiter(void 0, void 0, void 0, function* () {
    const newProductInput = {
        name: 'Running Shoes',
        price: 79.99,
        stock: 30,
        categories: ['Footwear', 'Sports'],
        description: 'Durable and comfortable running shoes.',
        images: 'shoes',
        sizes: ['M', 'L', 'XL'],
        colors: ['Blue', 'Green'],
        rating: [1, 3, 5],
    };
    const newProduct = new product_1.Product(Object.assign(Object.assign({}, newProductInput), { id: 3 }));
    mockProductDbGetProductByName.mockResolvedValue(null);
    mockProductDbGetProducts.mockResolvedValue(products);
    mockProductDbCreateProduct.mockResolvedValue(newProduct);
    const result = yield product_service_1.default.createProduct(newProductInput, 'admin@example.com', 'admin');
    expect(result).toEqual(newProduct);
    expect(mockProductDbGetProductByName).toHaveBeenCalledWith({ name: newProductInput.name });
    expect(mockProductDbCreateProduct).toHaveBeenCalledWith(expect.any(product_1.Product));
}));
test('given an existing product, when creating it again, then an error is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
    mockProductDbGetProductByName.mockResolvedValue(products[0]);
    const duplicateProductInput = {
        name: 'Plain T-Shirt',
        price: 19.99,
        stock: 100,
        categories: ['Clothing', 'Tops'],
        description: 'A comfortable, everyday t-shirt available in multiple colors.',
        images: 'image3.jpg',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Red', 'Blue', 'Black'],
        rating: [1, 3, 5],
    };
    yield expect(product_service_1.default.createProduct(duplicateProductInput, 'admin@example.com', 'admin')).rejects.toThrow('A product with this name already exists.');
    expect(mockProductDbGetProductByName).toHaveBeenCalledWith({
        name: duplicateProductInput.name,
    });
    expect(mockProductDbCreateProduct).not.toHaveBeenCalled();
}));
test('given a valid product update, when updating a product, then the product is updated', () => __awaiter(void 0, void 0, void 0, function* () {
    const updatedProductData = {
        name: 'Plain T-Shirt',
        price: 24.99,
        stock: 80,
        categories: ['Clothing', 'Tops'],
        description: 'Updated description for a comfortable t-shirt.',
        images: 'shirt',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Red', 'Blue', 'Black'],
        rating: [1, 3, 5],
    };
    const updatedProduct = new product_1.Product(Object.assign(Object.assign({}, updatedProductData), { id: 1 }));
    mockProductDbGetProductById.mockResolvedValue(products[0]);
    mockProductDbUpdateProduct.mockResolvedValue(updatedProduct);
    const result = yield product_service_1.default.updateProduct(1, updatedProductData, 'admin@example.com', 'admin');
    expect(result).toEqual(updatedProduct);
    expect(mockProductDbGetProductById).toHaveBeenCalledWith({ id: 1 });
    expect(mockProductDbUpdateProduct).toHaveBeenCalledWith(updatedProduct);
}));
test('given a non-existent product ID, when updating the product, then an error is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
    mockProductDbGetProductById.mockResolvedValue(null);
    const updatedProductData = {
        name: 'Non-Existent Product',
        price: 49.99,
        stock: 0,
        categories: ['Unknown'],
        description: 'This product does not exist.',
        images: 'image3.jpg',
        sizes: ['N/A'],
        colors: ['N/A'],
        rating: [1, 3, 5],
    };
    yield expect(product_service_1.default.updateProduct(3, updatedProductData, 'admin@example.com', 'admin')).rejects.toThrow('Product with id 3 does not exist.');
    expect(mockProductDbGetProductById).toHaveBeenCalledWith({ id: 3 });
}));
test('given a valid product ID, when deleting the product, then the product is deleted', () => __awaiter(void 0, void 0, void 0, function* () {
    mockProductDbGetProductById.mockResolvedValue(products[0]);
    mockProductDbDeleteProduct.mockResolvedValue('Product has been deleted.');
    const result = yield product_service_1.default.deleteProduct(1, 'admin@example.com', 'admin');
    expect(result).toEqual('Product has been deleted.');
    expect(mockProductDbGetProductById).toHaveBeenCalledWith({ id: 1 });
    expect(mockProductDbDeleteProduct).toHaveBeenCalledWith({ id: 1 });
}));
test('given a non-existent product ID, when deleting the product, then an error is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
    mockProductDbGetProductById.mockResolvedValue(null);
    yield expect(product_service_1.default.deleteProduct(3, 'admin@example.com', 'admin')).rejects.toThrow('This product does not exist.');
    expect(mockProductDbGetProductById).toHaveBeenCalledWith({ id: 3 });
}));
test('given non-admin role, when creating a product, then UnauthorizedError is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
    const createProduct = () => __awaiter(void 0, void 0, void 0, function* () {
        yield product_service_1.default.createProduct({
            name: 'New Product',
            price: 19.99,
            stock: 100,
            categories: ['Test'],
            description: 'Test Description',
            images: 'test-image',
            sizes: ['S', 'M'],
            colors: ['Red'],
            rating: [4],
        }, 'user@example.com', 'customer');
    });
    yield expect(createProduct).rejects.toThrowError('You must be an admin to manage products.');
}));
test('given non-admin role, when updating a product, then UnauthorizedError is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
    const updateProduct = () => __awaiter(void 0, void 0, void 0, function* () {
        yield product_service_1.default.updateProduct(1, {
            name: 'Updated Product',
            price: 29.99,
        }, 'user@example.com', 'customer');
    });
    yield expect(updateProduct).rejects.toThrowError('You must be an admin to manage products.');
}));
test('given non-admin role, when deleting a product, then UnauthorizedError is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
    const deleteProduct = () => __awaiter(void 0, void 0, void 0, function* () {
        yield product_service_1.default.deleteProduct(1, 'user@example.com', 'customer');
    });
    yield expect(deleteProduct).rejects.toThrowError('You must be an admin to manage products.');
}));
