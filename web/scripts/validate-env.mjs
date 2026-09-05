const required = ["KOTS_DATABASE_PATH", "KOTS_PUBLIC_ORIGIN"];
const failures = required.filter((key) => !process.env[key]);
if (process.env.PAID_TAKEOVER_ENABLED === "true") {
  for (const key of ["KOTS_ADMIN_PASSWORD_HASH", "KOTS_SESSION_SECRET", "SOLANA_RPC_URL", "SOLANA_OPERATIONS_VAULT_ADDRESS"]) {
    if (!process.env[key]) failures.push(key);
  }
}
if (process.env.PAID_TAKEOVER_ENABLED && process.env.PAID_TAKEOVER_ENABLED !== "false" && process.env.PAID_TAKEOVER_ENABLED !== "true") failures.push("PAID_TAKEOVER_ENABLED");
for (const key of ["PUBLIC_CROWN_ARCHIVE_ENABLED", "CONTENT_SUBMISSIONS_ENABLED"]) {
  if (process.env[key] && process.env[key] !== "false" && process.env[key] !== "true") failures.push(key);
}
if (process.env.CONTENT_SUBMISSIONS_ENABLED === "true" && process.env.PAID_TAKEOVER_ENABLED !== "true") failures.push("CONTENT_SUBMISSIONS_ENABLED_REQUIRES_PAYMENTS");
if (failures.length) throw new Error(`Invalid environment: ${failures.join(", ")}`);
console.log(`Environment valid. Payments: ${process.env.PAID_TAKEOVER_ENABLED === "true" ? "enabled" : "disabled"}.`);
