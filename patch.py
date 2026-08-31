import sys

with open('web/lib/state.ts', 'r') as f:
    content = f.read()

old_block = """  // Validate bid amount
  if (newKingData.paidAmountUsd < state.nextMinPriceUsd) {
    return {
      success: false,
      state,
      error: `Bid too low! Minimum required: $${state.nextMinPriceUsd}. You sent: $${newKingData.paidAmountUsd}`,
    };
  }"""

new_block = """  // Validate bid amount with grace window for race conditions
  if (newKingData.paidAmountUsd < state.nextMinPriceUsd) {
    if (newKingData.paidAmountUsd < state.currentKing.paidAmountUsd) {
      return {
        success: false,
        state,
        error: `Bid too low! Minimum required: $${state.nextMinPriceUsd}. You sent: $${newKingData.paidAmountUsd}`,
      };
    }
    console.log("Race condition averted, accepting tied bid.");
  }"""

content = content.replace(old_block, new_block)

with open('web/lib/state.ts', 'w') as f:
    f.write(content)

print("Patched successfully")
