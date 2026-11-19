# MehraIT — Bihar Client Prototype Guide

## What this prototype demonstrates

MehraIT is a hyperlocal commerce storefront with a customer shopping journey, store operations desk and delivery-partner workflow. The demo is localised for Bihar, with sample service areas in Patna, Muzaffarpur and Gaya.

## Bihar demo coverage

- Patna: Patna GPO (800001), Kankarbagh (800020), Patliputra (800013) and Patna City (800008).
- Muzaffarpur: Muzaffarpur H.O. (842001).
- Gaya: Gaya H.O. (823001).

These are sample service pins for prototype review, not confirmation of the client's actual operational coverage. The client must confirm the launch city, delivery zones, fees and ETA before production.

## Customer journey

1. Open the storefront at `/`.
2. Choose a Bihar delivery location using the location selector, or check a supported PIN code.
3. Browse the regular catalogue and the Bihar Favourites category.
4. Explore regional demo products such as Chana Sattu, Litti Atta, Mithila Makhana, Bihari Thekua, Chura and seasonal Muzaffarpur Litchi.
5. Search products, open details and add available variants to the cart.
6. Continue to checkout, select or add a delivery address, and review the order total.
7. Place a cash-on-delivery order. Online payment is available only when valid payment credentials and verification are configured.
8. Open the order detail page to review its progress.
9. Use Account to manage profile, addresses, orders, notifications and support requests.

## Operations journey

- `/admin` — authenticated store desk. Available sections are filtered by the signed-in staff member's role.
- `/rider` — authenticated delivery-partner workspace for availability, assigned drops, pickup, delivery progress and delivery confirmation.
- `/account` — customer account and staff navigation.

The first account bootstrapped by the application is granted the initial Super Admin role when no Super Admin exists. Use the intended owner account for the first setup; do not use a customer account for this step.

## Important demo conditions

- The browser preview is protected by a shared access credential. Share that credential separately from the public-facing product URL.
- Authentication must be enabled and configured in the deployment environment.
- The database migrations and Bihar demo catalogue must be applied before review.
- Location availability is determined by the configured PIN codes; the map pins are sample geographic reference points.
- Store names, stock, prices, coupons, delivery charges and the 30–45 minute estimate are illustrative demo data.
- The demo intentionally leaves GSTIN and support contact fields blank until the client supplies verified business details.
- Online payments require valid Razorpay credentials and a working webhook/verification configuration. Do not present online payment as live if these are not configured.
- SMS one-time passwords are not implemented in this prototype; account access uses the configured sign-in methods.
- Maps/navigation links and browser geolocation depend on device permissions and the selected provider.
- Delivery partner assignment is an operations workflow; do not promise automatic dispatch or continuous live tracking unless separately configured and verified.

## Before production launch

- [ ] Confirm the client's actual Bihar launch city and delivery PIN codes.
- [ ] Replace the sample stores, addresses, service radii and map coordinates with verified operating locations.
- [ ] Replace sample products, brands, prices, stock, coupons and delivery estimates with approved business data.
- [ ] Add verified business phone, support email and GSTIN details.
- [ ] Test desktop and mobile rendering.
- [ ] Test a full customer order and confirm it appears in the store desk.
- [ ] Test staff role restrictions and rider status transitions.
- [ ] Verify payment mode, notifications and delivery operations.
- [ ] Complete a security review and remove any real customer data from the demonstration environment.

## Scope statement

This is a functional prototype with Bihar-focused sample data. Production launch additionally requires the client's confirmed operating city and service zones, real catalogue and inventory, payment and notification credentials, operational policies, monitoring, security review and end-to-end acceptance testing.
