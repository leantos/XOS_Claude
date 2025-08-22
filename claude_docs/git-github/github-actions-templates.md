# GitHub Actions Templates

## Overview
This document provides comprehensive GitHub Actions workflow templates for common CI/CD scenarios, automated testing, deployment, and repository management. Each template is production-ready and follows GitHub Actions best practices.

## Core Workflow Templates

### Basic CI/CD Pipeline
```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
    tags: ['v*']
  pull_request:
    branches: [main, develop]

env:
  NODE_VERSION: '18.x'
  DOTNET_VERSION: '8.0.x'

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [16.x, 18.x, 20.x]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint

      - name: Run type checking
        run: npm run type-check

      - name: Run tests
        run: npm test -- --coverage

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        if: matrix.node-version == '18.x'
        with:
          token: ${{ secrets.CODECOV_TOKEN }}

  build:
    runs-on: ubuntu-latest
    needs: test
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-files
          path: dist/

  deploy-staging:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/develop'
    environment: staging
    
    steps:
      - name: Download artifacts
        uses: actions/download-artifact@v4
        with:
          name: build-files

      - name: Deploy to staging
        run: |
          echo "Deploying to staging environment"
          # Add deployment commands here

  deploy-production:
    runs-on: ubuntu-latest
    needs: build
    if: startsWith(github.ref, 'refs/tags/v')
    environment: production
    
    steps:
      - name: Download artifacts
        uses: actions/download-artifact@v4
        with:
          name: build-files

      - name: Deploy to production
        run: |
          echo "Deploying to production environment"
          # Add deployment commands here
```

### .NET Core Pipeline
```yaml
# .github/workflows/dotnet.yml
name: .NET Core CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  DOTNET_VERSION: '8.0.x'

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: testdb
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: ${{ env.DOTNET_VERSION }}

      - name: Restore dependencies
        run: dotnet restore

      - name: Build solution
        run: dotnet build --no-restore --configuration Release

      - name: Run unit tests
        run: dotnet test --no-build --configuration Release --logger trx --collect:"XPlat Code Coverage"

      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-results
          path: "**/*.trx"

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: ${{ env.DOTNET_VERSION }}

      - name: Restore dependencies
        run: dotnet restore

      - name: Security audit
        run: dotnet list package --vulnerable --include-transitive

      - name: Run CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: csharp

      - name: Autobuild
        uses: github/codeql-action/autobuild@v3

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3

  docker-build:
    runs-on: ubuntu-latest
    needs: [test, security-scan]
    if: github.event_name == 'push'
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/${{ github.repository }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=sha

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### Frontend Testing & Deployment
```yaml
# .github/workflows/frontend.yml
name: Frontend CI/CD

on:
  push:
    branches: [main, develop]
    paths: ['frontend/**', '.github/workflows/frontend.yml']
  pull_request:
    branches: [main, develop]
    paths: ['frontend/**']

defaults:
  run:
    working-directory: ./frontend

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18.x'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Run Prettier check
        run: npm run format:check

      - name: Run type checking
        run: npm run type-check

      - name: Run unit tests
        run: npm test -- --coverage --watchAll=false

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./frontend/coverage/lcov.info
          flags: frontend

  e2e-tests:
    runs-on: ubuntu-latest
    needs: lint-and-test
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18.x'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Build application
        run: npm run build

      - name: Start server
        run: npm run preview &

      - name: Wait for server
        run: npx wait-on http://localhost:4173

      - name: Run Playwright tests
        run: npx playwright test

      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: frontend/playwright-report/

  build-and-deploy:
    runs-on: ubuntu-latest
    needs: [lint-and-test, e2e-tests]
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18.x'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Build for production
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.PRODUCTION_API_URL }}

      - name: Deploy to S3
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Upload to S3
        run: |
          aws s3 sync dist/ s3://${{ secrets.S3_BUCKET }} --delete
          aws cloudfront create-invalidation --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} --paths "/*"
```

## Specialized Workflows

### Dependency Management
```yaml
# .github/workflows/dependency-update.yml
name: Dependency Updates

on:
  schedule:
    - cron: '0 0 * * 1' # Weekly on Monday
  workflow_dispatch:

jobs:
  update-dependencies:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18.x'
          cache: 'npm'

      - name: Update dependencies
        run: |
          npm update
          npx npm-check-updates -u
          npm install

      - name: Run tests
        run: npm test

      - name: Create Pull Request
        uses: peter-evans/create-pull-request@v5
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          commit-message: 'chore: update dependencies'
          title: 'Automated dependency updates'
          body: |
            This PR contains automated dependency updates.
            
            Please review the changes and ensure all tests pass before merging.
          branch: automated/dependency-updates
          delete-branch: true

  security-audit:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18.x'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run security audit
        run: npm audit --audit-level high

      - name: Check for vulnerabilities
        run: |
          if npm audit --audit-level high --json | jq '.vulnerabilities | length' | grep -q '^0$'; then
            echo "No high-severity vulnerabilities found"
          else
            echo "High-severity vulnerabilities detected"
            npm audit --audit-level high
            exit 1
          fi
```

### Release Management
```yaml
# .github/workflows/release.yml
name: Release Management

on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      release-type:
        description: 'Release type'
        required: true
        default: 'patch'
        type: choice
        options:
          - patch
          - minor
          - major

jobs:
  create-release:
    runs-on: ubuntu-latest
    if: github.event_name == 'workflow_dispatch'
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18.x'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Configure Git
        run: |
          git config --global user.name 'github-actions[bot]'
          git config --global user.email 'github-actions[bot]@users.noreply.github.com'

      - name: Generate changelog
        id: changelog
        run: |
          npm install -g conventional-changelog-cli
          conventional-changelog -p angular -i CHANGELOG.md -s -r 0
          echo "changelog<<EOF" >> $GITHUB_OUTPUT
          conventional-changelog -p angular -r 1 >> $GITHUB_OUTPUT
          echo "EOF" >> $GITHUB_OUTPUT

      - name: Bump version
        id: version
        run: |
          NEW_VERSION=$(npm version ${{ github.event.inputs.release-type }} --no-git-tag-version)
          echo "version=${NEW_VERSION}" >> $GITHUB_OUTPUT

      - name: Update version in files
        run: |
          # Update version in additional files if needed
          sed -i "s/\"version\": \".*\"/\"version\": \"${{ steps.version.outputs.version }}\"/g" package.json

      - name: Commit changes
        run: |
          git add .
          git commit -m "chore(release): ${{ steps.version.outputs.version }}"
          git tag ${{ steps.version.outputs.version }}

      - name: Push changes
        run: |
          git push origin main
          git push origin ${{ steps.version.outputs.version }}

      - name: Create GitHub Release
        uses: actions/create-release@v1
        with:
          tag_name: ${{ steps.version.outputs.version }}
          release_name: Release ${{ steps.version.outputs.version }}
          body: ${{ steps.changelog.outputs.changelog }}
          draft: false
          prerelease: false
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  auto-release:
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18.x'

      - name: Install semantic-release
        run: npm install -g semantic-release @semantic-release/changelog @semantic-release/git

      - name: Release
        run: semantic-release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Code Quality & Security
```yaml
# .github/workflows/quality-security.yml
name: Code Quality & Security

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  schedule:
    - cron: '0 0 * * 0' # Weekly security scan

jobs:
  code-quality:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18.x'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint with SARIF output
        run: |
          npx eslint . --format @microsoft/eslint-formatter-sarif --output-file eslint-results.sarif
        continue-on-error: true

      - name: Upload SARIF file
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: eslint-results.sarif

      - name: SonarCloud Scan
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}

  security-scan:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: 'trivy-results.sarif'

      - name: OWASP ZAP Scan
        uses: zaproxy/action-full-scan@v0.8.0
        with:
          target: 'https://your-staging-url.com'
          rules_file_name: '.zap/rules.tsv'
          cmd_options: '-a'

  performance-audit:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18.x'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build

      - name: Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          configPath: './lighthouserc.json'
          uploadArtifacts: true
          temporaryPublicStorage: true
```

## Reusable Workflows

### Shared Workflow Template
```yaml
# .github/workflows/reusable-test.yml
name: Reusable Test Workflow

on:
  workflow_call:
    inputs:
      node-version:
        required: false
        type: string
        default: '18.x'
      working-directory:
        required: false
        type: string
        default: '.'
    secrets:
      codecov-token:
        required: false

jobs:
  test:
    runs-on: ubuntu-latest
    
    defaults:
      run:
        working-directory: ${{ inputs.working-directory }}
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ inputs.node-version }}
          cache: 'npm'
          cache-dependency-path: ${{ inputs.working-directory }}/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test -- --coverage

      - name: Upload coverage
        if: secrets.codecov-token
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.codecov-token }}
          directory: ${{ inputs.working-directory }}
```

### Using Reusable Workflow
```yaml
# .github/workflows/main.yml
name: Main CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  frontend-tests:
    uses: ./.github/workflows/reusable-test.yml
    with:
      node-version: '18.x'
      working-directory: './frontend'
    secrets:
      codecov-token: ${{ secrets.CODECOV_TOKEN }}

  backend-tests:
    uses: ./.github/workflows/reusable-test.yml
    with:
      node-version: '18.x'
      working-directory: './backend'
    secrets:
      codecov-token: ${{ secrets.CODECOV_TOKEN }}
```

## Advanced Patterns

### Matrix Builds with Dynamic Configuration
```yaml
# .github/workflows/matrix-dynamic.yml
name: Dynamic Matrix Build

on:
  push:
    branches: [main]

jobs:
  detect-changes:
    runs-on: ubuntu-latest
    outputs:
      frontend-changed: ${{ steps.changes.outputs.frontend }}
      backend-changed: ${{ steps.changes.outputs.backend }}
      matrix: ${{ steps.set-matrix.outputs.matrix }}
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Detect changes
        uses: dorny/paths-filter@v2
        id: changes
        with:
          filters: |
            frontend:
              - 'frontend/**'
            backend:
              - 'backend/**'

      - name: Set matrix
        id: set-matrix
        run: |
          if [ "${{ steps.changes.outputs.frontend }}" == "true" ]; then
            MATRIX='{"include":[{"project":"frontend","directory":"./frontend","test-command":"npm test"}]}'
          fi
          
          if [ "${{ steps.changes.outputs.backend }}" == "true" ]; then
            if [ -n "$MATRIX" ]; then
              MATRIX=$(echo $MATRIX | jq '.include += [{"project":"backend","directory":"./backend","test-command":"dotnet test"}]')
            else
              MATRIX='{"include":[{"project":"backend","directory":"./backend","test-command":"dotnet test"}]}'
            fi
          fi
          
          echo "matrix=${MATRIX:-'{}'}" >> $GITHUB_OUTPUT

  test:
    runs-on: ubuntu-latest
    needs: detect-changes
    if: needs.detect-changes.outputs.matrix != '{}'
    
    strategy:
      matrix: ${{ fromJson(needs.detect-changes.outputs.matrix) }}
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Test ${{ matrix.project }}
        working-directory: ${{ matrix.directory }}
        run: ${{ matrix.test-command }}
```

### Environment-Specific Deployments
```yaml
# .github/workflows/environment-deploy.yml
name: Environment Deployment

on:
  push:
    branches: [main, develop, staging]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        include:
          - branch: develop
            environment: development
            url: https://dev.example.com
          - branch: staging
            environment: staging
            url: https://staging.example.com
          - branch: main
            environment: production
            url: https://example.com
    
    if: github.ref == format('refs/heads/{0}', matrix.branch)
    environment:
      name: ${{ matrix.environment }}
      url: ${{ matrix.url }}
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Deploy to ${{ matrix.environment }}
        run: |
          echo "Deploying to ${{ matrix.environment }}"
          echo "URL: ${{ matrix.url }}"
          # Add deployment commands here

      - name: Run health check
        run: |
          curl -f ${{ matrix.url }}/health || exit 1
```

These GitHub Actions templates provide comprehensive CI/CD automation for modern development workflows, covering testing, security, deployment, and maintenance tasks with best practices and security considerations built in.