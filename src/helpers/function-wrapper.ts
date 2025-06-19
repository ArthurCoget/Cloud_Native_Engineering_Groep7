import {
  HttpResponseInit,
  InvocationContext,
  HttpRequest, // Add this import
} from "@azure/functions";
import jwt from "jsonwebtoken"; // Import JWT library
import { Role } from "../types"; // Adjust the import path as necessary
// Implement token verification
function verifyToken(token: string): { email: string; role: Role } {
  try {
    // Replace with your actual secret
    const secret = process.env.JWT_SECRET || "your-secret-key";
    const decoded = jwt.verify(token, secret) as { email: string; role: Role };
    return decoded;
  } catch (error) {
    throw new Error("Invalid token");
  }
}

export async function authenticatedRouteWrapper(
  handler: (authEmail: string, role: Role) => Promise<HttpResponseInit>,
  req: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    if (!req) {
      return { status: 401, body: "Missing request object" };
    }

    // Get token from headers
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.split(" ")[1];

    if (!token) {
      return { status: 401, body: "Unauthorized: Missing token" };
    }

    // Verify token
    const { email: authEmail, role } = verifyToken(token);

    // Call handler with authenticated user
    return await handler(authEmail, role);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    context.error(`Authentication error: ${errorMessage}`);
    return {
      status: 401,
      body: "Unauthorized: " + errorMessage,
    };
  }
}
