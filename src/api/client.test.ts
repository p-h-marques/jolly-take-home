import { buildQueryString } from "@/api/client";

describe("buildQueryString", () => {
  it("returns an empty string when no params are given", () => {
    expect(buildQueryString()).toBe("");
  });

  it("builds a query string from the given params", () => {
    expect(buildQueryString({ page: 1, q: "bear" })).toBe("?page=1&q=bear");
  });

  it("skips params with an undefined value", () => {
    expect(buildQueryString({ page: 1, q: undefined })).toBe("?page=1");
  });
});
