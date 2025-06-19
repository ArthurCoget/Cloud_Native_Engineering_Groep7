import { UnauthorizedError } from "express-jwt";
import { Payment } from "../model/payment";
import { CosmosPaymentRepository } from "../repository/cosmos-payment-repository";
import { Role } from "../types";

export class PaymentService {
  private static instance: PaymentService;

  public static getInstance() {
    if (!this.instance) {
      this.instance = new PaymentService();
    }
    return this.instance;
  }

  private constructor() {}

  private getPaymentRepo = async () =>
    await CosmosPaymentRepository.getInstance();

  getPayments = async (email: string, role: Role): Promise<Payment[]> => {
    if (role === "salesman" || role === "admin") {
      const paymentDB = await this.getPaymentRepo();
      return await paymentDB.getPayments();
    } else {
      throw new UnauthorizedError("credentials_required", {
        message: "You must be a salesman or admin to access all payments.",
      });
    }
  };

  getPaymentById = async (
    id: number,
    email: string,
    role: Role
  ): Promise<Payment> => {
    if (role === "salesman" || role === "admin") {
      const paymentDB = await this.getPaymentRepo();
      const payment = await paymentDB.getPaymentById(id);

      if (!payment) {
        throw new Error(`Payment with id ${id} does not exist.`);
      }

      return payment;
    } else {
      throw new UnauthorizedError("credentials_required", {
        message: "You must be a salesman or admin to access a payment by id.",
      });
    }
  };
}
