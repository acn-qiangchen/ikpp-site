import { describe, expect, it } from "vitest";
import { moveItem } from "./utils";

describe("moveItem", () => {
  it("moves item up", () => {
    expect(moveItem(["a", "b", "c"], 1, "up")).toEqual(["b", "a", "c"]);
  });

  it("moves item down", () => {
    expect(moveItem(["a", "b", "c"], 0, "down")).toEqual(["b", "a", "c"]);
  });

  it("no-op when moving up at index 0", () => {
    const arr = ["a", "b", "c"];
    expect(moveItem(arr, 0, "up")).toBe(arr);
  });

  it("no-op when moving down at last index", () => {
    const arr = ["a", "b", "c"];
    expect(moveItem(arr, 2, "down")).toBe(arr);
  });
});
