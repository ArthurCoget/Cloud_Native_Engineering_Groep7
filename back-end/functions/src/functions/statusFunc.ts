import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

export async function statusFunc(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  return {
    status: 200,
    body: "back-end is up and running"
  };
}

app.http("statusFunc", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  handler: statusFunc
});
