# Husky and SonarQube Configuration

This project uses Husky for Git hooks and SonarQube for code quality analysis.

## Husky - Pre-commit Hooks

Husky is configured to run automatically before each commit to ensure code quality.

### What runs on pre-commit:
- **Lint-staged**: Runs ESLint and Prettier on staged files
- **Tests**: Runs all unit tests to ensure nothing is broken

### Configuration files:
- `.husky/pre-commit` - Pre-commit hook script
- `package.json` - lint-staged configuration

### Skip hooks (not recommended):
```bash
git commit --no-verify -m "your message"
```

## SonarQube - Code Quality Analysis

SonarQube analyzes code quality, security vulnerabilities, and technical debt.

### Requirements:
1. **SonarQube Server** running (local or remote)
2. **Authentication token** from SonarQube server

### Setup:

#### Option 1: Local SonarQube Server
```bash
# Run SonarQube with Docker
docker run -d --name sonarqube -p 9000:9000 sonarqube:latest

# Access: http://localhost:9000
# Default credentials: admin/admin
```

#### Option 2: SonarCloud (Cloud-based)
1. Go to https://sonarcloud.io
2. Sign in with GitHub
3. Import your repository
4. Get your organization key and token

### Configuration:

Edit `sonar-project.properties` and set:
```properties
sonar.host.url=http://localhost:9000
sonar.token=YOUR_SONARQUBE_TOKEN
```

For SonarCloud:
```properties
sonar.host.url=https://sonarcloud.io
sonar.organization=your-org-key
sonar.token=YOUR_SONARCLOUD_TOKEN
```

### Run Analysis:

```bash
# Generate coverage first
npm run test:cov

# Run SonarQube analysis
npm run sonar
```

### What SonarQube analyzes:
- ✅ Code smells and maintainability
- ✅ Security vulnerabilities
- ✅ Code coverage (from Jest)
- ✅ Code duplication
- ✅ Bugs and potential issues
- ✅ Technical debt

### Exclusions:
The following are excluded from analysis:
- `node_modules/`
- `dist/`
- `coverage/`
- Test files (`*.spec.ts`, `*.e2e-spec.ts`)
- DTOs, entities, interfaces, and module files

## CI/CD Integration

### GitHub Actions example:
```yaml
- name: Run tests with coverage
  run: npm run test:cov

- name: SonarQube Scan
  uses: SonarSource/sonarqube-scan-action@master
  env:
    SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
    SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
```

## Troubleshooting

### Husky not working:
```bash
# Reinstall husky
npm run prepare
```

### SonarQube connection issues:
1. Verify SonarQube server is running
2. Check token is valid
3. Verify network connectivity
4. Check sonar-project.properties configuration

### Skip quality checks temporarily:
```bash
# Skip pre-commit hooks (not recommended)
git commit --no-verify

# Skip SonarQube quality gate (use with caution)
# Add to sonar-project.properties:
# sonar.qualitygate.wait=false
```
