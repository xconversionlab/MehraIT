# MehraIT — Client Prototype Guide

## What this prototype demonstrates

MehraIT is a hyperlocal quick-commerce storefront with a customer shopping journey, store operations desk and delivery-partner workflow.

## Customer journey

1. Open the storefront at `/`.
2. Choose a delivery location using the location selector.
3. Browse categories, featured products and bestsellers.
4. Search for products and open product details.
5. Add available variants to the cart and adjust quantities.
6. Continue to checkout, select or add a delivery address, and review the order total.
7. Place a cash-on-delivery order, or use online payment only when the payment gateway is configured.
8. Open the order detail page to review its progress.
9. Use Account to manage profile, addresses, orders, notifications and support requests.

## Operations journey

- `/admin` — authenticated store desk. Available sections are filtered by the signed-in staff member's role.
- `/rider` — authenticated delivery-partner workspace for availability, assigned drops, pickup, delivery progress and delivery confirmation.
- `/account` — customer account and staff navigation.

The first account bootstrapped by the application is granted the initial Super Admin role when no Super Admin exists. Use the intended owner account for the first setup; do not use a client/customer account for this step.

## Important demo conditions

- Authentication must be enabled and configured in the deployment environment.
- The database migrations must have been applied and the store must have valid catalogue, store, service-area and inventory records.
- Location availability is determined by configured service areas; demo locations should be selected from those configured areas.
- Online payments require valid Razorpay credentials and a working webhook/verification configuration. Do not present online payment as live if these are not configured.
- SMS OTP is not implemented in this prototype; account access uses the configured sign-in methods.
- Maps/navigation links and browser geolocation depend on device permissions and the selected provider.
- Delivery partner assignment is an operations workflow; do not promise automatic dispatch or continuous live tracking unless separately configured and verified.

## Before sharing with the client

- [ ] Confirm the deployed URL opens successfully on desktop and mobile.
- [ ] Confirm authentication works with the intended demo account.
- [ ] Confirm the database is migrated and the catalogue is populated.
- [ ] Confirm at least one store and its service areas are active.
- [ ] Confirm products have variants, prices and stock.
- [ ] Test a customer order from product selection through confirmation.
- [ ] Test that the order appears in the store desk.
- [ ] Test staff role restrictions with a non-admin account.
- [ ] Test rider assignment and delivery status transitions.
- [ ] Verify payment mode and clearly label any sandbox/demo payment.
- [ ] Remove any real customer data from the demonstration environment.

## Scope statement

This is a functional prototype. Production launch additionally requires deployment verification, real business catalogue and service-area data, payment and notification credentials, operational policies, monitoring, security review and end-to-end acceptance testing.
