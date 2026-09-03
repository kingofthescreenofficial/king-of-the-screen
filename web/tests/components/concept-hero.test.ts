// @vitest-environment jsdom

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ConceptHero } from "@/components/ConceptHero";

describe("ConceptHero", () => {
  it("shows the server-provided minimum and opens the takeover flow", () => {
    const onOpenTakeover = vi.fn();

    render(React.createElement(ConceptHero, { nextMinPriceUsd: 2, onOpenTakeover }));

    const action = screen.getByRole("button", { name: /claim throne/i });
    expect(action).toHaveTextContent("$2.00");

    fireEvent.click(action);
    expect(onOpenTakeover).toHaveBeenCalledTimes(1);
  });
});
