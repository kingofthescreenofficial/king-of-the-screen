export function isPaidTakeoverEnabled(): boolean {
  return process.env.PAID_TAKEOVER_ENABLED === "true";
}

export function getPublicCapabilities() {
  return {
    paidTakeoverEnabled: isPaidTakeoverEnabled(),
  };
}
