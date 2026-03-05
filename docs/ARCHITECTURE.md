# System Architecture - Subscription Management SaaS

**Project:** Subscription Management System  
**Version:** 1.0  
**Date:** January 9, 2026

---

## Table of Contents
1. [Overview](#1-overview)
2. [Architecture Style](#2-architecture-style)
3. [System Components](#3-system-components)
4. [Backend Architecture](#4-backend-architecture)
5. [Frontend Architecture](#5-frontend-architecture)
6. [Data Flow](#6-data-flow)
7. [Security Architecture](#7-security-architecture)
8. [Deployment Architecture](#8-deployment-architecture)
9. [Integration Architecture](#9-integration-architecture)

---

## 1. Overview

### 1.1 System Purpose
The Subscription Management SaaS is a standalone service that manages subscription lifecycle, payment processing, and plan management for the LOFIVE music streaming platform.

### 1.2 Architecture Principles
- **Separation of Concerns:** Clear boundaries between layers
- **Single Responsibility:** Each module has one clear purpose
- **Domain-Driven Design:** Business logic organized by domain
- **API-First:** External integration through well-defined contracts
- **Stateless Backend:** Horizontal scalability
- **Security by Design:** Authentication, authorization, and validation at every layer

### 1.3 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    LOFIVE Platform                          │
│              (Clerk Auth + Next.js App)                     │
└─────────────────┬───────────────────────────────────────────┘
                  │ HTTP/REST API
                  │ JWT Token
                  ▼
┌─────────────────────────────────────────────────────────────┐
│         Subscription Management Frontend (React)            │
│                  (Vercel Deployment)                        │
└─────────────────┬───────────────────────────────────────────┘
                  │ HTTP/REST API
                  │ JWT Token
                  ▼
┌─────────────────────────────────────────────────────────────┐
│       Subscription Management Backend (Node.js/Express)     │
│                  (Render Deployment)                        │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐   │
│  │   Auth   │  Plans   │   Subs   │ Payments │  Users   │   │
│  │  Module  │  Module  │  Module  │  Module  │  Module  │   │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘   │
└─────────────────┬───────────────────────────────────────────┘
                  │ Prisma ORM
                  ▼
┌─────────────────────────────────────────────────────────────┐
│           PostgreSQL Database (Render/Supabase)             │
└─────────────────────────────────────────────────────────────┘
                  ▲
                  │ Webhook Callback
┌─────────────────┴───────────────────────────────────────────┐
│              Mock Payment Gateway                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Architecture Style

### 2.1 Backend: Domain-Based + Layered Architecture

**Domain-Based (Vertical Slice):**
- Code organized by business domain (auth, plans, subscriptions, payments)
- Each domain is self-contained with its own routes, controllers, services, and validation

**Layered (Horizontal Slice):**
- **Presentation Layer:** Controllers (handle HTTP requests/responses)
- **Business Logic Layer:** Services (core business rules)
- **Data Access Layer:** Prisma models (database operations)
- **Common Layer:** Middleware, errors, utilities

### 2.2 Frontend: Feature-Based Architecture

- Code organized by feature (auth, plans, subscriptions)
- Each feature contains components, hooks, and API calls
- Shared components in separate folder
- Layouts for page structure

---

## 3. System Components

### 3.1 Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT TIER                            │
├─────────────────────────────────────────────────────────────┤
│  React Frontend                                             │
│  ├── Auth Components (Login, Register)                      │
│  ├── Plan Components (PlanList, PlanCard)                   │
│  ├── Subscription Components (Subscribe, MySubscription)    │
│  ├── Payment Components (PaymentForm, PaymentStatus)        │
│  └── Shared Components (Layout, Navigation, Button)         │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ HTTPS/REST
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION TIER                         │
├─────────────────────────────────────────────────────────────┤
│  Express.js Backend                                         │
│  ├── API Routes Layer                                       │
│  │   ├── /api/v1/auth                                       │
│  │   ├── /api/v1/plans                                      │
│  │   ├── /api/v1/subscriptions                              │
│  │   └── /api/v1/payments                                   │
│  │                                                          │
│  ├── Middleware Layer                                       │
│  │   ├── Authentication (JWT Verify)                        │
│  │   ├── Authorization (Role Check)                         │
│  │   ├── Validation (Request Validation)                    │
│  │   ├── Error Handler (Global Error Handling)              │
│  │   └── Logger (Request/Response Logging)                  │
│  │                                                          │
│  ├── Controller Layer (Thin)                                │
│  │   ├── AuthController                                     │
│  │   ├── PlanController                                     │
│  │   ├── SubscriptionController                             │
│  │   └── PaymentController                                  │
│  │                                                          │
│  ├── Service Layer (Fat - Business Logic)                   │
│  │   ├── AuthService                                        │
│  │   ├── PlanService                                        │
│  │   ├── SubscriptionService                                │
│  │   └── PaymentService                                     │
│  │                                                          │
│  └── Common Layer                                           │
│      ├── Errors (Custom Error Classes)                      │
│      ├── Utils (Helpers, Validators)                        │
│      └── Config (Environment Variables)                     │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ Prisma ORM
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA TIER                              │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL Database                                        │
│  ├── users table                                            │
│  ├── plans table                                            │
│  ├── subscriptions table                                    │
│  └── payments table                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Backend Architecture

### 4.1 Folder Structure

```
backend/
├── src/
│   ├── modules/                      # Domain-based modules
│   │   ├── auth/
│   │   │   ├── auth.controller.ts    # HTTP request handling
│   │   │   ├── auth.service.ts       # Business logic
│   │   │   ├── auth.routes.ts        # Route definitions
│   │   │   └── auth.validation.ts    # Input validation schemas
│   │   │
│   │   ├── users/
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   └── user.routes.ts
│   │   │
│   │   ├── plans/
│   │   │   ├── plan.controller.ts
│   │   │   ├── plan.service.ts
│   │   │   ├── plan.routes.ts
│   │   │   └── plan.validation.ts
│   │   │
│   │   ├── subscriptions/
│   │   │   ├── subscription.controller.ts
│   │   │   ├── subscription.service.ts
│   │   │   ├── subscription.routes.ts
│   │   │   └── subscription.validation.ts
│   │   │
│   │   └── payments/
│   │       ├── payment.controller.ts
│   │       ├── payment.service.ts
│   │       ├── payment.routes.ts
│   │       └── payment-gateway.service.ts
│   │
│   ├── common/                        # Shared code
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts    # JWT verification
│   │   │   ├── authorize.middleware.ts # Role-based access
│   │   │   ├── validate.middleware.ts # Request validation
│   │   │   └── error.middleware.ts   # Error handling
│   │   │
│   │   ├── errors/
│   │   │   ├── AppError.ts           # Base error class
│   │   │   ├── ValidationError.ts
│   │   │   ├── UnauthorizedError.ts
│   │   │   └── NotFoundError.ts
│   │   │
│   │   └── utils/
│   │       ├── jwt.util.ts           # JWT helpers
│   │       ├── bcrypt.util.ts        # Password hashing
│   │       └── validators.ts         # Common validators
│   │
│   ├── database/
│   │   └── prisma.ts                 # Prisma client instance
│   │
│   ├── app.ts                        # Express app setup
│   └── server.ts                     # Server entry point
│
├── prisma/
│   ├── schema.prisma                 # Database schema
│   ├── migrations/                   # Migration files
│   └── seed.ts                       # Seed data
│
├── .env                              # Environment variables
├── .env.example                      # Example env file
├── package.json
└── tsconfig.json                     # TypeScript config
```

### 4.2 Layer Responsibilities

#### 4.2.1 Controller Layer (Thin)
**Purpose:** Handle HTTP requests and responses

**Responsibilities:**
- Parse request data (body, params, query)
- Call appropriate service methods
- Format and send responses
- NO business logic

**Example:**
```typescript
// modules/subscriptions/subscription.controller.ts
export class SubscriptionController {
  async subscribe(req: Request, res: Response, next: NextFunction) {
    try {
      const { planId } = req.body;
      const userId = req.user.id; // From auth middleware
      
      const result = await subscriptionService.createSubscription(userId, planId);
      
      res.status(201).json({
        success: true,
        message: 'Subscription created successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}
```

#### 4.2.2 Service Layer (Fat)
**Purpose:** Implement business logic

**Responsibilities:**
- Validate business rules
- Coordinate database operations
- Handle complex transactions
- Throw domain-specific errors

**Example:**
```typescript
// modules/subscriptions/subscription.service.ts
export class SubscriptionService {
  async createSubscription(userId: string, planId: string) {
    // Business rule: Check for existing active subscription
    const activeSubscription = await prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE' }
    });
    
    if (activeSubscription) {
      throw new BusinessLogicError('User already has an active subscription');
    }
    
    // Business logic: Create subscription + payment in transaction
    const result = await prisma.$transaction(async (tx) => {
      const subscription = await tx.subscription.create({
        data: { userId, planId, status: 'PENDING' }
      });
      
      const plan = await tx.plan.findUnique({ where: { id: planId } });
      
      const payment = await tx.payment.create({
        data: {
          subscriptionId: subscription.id,
          amount: plan.price,
          status: 'PENDING',
          provider: 'MockPaymentGateway'
        }
      });
      
      return { subscription, payment };
    });
    
    return result;
  }
}
```

#### 4.2.3 Middleware Layer
**Purpose:** Cross-cutting concerns

**Authentication Middleware:**
```typescript
// common/middleware/auth.middleware.ts
export const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    throw new UnauthorizedError('No token provided');
  }
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded; // Attach user to request
  next();
};
```

**Authorization Middleware:**
```typescript
// common/middleware/authorize.middleware.ts
export const authorize = (...roles: string[]) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError('Insufficient permissions');
    }
    next();
  };
};
```

---

## 5. Frontend Architecture

### 5.1 Folder Structure

```
frontend/
├── src/
│   ├── features/                     # Feature-based modules
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── RegisterForm.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.ts
│   │   │   └── api/
│   │   │       └── authApi.ts
│   │   │
│   │   ├── plans/
│   │   │   ├── components/
│   │   │   │   ├── PlanList.tsx
│   │   │   │   └── PlanCard.tsx
│   │   │   ├── hooks/
│   │   │   │   └── usePlans.ts
│   │   │   └── api/
│   │   │       └── plansApi.ts
│   │   │
│   │   └── subscriptions/
│   │       ├── components/
│   │       │   ├── SubscribeButton.tsx
│   │       │   ├── MySubscription.tsx
│   │       │   └── SubscriptionHistory.tsx
│   │       ├── hooks/
│   │       │   └── useSubscription.ts
│   │       └── api/
│   │           └── subscriptionsApi.ts
│   │
│   ├── components/                   # Shared components
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Input.tsx
│   │   └── layout/
│   │       ├── Navbar.tsx
│   │       └── Footer.tsx
│   │
│   ├── layouts/                      # Page layouts
│   │   ├── MainLayout.tsx
│   │   └── AuthLayout.tsx
│   │
│   ├── hooks/                        # Global hooks
│   │   └── useApi.ts
│   │
│   ├── lib/                          # Utilities
│   │   ├── axios.ts                  # Axios instance
│   │   ├── auth.ts                   # Auth helpers
│   │   └── constants.ts
│   │
│   ├── types/                        # TypeScript types
│   │   └── index.ts
│   │
│   ├── App.tsx                       # Root component
│   ├── main.tsx                      # Entry point
│   └── router.tsx                    # Route configuration
│
├── public/
├── .env
└── package.json
```

### 5.2 State Management
- React Context API for global state (auth)
- Local component state for UI state
- React Query for server state (optional future enhancement)

---

## 6. Data Flow

### 6.1 User Subscription Flow

```
┌──────────┐     1. Select Plan       ┌──────────┐
│  User    │ ───────────────────────> │ Frontend │
└──────────┘                          └────┬─────┘
                                           │
                                           │ 2. POST /subscriptions/subscribe
                                           │    { planId: "uuid" }
                                           ▼
                                      ┌────────────┐
                                      │  Backend   │
                                      │ Controller │
                                      └─────┬──────┘
                                            │
                                            │ 3. Validate + Create
                                            ▼
                                      ┌────────────┐
                                      │  Service   │
                                      │ - Check no active sub
                                      │ - Create subscription (PENDING)
                                      │ - Create payment (PENDING)
                                      └─────┬──────┘
                                            │
                                            │ 4. Database Transaction
                                            ▼
                                      ┌────────────┐
                                      │ PostgreSQL │
                                      │ - Insert subscription
                                      │ - Insert payment
                                      └─────┬──────┘
                                            │
                                            │ 5. Return payment URL
                                            ▼
┌──────────┐     6. Redirect to      ┌──────────┐
│  User    │ <───────────────────────│ Frontend │
└────┬─────┘      Payment Gateway    └──────────┘
     │
     │ 7. Complete Payment
     ▼
┌─────────────────┐
│ Payment Gateway │
└────┬────────────┘
     │
     │ 8. Webhook Callback
     │    POST /payments/callback
     │    { status: "COMPLETED", paymentId: "uuid" }
     ▼
┌────────────┐
│  Backend   │
│ - Update payment status
│ - Activate subscription
│ - Set start/end dates
└────────────┘
```

### 6.2 Authentication Flow

```
┌──────────┐     1. Login Request     ┌──────────┐
│  User    │ ───────────────────────> │ Frontend │
└──────────┘    (email, password)     └────┬─────┘
                                           │
                                           │ 2. POST /auth/login
                                           ▼
                                      ┌────────────┐
                                      │  Backend   │
                                      │ - Find user by email
                                      │ - Compare password hash
                                      │ - Generate JWT token
                                      └─────┬──────┘
                                            │
                                            │ 3. Return JWT
                                            ▼
┌──────────┐     4. Store token       ┌──────────┐
│  User    │ <─────────────────────── │ Frontend │
└──────────┘    (localStorage)        └──────────┘
     │
     │ 5. Subsequent Requests
     │    Authorization: Bearer <token>
     ▼
┌────────────┐
│  Backend   │
│ - Verify JWT
│ - Extract user info
│ - Authorize action
└────────────┘
```

---

## 7. Security Architecture

### 7.1 Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Layer 1: Transport              │
│                         HTTPS/TLS                           │
└─────────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────────┐
│                    Security Layer 2: CORS                   │
│              Allowed Origins: Frontend URL                  │
└─────────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────────┐
│                 Security Layer 3: Authentication            │
│                  JWT Token Verification                     │
└─────────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────────┐
│                 Security Layer 4: Authorization             │
│                     Role-Based Access                       │
└─────────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────────┐
│                 Security Layer 5: Validation                │
│              Input Sanitization & Validation                │
└─────────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────────┐
│                 Security Layer 6: Data Access               │
│                   Business Rule Enforcement                 │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 Authentication & Authorization

**JWT Token Structure:**
```json
{
  "userId": "uuid-1234",
  "email": "user@example.com",
  "role": "USER",
  "iat": 1704801600,
  "exp": 1704888000
}
```

**Protected Route Example:**
```typescript
// Admin-only route
router.post('/plans',
  authenticate,           // Verify JWT
  authorize('ADMIN'),     // Check role
  validateRequest(createPlanSchema),
  planController.create
);
```

### 7.3 Data Protection

- **Passwords:** Hashed with bcrypt (10 salt rounds)
- **Tokens:** JWT signed with secret key
- **Environment Variables:** Sensitive data in .env (not committed)
- **Database:** PostgreSQL with SSL connection
- **API Keys:** Never exposed to frontend

---

## 8. Deployment Architecture

### 8.1 Production Environment

```
┌─────────────────────────────────────────────────────────────┐
│                         Internet                            │
└─────────────────┬───────────────────────────────────────────┘
                  │
         ┌────────┴────────┐
         │                 │
         ▼                 ▼
┌─────────────────┐  ┌─────────────────┐
│   Vercel CDN    │  │   Render        │
│   (Frontend)    │  │   (Backend)     │
│                 │  │                 │
│ - React App     │  │ - Node.js API   │
│ - Static Assets │  │ - Health Check  │
│ - SSL/HTTPS     │  │ - Auto-scaling  │
└─────────────────┘  └────────┬────────┘
                              │
                              │ SSL/TLS
                              ▼
                     ┌─────────────────┐
                     │   PostgreSQL    │
                     │  (Render/Supabase)│
                     │                 │
                     │ - Automated     │
                     │   backups       │
                     │ - SSL required  │
                     └─────────────────┘
```

### 8.2 Environment Configuration

**Development:**
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173`
- Database: Local PostgreSQL

**Production:**
- Backend: `https://subscription-api.onrender.com`
- Frontend: `https://subscription.vercel.app`
- Database: Render PostgreSQL / Supabase

---

## 9. Integration Architecture

### 9.1 LOFIVE Integration

```
┌─────────────────────────────────────────────────────────────┐
│                    LOFIVE Platform                          │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Clerk Authentication                                │   │
│  │  - User signs in with Clerk                          │   │
│  │  - Gets Clerk userId                                 │   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                 │
│                           │ Pass userId                     │
│                           ▼                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  LOFIVE Backend                                      │   │
│  │  - Receives userId from Clerk                        │   │
│  │  - Checks subscription status via API                │   │
│  └──────────────────┬───────────────────────────────────┘   │
└────────────────────┼────────────────────────────────────────┘
                     │
                     │ HTTP GET /subscriptions/check/:userId
                     │ Authorization: Bearer <service_token>
                     ▼
┌─────────────────────────────────────────────────────────────┐
│         Subscription Management System                      │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  API Gateway                                         │   │
│  │  - Verify service token                              │   │
│  │  - Check subscription status                         │   │
│  │  - Return hasActiveSubscription: true/false          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 9.2 Integration Contract

**LOFIVE → Subscription Service:**
```typescript
// Check if user has active subscription
GET /api/v1/subscriptions/check/:userId
Headers: {
  Authorization: Bearer <service_token>
}

Response: {
  success: true,
  data: {
    hasActiveSubscription: boolean,
    subscription: {
      status: string,
      plan: string,
      endDate: string
    } | null
  }
}
```

**Business Rules:**
- LOFIVE trusts Subscription Service responses
- No direct database access between systems
- Service-to-service authentication via JWT
- Subscription Service is source of truth for subscription status

---

## 10. Technology Decisions

### 10.1 Backend Technology Choices

| Technology | Reason |
|-----------|--------|
| Node.js | JavaScript ecosystem, async I/O |
| Express.js | Minimal, flexible, well-documented |
| TypeScript | Type safety, better IDE support |
| Prisma | Type-safe ORM, migrations, PostgreSQL support |
| JWT | Stateless authentication, scalable |
| bcrypt | Industry standard for password hashing |

### 10.2 Frontend Technology Choices

| Technology | Reason |
|-----------|--------|
| React | Component-based, large ecosystem |
| TypeScript | Type safety, better developer experience |
| Vite | Fast build tool, HMR |
| Axios | HTTP client with interceptors |

### 10.3 Database Choice

**PostgreSQL:**
- ✅ ACID compliance (critical for payments)
- ✅ Strong relational integrity
- ✅ JSON support for future flexibility
- ✅ Excellent Prisma support
- ✅ Free tier on Render/Supabase

---

## 11. Scalability & Performance

### 11.1 Current Architecture (V1)
- **Backend:** Stateless (horizontal scaling ready)
- **Database:** Single PostgreSQL instance
- **Concurrent Users:** ~1000
- **Transactions/day:** ~10,000

### 11.2 Future Enhancements (V2+)
- **Caching:** Redis for active subscriptions
- **Database:** Read replicas for analytics
- **Queue:** Bull/RabbitMQ for async payment processing
- **CDN:** CloudFront for static assets
- **Monitoring:** Sentry for error tracking
- **Logging:** Winston + ELK stack

---

**Document Version:** 1.0  
**Last Updated:** January 9, 2026  
**Status:** Approved
