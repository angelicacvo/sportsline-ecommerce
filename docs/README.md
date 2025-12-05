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

- **[Quality Tools](QUALITY_TOOLS.md)** - Code quality and Git hooks
- Husky pre-commit hooks, SonarQube/SonarCloud configuration

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
├── .env                         # Environment variables
└── docs/
    ├── README.md               # This file
    ├── GETTING_STARTED.md      # Setup guide
    ├── ARCHITECTURE.md         # System architecture
    ├── TESTING.md              # Testing procedures
    └── QUALITY_TOOLS.md        # Husky & SonarQube
```

## 🔍 Find What You Need

| I want to... | Read this |
|--------------|-----------|
| Install and run the project | [Getting Started](GETTING_STARTED.md) |
| Understand the architecture | [Architecture](ARCHITECTURE.md) |
| Test the API | [Testing](TESTING.md) |
| Setup code quality tools | [Quality Tools](QUALITY_TOOLS.md) |
| Use Swagger UI | <http://localhost:3000/docs> |

## 💡 Contributing

When adding new documentation:

1. Keep it concise and focused
2. Use code examples
3. Update this index
4. Follow existing formatting
