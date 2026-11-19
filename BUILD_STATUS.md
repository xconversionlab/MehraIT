# MehraIT — Build Status

Last updated: 2026-11-19  
Default branch: `main`

## Existing implementation

- React 19 + TypeScript + TanStack Start/Router + Vite + Tailwind CSS 4.
- MehraIT brand assets and Outfit font files.
- Customer storefront, category, product, search, cart and checkout routes.
- Account, address, order, notification and support workflows.
- Store desk with overview, product, category, inventory, order, customer, marketing, store, delivery and settings sections.
- Delivery-partner route with availability, assigned jobs, location sharing and delivery status actions.
- Server functions for catalogue, account, administration and rider operations.
- PostgreSQL migrations for authentication and commerce schema.
- Razorpay integration structure and environment-based configuration.

## Bihar prototype localisation

- Sample store coverage: Patna, Muzaffarpur and Gaya.
- PIN-based sample delivery areas: 800001, 800020, 800013, 800008, 842001 and 823001.
- Bihar Favourites category with Sattu & Litti Essentials, Mithila Makhana and Bihari Sweets.
- Regional sample products include Chana Sattu, Litti Atta, Mithila Makhana, Roasted Masala Makhana, Bihari Thekua, Chura and seasonal Muzaffarpur Litchi.
- Sample contact and GSTIN fields are blank pending verified client details.

## Verification status

The source has been prepared for a fresh Vercel build. The repository's generated `.vercel/output` artifacts have been removed from Git so deployments build from the current source. A local development server, typecheck, automated test suite and full browser-based customer/admin/rider acceptance test have not been run in this audit.

## Remaining production checks

1. Confirm the client's actual Bihar launch city and delivery PIN codes.
2. Replace all sample stores, service areas, products, stock, fees, prices and ETA data.
3. Run `npm run typecheck`, `npm run build` and `npm run test` in the project environment.
4. Verify desktop and mobile behaviour in a real browser.
5. Complete a customer order and confirm it appears in the admin desk.
6. Verify staff role restrictions and rider workflow.
7. Verify Razorpay sandbox/live mode before enabling online payments.
8. Publish the deployed demo URL and share access credentials through a separate secure channel.

See [CLIENT_DEMO.md](./CLIENT_DEMO.md) for the walkthrough and handoff checklist.
