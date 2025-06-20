"use strict";
// import { HttpRequest, HttpResponseInit, InvocationContext, app } from "@azure/functions";
Object.defineProperty(exports, "__esModule", { value: true });
// export function corsMiddleware(handler: (request: HttpRequest, context: InvocationContext) => Promise<HttpResponseInit>) {
//   return async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
//     // Handle OPTIONS requests directly
//     if (request.method === "OPTIONS") {
//       return {
//         status: 200,
//         headers: {
//           "Access-Control-Allow-Origin": "*",
//           "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
//           "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Requested-With",
//           "Access-Control-Max-Age": "86400"
//         }
//       };
//     }
//     // Execute the original handler
//     const response = await handler(request, context);
//     // Add CORS headers to all responses
//     return {
//       ...response,
//       headers: {
//         ...response?.headers,
//         "Access-Control-Allow-Origin": "*",
//         "Access-Control-Allow-Credentials": "true"
//       }
//     };
//   };
// }
// // Register middleware globally
// app.use(corsMiddleware);
//# sourceMappingURL=cors.middleware.js.map