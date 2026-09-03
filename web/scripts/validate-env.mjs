const required = ["KOTS_DATABASE_PATH", "KOTS_PUBLIC_ORIGIN"];
const failures = required.filter((key) => !process.env[key]);
if (process.env.PAID_TAKEOVER_ENABLED === "true") {
  for (const key of ["KOTS_ADMIN_PASSWORD_HASH", "KOTS_SESSION_SECRET", "SOLANA_RPC_URL", "SOLANA_HOT_WALLET_ADDRESS"]) {
    if (!process.env[key]) failures.push(key);
  }
}
if (process.env.PAID_TAKEOVER_ENABLED && process.env.PAID_TAKEOVER_ENABLED !== "false" && process.env.PAID_TAKEOVER_ENABLED !== "true") failures.push("PAID_TAKEOVER_ENABLED");
if (failures.length) throw new Error(`Invalid environment: ${failures.join(", ")}`);
console.log(`Environment valid. Payments: ${process.env.PAID_TAKEOVER_ENABLED === "true" ? "enabled" : "disabled"}.`);
