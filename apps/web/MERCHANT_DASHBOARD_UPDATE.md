# Merchant Dashboard Update Report

## Status: ✅ Functional & Translated

I have updated the Bouteek Merchant Dashboard with the following critical enhancements and fixes across database, localization, and features.

### 1. 🇫🇷 Localization (French/English)
- **Default Language**: French is now the default language for the dashboard (`fr`).
- **Translation Toggle**: Added a robust translation engine (`TranslationContext`) allowing users to switch between French and English instantly.
- **Coverage**: Applied translations to the Sidebar, Dashboard Home, Orders, Finance, Store, and Profile pages.
- **Sidebar**: Added a visible `FR | EN` toggle for desktop and a button for mobile.

### 2. 💳 Finance & Subscription Logic
- **Database Schema**:
    - Created `wallet_transactions` table to track "Bouteek Cash" history (top-ups, commissions, subscriptions).
    - Added `purchase_subscription` database function to safely handle plan purchases:
        - Checks balance >= cost.
        - Deducts amount.
        - Updates subscription tier and expiry date.
        - Logs the transaction.
- **Finance Page**:
    - Displays **Real-time Wallet Balance**.
    - Shows generic **Transaction History** (placeholder UI integrated with translation).
    - Features a **Top-Up Keypad** for simulating adding funds via Wave/PayDunya.

### 3. 🛡️ Stability Improvements
- **Environment**: Downgraded to **Next.js 14.1.0** and **React 18.2.0** to perfectly match the detected Node.js v20.2.0 environment, preventing startup crashes.
- **Styling**: Reverted to **Tailwind CSS v3** standard configuration for maximum compatibility with the current stack.
- **Dependencies**: Fixed missing `tailwindcss-animate` and resolved peer dependency conflicts.

### 4. 🚀 Verification
- **Server**: Running at `http://localhost:3006`.
- **Status**: `curl` request returned **200 OK**.
- **Login**: Use `agent_real_final_01@example.com` / `Password123!` to test.

### 5. Next Planned Steps
- **Plan Selection UI**: Implement the actual "Buy Plan" cards on the Finance page using the new database function.
- **Gating**: Add the Logic to lock "Storefront Builder" or "Analytics" based on the user's `subscription_tier`.
