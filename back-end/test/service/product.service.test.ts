import productService from '../../src/service/product.service';
import productDb from '../../src/repository/product.db';
import { Product } from '../../src/model/product';
import { ProductInput } from '../../types';

let mockProductDbCreateProduct: jest.Mock;
let mockProductDbGetProducts: jest.Mock;
let mockProductDbGetProductById: jest.Mock;
let mockProductDbGetProductByName: jest.Mock;
let mockProductDbUpdateProduct: jest.Mock;
let mockProductDbDeleteProduct: jest.Mock;
let mockProductDbGetProductsBySearch: jest.Mock;

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

beforeEach(() => {
    mockProductDbCreateProduct = jest.fn();
    mockProductDbGetProducts = jest.fn();
    mockProductDbGetProductById = jest.fn();
    mockProductDbGetProductByName = jest.fn();
    mockProductDbUpdateProduct = jest.fn();
    mockProductDbDeleteProduct = jest.fn();
    mockProductDbGetProductsBySearch = jest.fn();

    productDb.createProduct = mockProductDbCreateProduct;
    productDb.getProducts = mockProductDbGetProducts;
    productDb.getProductById = mockProductDbGetProductById;
    productDb.getProductByName = mockProductDbGetProductByName;
    productDb.updateProduct = mockProductDbUpdateProduct;
    productDb.deleteProduct = mockProductDbDeleteProduct;
});

afterEach(() => {
    jest.clearAllMocks();
});

test('given products in the DB, when getting all products, then all products are returned', async () => {
    mockProductDbGetProducts.mockResolvedValue(products);

    const result = await productService.getProducts();

    expect(result).toEqual(products);
    expect(mockProductDbGetProducts).toHaveBeenCalled();
});

test('given a valid product ID, when getting product by ID, then the correct product is returned', async () => {
    mockProductDbGetProductById.mockResolvedValue(products[0]);

    const result = await productService.getProductById(1);

    expect(result).toEqual(products[0]);
    expect(mockProductDbGetProductById).toHaveBeenCalledWith({ id: 1 });
});

test('given a non-existent product ID, when getting product by ID, then an error is thrown', async () => {
    mockProductDbGetProductById.mockResolvedValue(null);

    await expect(productService.getProductById(3)).rejects.toThrow(
        'Product with id 3 does not exist.'
    );
    expect(mockProductDbGetProductById).toHaveBeenCalledWith({ id: 3 });
});

test('given a valid product input, when creating a product, then the product is created', async () => {
    const newProductInput: ProductInput = {
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

    const newProduct = new Product({ ...newProductInput, id: 3 });

    mockProductDbGetProductByName.mockResolvedValue(null);
    mockProductDbGetProducts.mockResolvedValue(products);
    mockProductDbCreateProduct.mockResolvedValue(newProduct);

    const result = await productService.createProduct(
        newProductInput,
        'admin@example.com',
        'admin'
    );

    expect(result).toEqual(newProduct);
    expect(mockProductDbGetProductByName).toHaveBeenCalledWith({ name: newProductInput.name });
    expect(mockProductDbCreateProduct).toHaveBeenCalledWith(expect.any(Product));
});

test('given an existing product, when creating it again, then an error is thrown', async () => {
    mockProductDbGetProductByName.mockResolvedValue(products[0]);

    const duplicateProductInput: ProductInput = {
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

    await expect(
        productService.createProduct(duplicateProductInput, 'admin@example.com', 'admin')
    ).rejects.toThrow('A product with this name already exists.');
    expect(mockProductDbGetProductByName).toHaveBeenCalledWith({
        name: duplicateProductInput.name,
    });
    expect(mockProductDbCreateProduct).not.toHaveBeenCalled();
});

test('given a valid product update, when updating a product, then the product is updated', async () => {
    const updatedProductData: ProductInput = {
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

    const updatedProduct = new Product({ ...updatedProductData, id: 1 });

    mockProductDbGetProductById.mockResolvedValue(products[0]);
    mockProductDbUpdateProduct.mockResolvedValue(updatedProduct);

    const result = await productService.updateProduct(
        1,
        updatedProductData,
        'admin@example.com',
        'admin'
    );

    expect(result).toEqual(updatedProduct);
    expect(mockProductDbGetProductById).toHaveBeenCalledWith({ id: 1 });
    expect(mockProductDbUpdateProduct).toHaveBeenCalledWith(updatedProduct);
});

test('given a non-existent product ID, when updating the product, then an error is thrown', async () => {
    mockProductDbGetProductById.mockResolvedValue(null);

    const updatedProductData: ProductInput = {
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

    await expect(
        productService.updateProduct(3, updatedProductData, 'admin@example.com', 'admin')
    ).rejects.toThrow('Product with id 3 does not exist.');
    expect(mockProductDbGetProductById).toHaveBeenCalledWith({ id: 3 });
});

test('given a valid product ID, when deleting the product, then the product is deleted', async () => {
    mockProductDbGetProductById.mockResolvedValue(products[0]);
    mockProductDbDeleteProduct.mockResolvedValue('Product has been deleted.');

    const result = await productService.deleteProduct(1, 'admin@example.com', 'admin');

    expect(result).toEqual('Product has been deleted.');
    expect(mockProductDbGetProductById).toHaveBeenCalledWith({ id: 1 });
    expect(mockProductDbDeleteProduct).toHaveBeenCalledWith({ id: 1 });
});

test('given a non-existent product ID, when deleting the product, then an error is thrown', async () => {
    mockProductDbGetProductById.mockResolvedValue(null);

    await expect(productService.deleteProduct(3, 'admin@example.com', 'admin')).rejects.toThrow(
        'This product does not exist.'
    );
    expect(mockProductDbGetProductById).toHaveBeenCalledWith({ id: 3 });
});

test('given non-admin role, when creating a product, then UnauthorizedError is thrown', async () => {
    const createProduct = async () => {
        await productService.createProduct(
            {
                name: 'New Product',
                price: 19.99,
                stock: 100,
                categories: ['Test'],
                description: 'Test Description',
                images: 'test-image',
                sizes: ['S', 'M'],
                colors: ['Red'],
                rating: [4],
            },
            'user@example.com',
            'customer'
        );
    };

    await expect(createProduct).rejects.toThrowError('You must be an admin to manage products.');
});

test('given non-admin role, when updating a product, then UnauthorizedError is thrown', async () => {
    const updateProduct = async () => {
        await productService.updateProduct(
            1,
            {
                name: 'Updated Product',
                price: 29.99,
            },
            'user@example.com',
            'customer'
        );
    };

    await expect(updateProduct).rejects.toThrowError('You must be an admin to manage products.');
});

test('given non-admin role, when deleting a product, then UnauthorizedError is thrown', async () => {
    const deleteProduct = async () => {
        await productService.deleteProduct(1, 'user@example.com', 'customer');
    };

    await expect(deleteProduct).rejects.toThrowError('You must be an admin to manage products.');
});
