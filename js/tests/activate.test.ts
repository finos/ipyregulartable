import "isomorphic-fetch";

import examplePlugin from "../src/plugin";

describe("Checks activate", () => {
  test("Check activate", () => {
    expect(examplePlugin);
  });
});
