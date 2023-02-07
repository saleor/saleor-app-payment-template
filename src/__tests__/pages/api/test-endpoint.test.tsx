import { describe, expect, it } from "vitest";
import { HttpStatus } from "../../../lib/api-response";

import testHandler from "../../../pages/api/test-endpoint";
import { createRequestMock } from "../../apiTestsUtils";

describe("test endpoint", () => {
  it("should return bad request for GET requests", async () => {
    const req = createRequestMock("GET");
    const res = await testHandler(req);
    expect(res.status).toEqual(HttpStatus.MethodNotAllowed);
  });

  it("should return products for POST request", async () => {
    const req = createRequestMock("POST", {});
    const res = await testHandler(req);
    expect(res.status).toEqual(HttpStatus.OK);
    const products = await res.json();
    expect(products.data.products).toBeTruthy();
  });
});
