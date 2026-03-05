# API Specification - Subscription Management SaaS

**Project:** Subscription Management System  
**Version:** 1.0  
**Base URL:** `https://api.subscription.com/api/v1`  
**Date:** January 9, 2026

---

## Table of Contents
1. [Authentication](#1-authentication)
2. [Plans](#2-plans)
3. [Subscriptions](#3-subscriptions)
4. [Payments](#4-payments)
5. [Error Responses](#5-error-responses)
6. [Status Codes](#6-status-codes)

---

## API Overview

### Base URL
- **Development:** `http://localhost:5000/api/v1`
- **Production:** `https://api.subscription.com/api/v1`

### Authentication
- JWT Bearer Token
- Header: `Authorization: Bearer <token>`
- Token expiry: 24 hours

### Content Type
- Request: `application/json`
- Response: `application/json`

---

## 1. Authentication

### 1.1 Register User

**Endpoint:** `POST /auth/register`

**Description:** Register a new user account

**Authentication:** None

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Validation Rules:**
- `email`: Required, valid email format, unique
- `password`: Required, min 8 characters

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid-1234",
      "email": "user@example.com",
      "role": "USER",
      "createdAt": "2026-01-09T10:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `400` - Email already exists
- `400` - Invalid email format
- `400` - Password too weak

---

### 1.2 Login

**Endpoint:** `POST /auth/login`

**Description:** Authenticate user and receive JWT token

**Authentication:** None

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid-1234",
      "email": "user@example.com",
      "role": "USER"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `401` - Invalid credentials
- `400` - Missing email or password

---

### 1.3 Get Current User

**Endpoint:** `GET /auth/me`

**Description:** Get authenticated user's profile

**Authentication:** Required (Bearer Token)

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-1234",
      "email": "user@example.com",
      "role": "USER",
      "createdAt": "2026-01-09T10:30:00Z"
    }
  }
}
```

**Error Responses:**
- `401` - Invalid or expired token

---

## 2. Plans

### 2.1 Get All Plans

**Endpoint:** `GET /plans`

**Description:** Get all active subscription plans

**Authentication:** None (public endpoint)

**Query Parameters:**
- `isActive` (optional): Filter by active status (default: true)

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "plans": [
      {
        "id": "uuid-plan-1",
        "name": "Basic Monthly",
        "price": 9.99,
        "durationDays": 30,
        "isActive": true,
        "createdAt": "2026-01-01T00:00:00Z"
      },
      {
        "id": "uuid-plan-2",
        "name": "Premium Monthly",
        "price": 14.99,
        "durationDays": 30,
        "isActive": true,
        "createdAt": "2026-01-01T00:00:00Z"
      }
    ],
    "count": 2
  }
}
```

---

### 2.2 Get Plan by ID

**Endpoint:** `GET /plans/:id`

**Description:** Get specific plan details

**Authentication:** None

**URL Parameters:**
- `id`: Plan UUID

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "plan": {
      "id": "uuid-plan-1",
      "name": "Basic Monthly",
      "price": 9.99,
      "durationDays": 30,
      "isActive": true,
      "createdAt": "2026-01-01T00:00:00Z",
      "updatedAt": "2026-01-01T00:00:00Z"
    }
  }
}
```

**Error Responses:**
- `404` - Plan not found

---

### 2.3 Create Plan (Admin Only)

**Endpoint:** `POST /plans`

**Description:** Create a new subscription plan

**Authentication:** Required (Admin role)

**Request Body:**
```json
{
  "name": "Premium Annual",
  "price": 149.99,
  "durationDays": 365
}
```

**Validation Rules:**
- `name`: Required, 3-100 characters
- `price`: Required, > 0, max 2 decimal places
- `durationDays`: Required, > 0

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Plan created successfully",
  "data": {
    "plan": {
      "id": "uuid-plan-3",
      "name": "Premium Annual",
      "price": 149.99,
      "durationDays": 365,
      "isActive": true,
      "createdAt": "2026-01-09T11:00:00Z"
    }
  }
}
```

**Error Responses:**
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (not admin)
- `400` - Validation error

---

### 2.4 Update Plan (Admin Only)

**Endpoint:** `PUT /plans/:id`

**Description:** Update an existing plan

**Authentication:** Required (Admin role)

**Request Body:**
```json
{
  "name": "Premium Annual - Updated",
  "price": 139.99,
  "isActive": true
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Plan updated successfully",
  "data": {
    "plan": {
      "id": "uuid-plan-3",
      "name": "Premium Annual - Updated",
      "price": 139.99,
      "durationDays": 365,
      "isActive": true,
      "updatedAt": "2026-01-09T12:00:00Z"
    }
  }
}
```

**Error Responses:**
- `404` - Plan not found
- `403` - Forbidden (not admin)

---

### 2.5 Delete Plan (Admin Only)

**Endpoint:** `DELETE /plans/:id`

**Description:** Soft delete a plan (sets isActive = false)

**Authentication:** Required (Admin role)

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Plan deleted successfully"
}
```

**Error Responses:**
- `404` - Plan not found
- `403` - Forbidden (not admin)
- `400` - Cannot delete plan with active subscriptions

---

## 3. Subscriptions

### 3.1 Subscribe to Plan

**Endpoint:** `POST /subscriptions/subscribe`

**Description:** Create a new subscription for authenticated user

**Authentication:** Required (Bearer Token)

**Request Body:**
```json
{
  "planId": "uuid-plan-1"
}
```

**Validation Rules:**
- `planId`: Required, must be valid and active plan
- User cannot have an existing active subscription

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Subscription created successfully",
  "data": {
    "subscription": {
      "id": "uuid-sub-1",
      "userId": "uuid-user-1",
      "planId": "uuid-plan-1",
      "status": "PENDING",
      "startDate": null,
      "endDate": null,
      "createdAt": "2026-01-09T13:00:00Z"
    },
    "payment": {
      "id": "uuid-payment-1",
      "amount": 9.99,
      "status": "PENDING",
      "paymentUrl": "https://mock-gateway.com/pay/uuid-payment-1"
    }
  }
}
```

**Error Responses:**
- `400` - User already has active subscription
- `404` - Plan not found
- `400` - Plan is not active

---

### 3.2 Get My Subscription

**Endpoint:** `GET /subscriptions/me`

**Description:** Get authenticated user's current subscription

**Authentication:** Required (Bearer Token)

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": "uuid-sub-1",
      "status": "ACTIVE",
      "startDate": "2026-01-09T13:05:00Z",
      "endDate": "2026-02-08T13:05:00Z",
      "plan": {
        "id": "uuid-plan-1",
        "name": "Basic Monthly",
        "price": 9.99,
        "durationDays": 30
      },
      "createdAt": "2026-01-09T13:00:00Z"
    }
  }
}
```

**Error Responses:**
- `404` - No active subscription found

---

### 3.3 Get Subscription History

**Endpoint:** `GET /subscriptions/history`

**Description:** Get all subscriptions for authenticated user

**Authentication:** Required (Bearer Token)

**Query Parameters:**
- `status` (optional): Filter by status (PENDING, ACTIVE, CANCELED, FAILED)
- `limit` (optional): Number of results (default: 10)
- `offset` (optional): Pagination offset (default: 0)

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "subscriptions": [
      {
        "id": "uuid-sub-2",
        "status": "CANCELED",
        "startDate": "2025-12-01T00:00:00Z",
        "endDate": "2025-12-31T00:00:00Z",
        "plan": {
          "name": "Basic Monthly",
          "price": 9.99
        },
        "createdAt": "2025-12-01T00:00:00Z"
      }
    ],
    "pagination": {
      "total": 2,
      "limit": 10,
      "offset": 0
    }
  }
}
```

---

### 3.4 Cancel Subscription

**Endpoint:** `POST /subscriptions/cancel`

**Description:** Cancel user's active subscription

**Authentication:** Required (Bearer Token)

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Subscription canceled successfully",
  "data": {
    "subscription": {
      "id": "uuid-sub-1",
      "status": "CANCELED",
      "startDate": "2026-01-09T13:05:00Z",
      "endDate": "2026-02-08T13:05:00Z",
      "updatedAt": "2026-01-09T14:00:00Z"
    }
  }
}
```

**Error Responses:**
- `404` - No active subscription found
- `400` - Subscription already canceled

---

### 3.5 Check Subscription Status (External API)

**Endpoint:** `GET /subscriptions/check/:userId`

**Description:** Check if external user has active subscription (for LOFIVE integration)

**Authentication:** Required (Service-to-service token or API key)

**URL Parameters:**
- `userId`: User UUID from external system

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "hasActiveSubscription": true,
    "subscription": {
      "status": "ACTIVE",
      "plan": "Premium Monthly",
      "endDate": "2026-02-08T13:05:00Z"
    }
  }
}
```

**When No Active Subscription (200 OK):**
```json
{
  "success": true,
  "data": {
    "hasActiveSubscription": false
  }
}
```

---

## 4. Payments

### 4.1 Create Payment

**Endpoint:** `POST /payments/create`

**Description:** Initiate payment for a subscription (internal use)

**Authentication:** Required (Bearer Token)

**Request Body:**
```json
{
  "subscriptionId": "uuid-sub-1"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "payment": {
      "id": "uuid-payment-1",
      "subscriptionId": "uuid-sub-1",
      "amount": 9.99,
      "status": "PENDING",
      "provider": "MockPaymentGateway",
      "createdAt": "2026-01-09T13:01:00Z"
    },
    "paymentUrl": "https://mock-gateway.com/pay/uuid-payment-1"
  }
}
```

---

### 4.2 Payment Callback (Webhook)

**Endpoint:** `POST /payments/callback`

**Description:** Receive payment status updates from payment gateway

**Authentication:** Webhook signature verification

**Request Body:**
```json
{
  "transactionId": "txn_mock_123456",
  "paymentId": "uuid-payment-1",
  "status": "COMPLETED",
  "amount": 9.99,
  "timestamp": "2026-01-09T13:05:00Z"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Payment status updated"
}
```

**Business Logic:**
- If status = COMPLETED: Update payment, activate subscription
- If status = FAILED: Update payment, mark subscription as FAILED
- Idempotent: Duplicate callbacks ignored (check transactionId)

---

### 4.3 Get Payment History

**Endpoint:** `GET /payments/history`

**Description:** Get payment history for authenticated user

**Authentication:** Required (Bearer Token)

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": "uuid-payment-1",
        "amount": 9.99,
        "status": "COMPLETED",
        "provider": "MockPaymentGateway",
        "transactionId": "txn_mock_123456",
        "subscription": {
          "plan": {
            "name": "Basic Monthly"
          }
        },
        "createdAt": "2026-01-09T13:01:00Z"
      }
    ]
  }
}
```

---

## 5. Error Responses

### Standard Error Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

### Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `UNAUTHORIZED` | Missing or invalid authentication |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `DUPLICATE_RESOURCE` | Resource already exists |
| `BUSINESS_LOGIC_ERROR` | Business rule violation |
| `INTERNAL_SERVER_ERROR` | Server error |

---

## 6. Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource conflict (e.g., duplicate) |
| 422 | Unprocessable Entity - Validation error |
| 500 | Internal Server Error |

---

## 7. Rate Limiting

- **Limit:** 100 requests per minute per IP
- **Headers:**
  - `X-RateLimit-Limit: 100`
  - `X-RateLimit-Remaining: 95`
  - `X-RateLimit-Reset: 1704801600`

**Rate Limit Exceeded Response (429):**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later."
  }
}
```

---

## 8. CORS Policy

**Allowed Origins:**
- Development: `http://localhost:5173`
- Production: `https://subscription.vercel.app`, `https://lofive.com`

**Allowed Methods:** GET, POST, PUT, DELETE, OPTIONS

**Allowed Headers:** Content-Type, Authorization

---

## 9. Versioning

- Current version: `v1`
- Version in URL: `/api/v1`
- Breaking changes will increment major version (`v2`)

---

## 10. Integration Example (LOFIVE)

### Checking User Subscription Status

```javascript
// LOFIVE Backend Code
const checkUserSubscription = async (userId) => {
  const response = await fetch(
    `https://api.subscription.com/api/v1/subscriptions/check/${userId}`,
    {
      headers: {
        'Authorization': `Bearer ${SERVICE_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  const data = await response.json();
  return data.data.hasActiveSubscription;
};

// Usage in LOFIVE
if (await checkUserSubscription(clerkUserId)) {
  // Grant premium access
} else {
  // Show upgrade prompt
}
```

---

**Document Version:** 1.0  
**Last Updated:** January 9, 2026  
**Status:** Approved
