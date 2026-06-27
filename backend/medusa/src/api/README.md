# Medusa.js API Routes

Custom API routes for Tienda de Ropa Infantil.

## Route Structure

```
src/api/
├── webhooks/
│   └── stripe/route.ts        — Stripe webhook handler
├── store/
│   └── size-calculator/route.ts — Size recommendation endpoint
└── admin/
    └── ...
```

## Conventions

- Webhooks follow Medusa.js v2 API route patterns
- Store routes are publicly accessible (with rate limiting)
- Admin routes require authentication and admin role
