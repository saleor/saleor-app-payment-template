import { PageConfig } from "next";
import { badRequest, methodNotAllowed, ok } from "../../lib/api-response";
import { parseJsonRequest } from "../../lib/api-route-utils";
import { JSONValue } from "../../types";

export const config: PageConfig = {
  runtime: "experimental-edge",
};

const testHandler = async (req: Request) => {
  if (req.method !== "POST") {
    return methodNotAllowed([`POST`]);
  }
  const [err, _body] = await parseJsonRequest(req);
  if (err) {
    return badRequest(`Invalid request body`);
  }

  const result = await fetch("https://demo.saleor.io/graphql/", {
    body: JSON.stringify({
      query: `
    {
      products(first: 5, channel: \"default-channel\") {
        edges {
          node {
            id
            name
            description
          }
        }
      }
    }
      `.trim(),
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  const products = (await result.json()) as JSONValue;

  return ok(products);
};

export default testHandler;
