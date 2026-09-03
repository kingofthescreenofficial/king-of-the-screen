// @vitest-environment jsdom

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TakeoverModal } from "@/components/TakeoverModal";

describe("TakeoverModal while payments are paused", () => {
  it("shows the pause notice and exposes no payment or wallet action", () => {
    render(React.createElement(TakeoverModal, {
      isOpen: true,
      nextMinPriceUsd: 2,
      onClose: vi.fn(),
      onSuccess: vi.fn(),
      paymentsEnabled: false,
      walletConfig: { evmAddress: "", solanaAddress: "", usdtTrc20Address: "" },
    }));

    expect(screen.getByRole("dialog")).toHaveTextContent("PAID TAKEOVERS ARE PAUSED");
    expect(screen.queryByRole("button", { name: /pay|connect wallet|claim throne/i })).not.toBeInTheDocument();
  });
});
