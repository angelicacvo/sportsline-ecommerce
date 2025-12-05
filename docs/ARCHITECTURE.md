# 🏗️ Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway (Port 3000)                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  HTTP Endpoints                                       │  │
│  │  - Authentication (JWT, API Key, OAuth)              │  │
│  │  - Request Routing                                    │  │
│  │  - Guards & Interceptors                             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ TCP Communication
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                     Microservices                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Users   │  │ Products │  │  Orders  │  │Categories│   │
│  │  :4001   │  │  :4002   │  │  :4003   │  │  :4004   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐                                               │
│  │OrderItems│                                               │
│  │  :4005   │                                               │
│  └──────────┘                                               │
└──────────────────────────────────────────────────────────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │   PostgreSQL    │
                  │     :8326       │
                  └─────────────────┘
```

## Components

### API Gateway
- **Port:** 3000
- **Responsibilities:**
  - HTTP request handling
  - Authentication & authorization
  - Request routing to microservices
  - Response formatting
  - Swagger documentation
- **Technologies:** NestJS, Passport, JWT

### Microservices

#### Users Service (Port 4001)
- User CRUD operations
- API key management
- OAuth user creation
- Password hashing with bcrypt

#### Products Service (Port 4002)
- Product catalog management
- Inventory tracking
- Search and filtering

#### Orders Service (Port 4003)
- Order creation and management
- Order status tracking
- Order history

#### Categories Service (Port 4004)
- Product category management
- Category hierarchy

#### Order Items Service (Port 4005)
- Order line items
- Product-order relationships
- Quantity and pricing

### Database
- **Type:** PostgreSQL 16
- **Port:** 8326 (external), 5432 (internal)
- **Schema:** Shared across all microservices
- **ORM:** TypeORM

## Communication Patterns

### HTTP → Gateway
- Client sends HTTP requests to Gateway
- Gateway validates authentication
- Guards check permissions

### Gateway → Microservices (TCP)
- Gateway uses TCP transport
- Message pattern: `{ cmd: 'operation_name' }`
- Payload contains operation data
- Microservices respond with data or errors

### Microservices → Database
- Direct connection via TypeORM
- Each service has repository access
- Shared database with separate entities

## Authentication Flow

### JWT Authentication
```
Client → POST /auth/login
  ↓
Gateway validates credentials
  ↓
Users Service verifies user
  ↓
Gateway generates JWT tokens
  ↓
Client receives tokens
  ↓
Client uses in Authorization header
```

### API Key Authentication
```
Client → POST /auth/api-keys (with JWT)
  ↓
Gateway creates API key
  ↓
Users Service stores in database
  ↓
Client receives key (one-time)
  ↓
Client uses in x-api-key header
```

### OAuth2 (Google)
```
Client → GET /auth/google
  ↓
Redirect to Google
  ↓
User authenticates with Google
  ↓
Google → Callback with code
  ↓
Gateway exchanges code for user info
  ↓
Users Service creates/finds user
  ↓
Gateway generates JWT tokens
  ↓
Client receives tokens
```

## Security Layers

1. **Transport:** Docker internal network
2. **Authentication:** JWT, API Keys, OAuth2
3. **Authorization:** Role-based guards (admin/user)
4. **Validation:** DTOs with class-validator
5. **Secrets:** Environment variables
6. **Database:** Parameterized queries (TypeORM)

## Scalability Considerations

- **Horizontal Scaling:** Each microservice can scale independently
- **Load Balancing:** Gateway can be replicated behind load balancer
- **Database:** Can migrate to separate databases per service
- **Caching:** Redis can be added for sessions/cache
- **Message Queue:** Can add RabbitMQ/Kafka for async operations

## Technology Stack

- **Framework:** NestJS (Node.js)
- **Language:** TypeScript
- **Database:** PostgreSQL 16
- **ORM:** TypeORM
- **Transport:** TCP (microservices)
- **Authentication:** Passport.js (JWT, OAuth2, Custom)
- **Documentation:** Swagger/OpenAPI
- **Container:** Docker & Docker Compose
- **Testing:** Jest
