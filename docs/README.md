# 📚 Documentation Index

Welcome to the Sportsline E-Commerce documentation!

## 📖 Available Guides

### Getting Started

- **[Getting Started](GETTING_STARTED.md)** - Installation, setup, and first steps
- Quick commands, prerequisites, and troubleshooting

### Core Documentation

- **[Architecture](ARCHITECTURE.md)** - System design, components, and data flow
- Microservices architecture, communication patterns, and tech stack

- **[Testing](TESTING.md)** - Testing procedures and verification
- Unit tests, E2E tests, authentication testing

### Authentication

- **[Authentication Guide](./AUTHENTICATION.md)** - Complete auth documentation
- JWT, API Keys, OAuth2, security best practices

## 🎯 Quick Links

**Development:**

- Gateway: <http://localhost:3000>
- Swagger UI: <http://localhost:3000/docs>

**Useful Commands:**

```bash
# Start services
docker compose up -d

# View logs
docker compose logs -f gateway

# Seed database
npm run seed

# Run tests
npm test
```

## 📝 Document Organization

```text
sportsline-ecommerce/
├── README.md                    # Project overview & quick start
└── docs/
    ├── README.md               # This file
    ├── GETTING_STARTED.md      # Setup guide
    ├── ARCHITECTURE.md         # System architecture
    ├── TESTING.md              # Testing procedures
```

## 🔍 Find What You Need

| I want to... | Read this |
|--------------|-----------|
| Install and run the project | [Getting Started](GETTING_STARTED.md) |
| Understand the architecture | [Architecture](ARCHITECTURE.md) |
| Test the API | [Testing](TESTING.md) |
| Use Swagger UI | <http://localhost:3000/docs> |
