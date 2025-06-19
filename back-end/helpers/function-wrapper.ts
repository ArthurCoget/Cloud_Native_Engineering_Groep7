import { HttpRequest, InvocationContext } from "@azure/functions";
import { Role } from "../types";
// Define your Role type

// Updated wrapper signature
export async function authenticatedRouteWrapper(
  handler: (authEmail: string, role: Role) => Promise<HttpResponseInit>,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    // Extract token from headers
    const token = context.req.headers.get("Authorization")?.split(" ")[1];

    if (!token) {
      return { status: 401, body: "Unauthorized: Missing token" };
    }

    // Verify token - implement your own logic
    const claims = verifyToken(token);
    if (!claims) {
      return { status: 401, body: "Unauthorized: Invalid token" };
    }

    // Call handler with extracted claims
    return await handler(claims.email, claims.role as Role);
  } catch (error) {
    context.error(`Authentication error: ${error.message}`);
    return {
      status: 401,
      body: "Unauthorized: Invalid credentials",
    };
  }
}

// Mock token verification - implement properly
function verifyToken(token: string): { email: string; role: Role } | null {
  // Your actual JWT verification logic
  return { email: "user@example.com", role: "customer" };
}
