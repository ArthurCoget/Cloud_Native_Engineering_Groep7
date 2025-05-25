import { CustomError } from "../model/custom-error";
import { Product } from "../model/product";
import { CosmosProductRepository } from "../repository/cosmos-product-repository";
import { ProductInput, Role } from "../types";


const getRepo = async () => await CosmosProductRepository.getInstance();

const authorizeAdmin = (role: Role) => {
  if (role !== 'admin') {
    throw CustomError.unauthorized('You must be an admin to manage products.');
  }
};

const createProduct = async (
  input: ProductInput,
  email: string,
  role: Role
): Promise<Product> => {
  authorizeAdmin(role);

  const repo = await getRepo();
  const exists = await repo.productExists(input.name);
  if (exists) {
    throw CustomError.conflict('A product with this name already exists.');
  }

  const product = new Product(input);
  return await repo.createProduct(product);
};

const getProducts = async (): Promise<Product[]> => {
  const repo = await getRepo();
  return await repo.getAllProducts();
};

const getProductById = async (id: number): Promise<Product> => {
  const repo = await getRepo();
  return await repo.getProductById(id);
};

const updateProduct = async (
  id: number,
  input: Partial<ProductInput>,
  email: string,
  role: Role
): Promise<Product> => {
  authorizeAdmin(role);

  const repo = await getRepo();
  const product = await repo.getProductById(id);

  if (!product) {
    throw CustomError.notFound(`Product with id ${id} does not exist.`);
  }

  product.validate({
    name: input.name ?? product.getName(),
    price: input.price ?? product.getPrice(),
    stock: input.stock ?? product.getStock(),
    categories: input.categories ?? product.getCategories(),
    description: input.description ?? product.getDescription(),
    images: input.images ?? product.getImages(),
    sizes: input.sizes ?? product.getSizes(),
    colors: input.colors ?? product.getColors(),
    rating: input.rating ?? product.getRating(),
  });

  if (input.name) product.setName(input.name);
  if (input.price) product.setPrice(input.price);
  if (input.stock) product.setStock(input.stock);
  if (input.categories) product.setCategories(input.categories);
  if (input.description) product.setDescription(input.description);
  if (input.images) product.setImages(input.images);
  if (input.sizes) product.setSizes(input.sizes);
  if (input.colors) product.setColors(input.colors);
  if (input.rating) product.setRating(input.rating);

  return await repo.updateProduct(product);
};

const deleteProduct = async (
  id: number,
  email: string,
  role: Role
): Promise<string> => {
  authorizeAdmin(role);

  const repo = await getRepo();
  const product = await repo.getProductById(id);
  if (!product) {
    throw CustomError.notFound('This product does not exist.');
  }

  const success = await repo.deleteProduct(id);
  if (!success) {
    throw CustomError.internal('Failed to delete product.');
  }

  return `Product with id ${id} deleted successfully.`;
};

const addRatingToProduct = async (
  id: number,
  rating: number
): Promise<Product> => {
  if (id === undefined || id === null) {
  throw CustomError.invalid('Product ID is required.');
}
  if (rating < 1 || rating > 5) {
    throw CustomError.invalid('Rating must be between 1 and 5.');
  }

  const repo = await getRepo();
  return await repo.addRating(id, rating);
};

export default {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  addRatingToProduct,
};
