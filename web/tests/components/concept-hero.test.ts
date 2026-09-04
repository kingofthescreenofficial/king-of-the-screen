// @vitest-environment jsdom

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ConceptHero } from "@/components/ConceptHero";

describe("ConceptHero", () => {
  it("keeps the takeover flow unavailable during pre-launch", () => {
    const onOpenTakeover = vi.fn();

    render(React.createElement(ConceptHero, { nextMinPriceUsd: 2, onOpenTakeover }));

    const action = screen.getByRole("button", { name: /takeovers paused/i });
    expect(action).toBeDisabled();

    fireEvent.click(action);
    expect(onOpenTakeover).not.toHaveBeenCalled();
  });
});
