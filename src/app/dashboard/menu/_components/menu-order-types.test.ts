import { reorderById } from "./menu-order-types";

describe("reorderById", () => {
  const items = [
    { id: "a", name: "A" },
    { id: "b", name: "B" },
    { id: "c", name: "C" },
  ];

  it("moves an item before the target", () => {
    expect(reorderById(items, "c", "a").map((item) => item.id)).toEqual([
      "c",
      "a",
      "b",
    ]);
  });

  it("returns a copy when ids match", () => {
    const result = reorderById(items, "b", "b");
    expect(result).not.toBe(items);
    expect(result.map((item) => item.id)).toEqual(["a", "b", "c"]);
  });
});
