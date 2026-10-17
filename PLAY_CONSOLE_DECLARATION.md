# Spendly — Play Console submission worksheet

Use this text only for the release represented by this repository. It documents the implementation as of October 17, 2026.

## Restricted SMS permission declaration

**Permission requested:** `READ_SMS`

**Select use case:** SMS-based money management.

**Core functionality description:**

> Spendly is a personal budget-management app. With the user's explicit opt-in, it reads bank transaction SMS stored on the device, detects debit and credit messages locally, and creates a suggested income or expense in a private Review inbox. The user must approve or discard every suggestion before it becomes a transaction. This feature helps users track and manage their budget; it is not used for authentication, messaging, advertising, profiling, or any purpose outside money management.

**Why the permission is necessary:**

> Bank transaction messages are delivered to the device SMS inbox. `READ_SMS` is required to access those existing messages and derive a transaction suggestion. The app does not send SMS and does not request any other SMS or Call Log permissions.

**User control and disclosure:**

> Before the Android permission prompt, Spendly presents a prominent disclosure explaining that it will read bank transaction SMS to create reviewable budget entries; that processing stays on-device and is not shared; and that manual entry, CSV import, and pasted messages work without permission. The feature is off by default. Users may decline, disable the feature in Spendly, or revoke permission in Android Settings at any time.

**Data handling:**

> SMS content is processed and stored only on the user's device. Spendly has no account, server, analytics, advertising, or cloud-sync service. SMS content is never transmitted, sold, or shared.

## Data safety form

For this build, select **No** for whether the app collects or shares user data. Transaction data, SMS content, notification content, and CSV files are processed only on the user's device and never leave it. Still provide the public Privacy Policy URL below in Play Console.

## App content notes

- Ads: **No** (if no advertising SDK is added before release).
- App access: **All functionality available without an account**.
- Target audience: choose the actual audience; do not target children unless the app is redesigned for the Families policy.
- Financial features: describe Spendly as personal budgeting/expense tracking only. It does not provide banking, payments, lending, investment advice, or financial transactions.

## Privacy policy URL

Deploy `public/privacy.html` to the same public HTTPS site as the app and submit its direct URL, for example `https://YOUR-DOMAIN/privacy.html`. Before submitting, confirm that the support email on the Play listing is monitored; the policy refers users to it.
