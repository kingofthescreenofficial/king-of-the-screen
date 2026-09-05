# U.S. Crypto Launch Risk Research

**Status:** Internal research as of 5 September 2026. This is not a legal opinion, legal advice, or authorization to launch.

## 1. Issue & Scope

Question: under U.S. federal law, what are the leading securities, money-transmission, sanctions, and consumer-protection risks for a public Solana site that charges users in SOL for a time-limited screen placement and a commemorative NFT?

This review covers the first-season product only. It assumes direct payment from a user wallet to a disclosed operator wallet, no custody of user private keys, no KOTS claim, no KOTS distribution, no token buyback, no liquidity program, and no payment flow enabled today. It does not analyze state law, non-U.S. law, tax, gaming, contest, privacy, or intellectual-property law in depth.

## 2. Executive Summary

The current pre-launch configuration has the lowest operational exposure. Public takeovers, wallet connection, content submissions, NFT minting, KOTS claims, and token-market activity are disabled in code. This configuration does not authorize a financial launch.

A first-season screen-placement product has a stronger non-security position when the buyer pays for a defined display service and a personal commemorative record. That position depends on the full economic reality. It fails if the site or its marketing links payment to token appreciation, resale profit, a managed liquidity program, buybacks, revenue participation, or management efforts expected to increase value.

The former KOTS direction creates a high-risk fact pattern. A throne purchaser would receive KOTS while the operator used a portion of throne payments for market activity. Removing words such as “guarantee” or “profit” does not remove the underlying economic signal. KOTS must remain disabled and separate from Season One until U.S. counsel reviews the token, distribution, marketing, wallets, and all on-chain mechanics.

## 3. Legal Framework

| Theme | Legal standard | Fact alignment | Working result |
| --- | --- | --- | --- |
| Securities | *Howey* analyzes an investment of money in a common enterprise with an expectation of profits from the efforts of others. | SOL payment, KOTS rewards, buybacks, and promotion of future price link buyer value to operator action. | High risk for the retired token-reward model. Keep it disabled. |
| Digital goods and NFTs | SEC guidance distinguishes a crypto asset used or consumed for a product or service from an investment contract, while retaining the fact-specific *Howey* analysis. | A defined screen display and personal record support consumptive use only when no financial return is promoted. | Lower risk, not a safe harbor. |
| Money transmission | FinCEN treats a business that accepts and transmits convertible virtual currency, or buys or sells it, as a money transmitter unless an exemption applies. | Direct payment for an operator's own stated service is distinct from holding, relaying, exchanging, refunding, or distributing value for others. | Keep the product non-custodial. Obtain state and federal analysis before paid launch. |
| Sanctions | OFAC applies sanctions rules to digital-currency transactions and calls for risk-based controls. | A public global site accepts on-chain payment from unknown wallets. | Paid flow needs sanctions design, screening, records, escalation, and geography controls. |
| Consumer protection | FTC Act Section 5 prohibits deceptive acts and practices. | Claims about scarcity, product delivery, refunds, safety, liquidity, or future value must match the actual system. | No profit, safety, liquidity, or “million” outcome claims. Publish exact purchase terms before payment. |

### Securities

The binding federal test is *SEC v. W.J. Howey Co.*, 328 U.S. 293 (1946). The SEC and CFTC's current crypto interpretation took effect on 23 March 2026. It states that *Howey* remains binding and focuses on the economic reality of a transaction.

The retired model raises the central concern. A buyer would pay SOL, receive KOTS, and see the operator direct 20% of later payments toward KOTS market activity. A public statement that this activity is intended to create a market, improve price, support price, or give throne buyers an additional way to gain money strengthens the expectation-of-profit and managerial-efforts facts.

For Season One, the product description must remain narrow: the buyer purchases a defined display period and, if separately launched, a non-financial commemorative NFT record. It must not include KOTS, rights to revenue, rights to a treasury, market-support statements, token resale promotion, price discussion, or a managed return.

### Money Transmission and Custody

FinCEN's 2013 guidance states that a user who obtains virtual currency to purchase goods or services is not an MSB solely from that use. It also states that an administrator or exchanger engaged in accepting and transmitting convertible virtual currency, or buying or selling it, is a money transmitter unless a limitation or exemption applies.

The first-season system should never receive assets into a platform account for later forwarding, trade assets for users, maintain user balances, operate user withdrawal accounts, or take custody of private keys. A direct wallet-to-operator payment alone does not settle every classification issue. State money-transmitter rules and actual transaction flow require a separate counsel review before activation.

### Sanctions

OFAC states that sanctions obligations apply to digital currency and identifies tailored, risk-based compliance programs, sanctions-list screening, and appropriate controls as relevant measures. The presence of a U.S. person, U.S. infrastructure, or other U.S. nexus can trigger these obligations.

Before any paid flow, the operator needs a written sanctions policy, a decision tree for blocked or rejected transactions, documented wallet and address screening, a geographic-access decision, record retention, and an escalation contact. A “global” landing page does not replace these controls.

### Consumer Protection

The FTC's Celsius matter shows the enforcement risk from claims about safety, reserves, withdrawals, and promised returns. The relevant lesson for this project is simple: every material public statement must be accurate when published and continue to match the system in production.

Before charging a buyer, the site needs to state the exact product, payment amount or quote method, quote expiry, when the display starts, what ends the display, moderation and takedown rules, NFT delivery conditions, refund policy, support contact, and dispute path. “100” scarcity must be accurate, technically enforced, and explained without any suggestion of financial value.

## 4. Counterarguments / Alternative Views

The strongest position for the first season is that a buyer purchases a digital display service and a personal record for use, status, or collection. Direct self-custodial payment, no platform balance, no token reward, and no market activity support that position.

Those facts do not decide the outcome. Regulators and courts examine execution, copy, social posts, creator conduct, side promises, and transaction design. A hidden plan to drive KOTS demand would undermine the stated consumptive purpose. A later token phase cannot be treated as a harmless add-on.

## 5. Gaps / Open Questions

The following facts are missing and prevent a launch determination:

1. Operator identity, jurisdiction, address for legal notices, and applicable law.
2. Countries served and countries blocked.
3. Final purchase, refund, content-removal, privacy, DMCA, and dispute rules.
4. Payment architecture, settlement path, wallet screening provider, and sanctions process.
5. NFT contract, metadata permanence, royalty settings, supply cap enforcement, and delivery failure process.
6. Any state-by-state analysis required by the chosen operator and customer geography.
7. A licensed U.S. lawyer's written review of the final product, terms, site copy, and launch transaction flow.

## 6. Practical Implications & Strategy

1. Keep every financial capability disabled. Current code must retain `PAID_TAKEOVER_ENABLED=false`, `CONTENT_SUBMISSIONS_ENABLED=false`, and `PUBLIC_CROWN_ARCHIVE_ENABLED=false`.
2. Do not create, distribute, market, buy back, or promote KOTS. Do not use the former Pump.fun mint in product or marketing.
3. Do not use “earn,” “investment,” “upside,” “liquidity support,” “floor,” “price support,” “return,” “profit,” or equivalent claims in public text.
4. Separate any future token program from Season One. Treat it as a new legal, technical, and operational project.
5. Before paid launch, retain a U.S.-licensed lawyer for the actual operator and facts. The site must not state that it is legally approved until that review exists.

## 7. Sources & Verification

1. *SEC v. W.J. Howey Co.*, 328 U.S. 293 (1946). Binding U.S. Supreme Court precedent.
2. Securities and Exchange Commission & Commodity Futures Trading Commission, *Application of the Federal Securities Laws to Certain Types of Crypto Assets and Certain Transactions Involving Crypto Assets*, Release Nos. 33-11412, 34-105020 (effective Mar. 23, 2026). Official text: https://www.sec.gov/files/rules/interp/2026/33-11412.pdf
3. Financial Crimes Enforcement Network, *Application of FinCEN's Regulations to Persons Administering, Exchanging, or Using Virtual Currencies*, FIN-2013-G001 (Mar. 18, 2013). Official text: https://fincen.gov/sites/default/files/shared/FIN-2013-G001.pdf
4. Financial Crimes Enforcement Network, *Application of FinCEN's Regulations to Certain Business Models Involving Convertible Virtual Currencies* (May 9, 2019). Official text: https://www.fincen.gov/system/files/2019-05/FinCEN%20CVC%20Guidance%20FINAL.pdf
5. Office of Foreign Assets Control, *Sanctions Compliance Guidance for the Virtual Currency Industry* (Oct. 15, 2021). Official text: https://ofac.treasury.gov/system/files/126/virtual_currency_guidance_brochure.pdf
6. Federal Trade Commission, *FTC Reaches Settlement with Crypto Platform Celsius Network* (July 13, 2023). Official release: https://www.ftc.gov/news-events/news/press-releases/2023/07/ftc-reaches-settlement-crypto-platform-celsius-network-charges-former-executives-duping-consumers

All web sources above were checked on 5 September 2026. Court and jurisdiction-specific analysis remains for licensed counsel.
