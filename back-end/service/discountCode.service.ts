import { UnauthorizedError } from 'express-jwt';
import { DiscountCode } from '../model/discountCode';
import discountCodeDB from '../repository/discountCode.db';
import { DiscountCodeInput, Role } from '../types';
import { CustomError } from '../model/custom-error';
import { CosmosDiscountCodeRepository } from '../repository/cosmos-discountCode-repository';


const getRepo = async () => await CosmosDiscountCodeRepository.getInstance();

const authorizeSalesman = (role: Role) => {
  if (role !== "salesman") {
    throw CustomError.unauthorized("You must be a salesman to access discount codes.");
  }
};

const getDiscountCodes = async (email: string, role: Role): Promise<DiscountCode[]> => {
  authorizeSalesman(role);
  return (await getRepo()).getAllDiscountCodes();
};

const getDiscountCodeByCode = async (
  code: string,
  email: string,
  role: Role
): Promise<DiscountCode> => {
  authorizeSalesman(role);

  const repo = await getRepo();
  const exists = await repo.discountCodeExists(code);

  if (!exists) {
    throw CustomError.notFound(`Discount code with code '${code}' does not exist.`);
  }

  return repo.getDiscountCodeByCode(code);
};

const createDiscountCode = async (
  input: DiscountCodeInput,
  email: string,
  role: Role
): Promise<DiscountCode> => {
  authorizeSalesman(role);

  const repo = await getRepo();
  const exists = await repo.discountCodeExists(input.code);

  if (exists) {
    throw CustomError.conflict("A discount code with this code already exists.");
  }

  const discountCode = new DiscountCode(input);

  return repo.createDiscountCode(discountCode);
};

const updateDiscountCode = async (
  currentCode: string,
  input: DiscountCodeInput,
  email: string,
  role: Role
): Promise<DiscountCode> => {
  authorizeSalesman(role);

  const repo = await getRepo();
  const existing = await repo.getDiscountCodeByCode(currentCode);

  if (!existing) {
    throw CustomError.notFound("This discount code does not exist.");
  }

  existing.updateCode(input); // assumes method exists on DiscountCode
  return repo.createDiscountCode(existing); // CosmosDB upserts
};

const deleteDiscountCode = async (
  code: string,
  email: string,
  role: Role
): Promise<string> => {
  authorizeSalesman(role);

  const repo = await getRepo();
  const exists = await repo.discountCodeExists(code);

  if (!exists) {
    throw CustomError.notFound("This discount code does not exist.");
  }

  const success = await repo.deleteDiscountCode(code);
  if (!success) {
    throw CustomError.internal("Failed to delete discount code.");
  }

  return `Discount code '${code}' deleted successfully.`;
};

export default {
  getDiscountCodes,
  getDiscountCodeByCode,
  createDiscountCode,
  updateDiscountCode,
  deleteDiscountCode,
};
