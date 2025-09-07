# Elimn Order Service

Minimal Order Service for a fictitious shop with RBAC, Idempotency, Concurrency, Webhooks, and Caching.

##  Stack

- **Backend**: Node.js, Express, Prisma (SQLite)
- **Frontend**: React + Vite, Context API for auth
- **Auth**: JWT (HS256)
- **Testing**: Jest, React Testing Library, Supertest
- **Observability**: Prometheus metrics + request logging
- **Caching**: In-memory (Node) for GET /orders/:id
- **RBAC**: Middleware (ADMIN / USER roles)
- **Concurrency**: Optimistic locking via version column
- **Idempotency**: client_token for order creation

##  Architecture Notes

- **Backend**:
  - `auth.js` → signup/login
  - `orders.js` → create, list, detail, update orders
  - Middleware: `authRequired`, `requireAdmin`, `requireRole`
  - Optimistic locking for status updates
  - Idempotent POST /orders with client_token
  - Metrics: `orders_created_total`
- **Frontend**:
  - `AuthContext` manages login/logout and token
  - `authFetch` ensures JWT is sent
  - React components consume API and respect RBAC
- **Testing**:
  - Unit tests for AuthContext & API
  - Integration tests for RBAC, idempotency, and concurrency

## 🚀 Run Instructions

```powershell
# Install dependencies
npm install
cd admin-ui
npm install
cd server

## Run backend

npx prisma migrate dev --name init
npx prisma generate
npm run seed
npm run dev
# Server runs on http://localhost:4000

# Run frontend
cd client
npm run dev
# Frontend runs on http://localhost:5173

# Run tests
# Backend tests
npm run test

# Frontend tests
cd amin-ui
npm run test
```

## .env

DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key-min-32-chars-here"
PORT=4000
NODE_ENV=development
JWT_REFRESH_SECRET="your-refresh-secret-key-min-32-chars-here"
PAYMENT_WEBHOOK_SECRET="your-payment-webhook-secret-here"

## Example API Usage

# 1. Login as Admin

$body = @{ email='admin@example.com'; password='password123' } | ConvertTo-Json
$response = curl -Method POST -Uri http://localhost:4000/auth/login -Body $body -ContentType 'application/json'
$response

# 2. Create a New Order (USER Role)

$body = @{
items = @(@{sku='SKU-101'; qty=2}, @{sku='SKU-102'; qty=1})
clientToken = 'unique-token-001'
} | ConvertTo-Json

curl -Method POST -Uri http://localhost:4000/orders -Body $body -Headers @{ Authorization = 'Bearer $token'; 'Content-Type' = 'application/json' }

# 3. List Orders (with Pagination / Filters)

curl -Method GET -Uri 'http://localhost:4000/orders?page=1&limit=10&status=PENDING' -Headers @{ Authorization = 'Bearer $token' }

# 4. Update Order Status (ADMIN Only)

$body = @{ status = 'PAID'; version = 1 } | ConvertTo-Json
curl -Method PATCH -Uri http://localhost:4000/orders/1/status -Body $body -Headers @{ Authorization = 'Bearer $token'; 'Content-Type' = 'application/json' }

# 5. Get Order Details

curl -Method GET -Uri http://localhost:4000/orders/1 -Headers @{ Authorization = 'Bearer $token' }


Extract ZIP and follow the run instructions above.


All credentials for testing:

Admin: admin@example.com / password123

Users: user1@example.com / password123, user2@example.com / password123<img width="1366" height="768" alt="Screenshot (381)" src="https://github.com/user-attachments/assets/b7816f4a-c4c8-4892-9ae3-88e2fbbab97a" />
<img width="1366" height="768" alt="Screenshot (380)" src="https://github.com/user-attachments/assets/621e6ece-39cf-4f4e-bb67-d362593dfcd7" />
<img width="1366" height="768" alt="Screenshot (379)" src="https://github.com/user-attachments/assets/c64ef5d4-9f7c-4e98-992e-fd5597489d75" />
<img width="1366" height="768" alt="Screenshot (378)" src="https://github.com/user-attachments/assets/ace68acc-4f49-4cf4-9a64-bdb8ca3a0d18" />
<img width="1366" height="768" alt="Screenshot (377)" src="https://github.com/user-attachments/assets/9cee87b7-9feb-4123-8fd7-971f463c7ea5" />
<img width="1366" height="768" alt="Screenshot (382)" src="https://github.com/user-attachments/assets/a4de22fd-51da-4fb1-99c6-2d034b686e2b" />

