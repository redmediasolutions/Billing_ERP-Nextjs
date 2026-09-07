# Subscription API paste guide

Frontend expects `{ success, data, message }` on:

- `GET /subscription`
- `PUT /subscription`
- `GET /subscription/invoices`
- `POST /subscription/renew-request`

SQL and Express for these routes are in the chat that shipped this doc.
Mount with `mountOptional("/subscription", "./Modules/subscription/subscription.routes")`
so a paste error cannot crash login.
