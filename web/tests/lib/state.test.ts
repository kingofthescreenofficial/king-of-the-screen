import { describe, expect, it } from "vitest";

import { calculateNextPrice } from "@/lib/pricing";

describe("calculateNextPrice", () => {
  it.each([
    [2, 3],
    [9, 10],
    [10, 15],
    [95, 100],
    [100, 110.14],
  ])("moves the minimum from $%d to $%d", (current, expected) => {
    expect(calculateNextPrice(current)).toBe(expected);
  });
});
