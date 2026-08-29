# WCPOS customer-display concept mockups

These dependency-free pages make the follow-up experience around
[wcpos/monorepo#1125](https://github.com/wcpos/monorepo/pull/1125) concrete. They are design
explorations, not application code. PR #1125 provides the transport-neutral V1 snapshot seam; it
does **not** implement a display UI, transport, pairing, settings, signature capture, receipt, or
completed-payment / thank-you behavior.

## Preview locally

From the repository root:

```sh
python3 -m http.server 4173 --directory docs/customer-display-mockups
```

Then open <http://127.0.0.1:4173/>. The pages also work directly through `file://` URLs because
all links, styles, and scripts are local and relative.

Customer display states are selected with a query parameter:

- `display.html?state=cart`
- `display.html?state=awaiting-payment`
- `display.html?state=idle`

Controls on the settings page only update the local mockup and display a concept notice. Nothing
is saved or transmitted.

## V1 contract mapping

The customer screen deliberately uses only the safe V1 projection:

| Mockup content | V1 source |
| --- | --- |
| Cart / awaiting-payment / idle presentation | `status` |
| Currency formatting | `currency.code`, `currency.symbol`, `currency.decimalPlaces`, `currency.pricesIncludeTax` |
| Product name, quantity, unit price, line money, image | `items[]` |
| Service fee and local delivery | `fees[]`, `shipping[]` |
| Subtotal, discount, fees, shipping, tax, total | `totals` |

The cart fixture uses synthetic product names and amounts. It includes a discount, fee, shipping,
tax, and total to exercise the safe aggregate fields. A zero or absent adjustment should be omitted
by a production renderer. The checkout mockup labels the authoritative V1 checkout total as
“Amount due” without inventing a payment method or transaction result. The idle state removes all
item and total content.

The display does not include customer or order identifiers, contact or address data, notes, SKUs,
coupon details, metadata, payment links, transaction data, credentials, or product costs.

## Concept-only areas

The following elements come from the roadmap or illustrate plausible follow-up UX; none are in PR
#1125:

- enabling and pairing a display;
- choosing a transport or managing a connection session;
- saved layout, image, theme, branding, and idle-message settings;
- signature capture;
- a completed-payment or thank-you state.

The pairing screen intentionally says that transport architecture is unresolved. Its domain and
connection code are inert examples.

## Reproduce screenshots

Chromium can render the checked-in PNGs without a server. From the repository root:

```sh
MOCKUP_DIR="$PWD/docs/customer-display-mockups"

chromium --headless --disable-gpu --no-sandbox --hide-scrollbars \
  --window-size=1440,1100 --screenshot="$MOCKUP_DIR/screenshots/settings.png" \
  "file://$MOCKUP_DIR/settings.html"

chromium --headless --disable-gpu --no-sandbox --hide-scrollbars \
  --window-size=1440,1000 --screenshot="$MOCKUP_DIR/screenshots/pair-display.png" \
  "file://$MOCKUP_DIR/pair-display.html"

chromium --headless --disable-gpu --no-sandbox --hide-scrollbars \
  --window-size=1440,900 --virtual-time-budget=1000 \
  --screenshot="$MOCKUP_DIR/screenshots/display-cart.png" \
  "file://$MOCKUP_DIR/display.html?state=cart&capture=1"

chromium --headless --disable-gpu --no-sandbox --hide-scrollbars \
  --window-size=1440,900 --virtual-time-budget=1000 \
  --screenshot="$MOCKUP_DIR/screenshots/display-awaiting-payment.png" \
  "file://$MOCKUP_DIR/display.html?state=awaiting-payment&capture=1"

chromium --headless --disable-gpu --no-sandbox --hide-scrollbars \
  --window-size=1440,900 --virtual-time-budget=1000 \
  --screenshot="$MOCKUP_DIR/screenshots/display-idle.png" \
  "file://$MOCKUP_DIR/display.html?state=idle&capture=1"
```

## Suggested validation

From the outer contribution workspace, keep the prior interaction prototype green:

```sh
node --test prototype/customer-display/*.test.js
```

From this repository root, verify patch formatting:

```sh
git add -f docs/customer-display-mockups
git diff --cached --check
```

A simple local-link audit can be run with Node:

```sh
node - <<'NODE'
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve('docs/customer-display-mockups');
const html = fs.readdirSync(root).filter((file) => file.endsWith('.html'));
let missing = 0;
for (const file of html) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  for (const match of source.matchAll(/(?:href|src)="([^"?#]+)[^\"]*"/g)) {
    const target = match[1];
    if (/^(?:https?:|#)/.test(target)) continue;
    if (!fs.existsSync(path.resolve(root, target))) {
      console.error(`${file}: missing ${target}`);
      missing += 1;
    }
  }
}
if (missing) process.exit(1);
console.log(`Checked ${html.length} HTML files; all local assets exist.`);
NODE
```

Before publication, compare `gh pr view 1125 --repo wcpos/monorepo --json headRefOid,files`
before and after. Publishing these assets from a separate branch must not change that PR head or its
file diff.
