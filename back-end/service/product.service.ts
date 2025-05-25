import { CustomError } from "../model/custom-error";
import { Product } from "../model/product";
import { CosmosProductRepository } from "../repository/cosmos-product-repository";
import { ProductInput, Role } from "../types";

// Repo instance
const getRepo = async () => await CosmosProductRepository.getInstance();

// Authorization
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
  const existing = await repo.productExists(input.name);
  if (existing) {
    throw CustomError.conflict('A product with this name already exists.');
  }

  const newProduct = new Product(input);
  return repo.createProduct(newProduct);
};

const getProducts = async (): Promise<Product[]> => {
  const repo = await getRepo();
  return repo.getAllProducts();
};

const getProductById = async (id: number): Promise<Product> => {
  const repo = await getRepo();
  const product = await repo.getProductById(id);

  if (!product) {
    throw CustomError.notFound(`Product with id ${id} does not exist.`);
  }

  return product;
};

const updateProduct = async (
  id: number,
  input: Partial<ProductInput>,
  email: string,
  role: Role
): Promise<Product> => {
  authorizeAdmin(role);

  const repo = await getRepo();
  const existing = await repo.getProductById(id);
  if (!existing) {
    throw CustomError.notFound(`Product with id ${id} does not exist.`);
  }

  // Validate and apply updates
  existing.validate({
    name: input.name ?? existing.getName(),
    price: input.price ?? existing.getPrice(),
    stock: input.stock ?? existing.getStock(),
    categories: input.categories ?? existing.getCategories(),
    description: input.description ?? existing.getDescription(),
    images: input.images ?? existing.getImages(),
    sizes: input.sizes ?? existing.getSizes(),
    colors: input.colors ?? existing.getColors(),
    rating: input.rating ?? existing.getRating(),
  });

  if (input.name) existing.setName(input.name);
  if (input.price) existing.setPrice(input.price);
  if (input.stock) existing.setStock(input.stock);
  if (input.categories) existing.setCategories(input.categories);
  if (input.description) existing.setDescription(input.description);
  if (input.images) existing.setImages(input.images);
  if (input.sizes) existing.setSizes(input.sizes);
  if (input.colors) existing.setColors(input.colors);

  return repo.updateProduct(existing);
};

const deleteProduct = async (
  id: number,
  email: string,
  role: Role
): Promise<string> => {
  authorizeAdmin(role);

  const repo = await getRepo();
  const exists = await repo.getProductById(id);
  if (!exists) {
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
  if (!id) throw CustomError.invalid('Product ID is required.');
  if (rating < 1 || rating > 5) {
    throw CustomError.invalid('Rating must be between 1 and 5.');
  }

  const repo = await getRepo();
  const updated = await repo.addRating(id, rating);

  if (!updated) {
    throw CustomError.internal('Failed to add rating to product.');
  }

  return updated;
};

export default {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  addRatingToProduct,
};