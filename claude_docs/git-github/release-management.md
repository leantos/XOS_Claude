# Release Management Subagent

## Overview
The Release Management subagent automates the entire software release lifecycle, from version planning to deployment and post-release monitoring. It handles semantic versioning, changelog generation, release notes, and deployment coordination across multiple environments.

## Core Responsibilities

### 1. Version Management
- Semantic versioning (SemVer) enforcement
- Version bumping strategies (major, minor, patch)
- Pre-release and beta version handling
- Version validation and consistency checks

### 2. Changelog Generation
- Automated changelog creation from commit messages
- Release notes generation from pull requests
- Breaking changes identification and documentation
- Migration guide creation for major versions

### 3. Release Orchestration
- Multi-repository release coordination
- Environment-specific deployment sequences
- Rollback procedures and contingency planning
- Release approval workflows and gates

## Optimal Prompt Template

```
You are the Release Management Specialist 🚀

TASK: Manage release cycle for [PROJECT/VERSION] with these specifications:

VERSIONING STRATEGY:
- Scheme: [Semantic Versioning, CalVer, Custom]
- Current version: [x.y.z]
- Release type: [major, minor, patch, prerelease]
- Version validation: [automated checks, manual approval]

CHANGELOG REQUIREMENTS:
- Format: [Keep a Changelog, Conventional Commits, Custom]
- Sections: [Added, Changed, Deprecated, Removed, Fixed, Security]
- Audience: [developers, end users, both]
- Languages: [English, multiple languages]

RELEASE PROCESS:
1. Version Planning and Validation:
   - Analyze changes since last release
   - Determine appropriate version bump
   - Validate breaking changes documentation
   - Check dependency compatibility

2. Pre-Release Activities:
   - Generate changelog and release notes
   - Create release branch if needed
   - Run comprehensive test suites
   - Security and compliance scans

3. Release Execution:
   - Tag version in repositories
   - Build and package artifacts
   - Deploy to staging environments
   - Execute deployment to production

4. Post-Release Activities:
   - Monitor deployment health
   - Update documentation
   - Communicate release to stakeholders
   - Plan next release cycle

DELIVERABLES:
1. Version bump automation scripts
2. Changelog generation tooling
3. Release notes templates
4. Deployment coordination workflows
5. Rollback procedures documentation
6. Release metrics and monitoring
7. Stakeholder communication templates

INTEGRATION POINTS:
- Version Control: [Git tags, branch strategies]
- CI/CD Systems: [GitHub Actions, Jenkins, etc.]
- Package Registries: [NPM, NuGet, Docker Hub]
- Communication: [Slack, email, documentation]
- Monitoring: [Application metrics, error tracking]

QUALITY GATES:
- All tests must pass
- Security scans must be clean
- Performance benchmarks met
- Documentation updated
- Breaking changes documented

ERROR HANDLING:
- Failed deployment rollback procedures
- Version conflict resolution
- Communication failure protocols
- Emergency hotfix procedures

OUTPUT FORMAT:
Provide executable scripts, configuration files, and comprehensive runbooks for each release management component.
```

## Advanced Features

### Semantic Version Automation
```javascript
// semver-manager.js
class SemanticVersionManager {
  constructor(config) {
    this.config = config;
    this.conventionalCommits = require('conventional-commits-parser');
    this.semver = require('semver');
  }

  async analyzeChanges(since = 'latest') {
    const commits = await this.getCommitsSince(since);
    const analysis = {
      breaking: false,
      features: 0,
      fixes: 0,
      chores: 0,
      docs: 0
    };

    for (const commit of commits) {
      const parsed = this.conventionalCommits.sync(commit.message);
      
      if (parsed.notes.some(note => note.title === 'BREAKING CHANGE')) {
        analysis.breaking = true;
      }
      
      switch (parsed.type) {
        case 'feat': analysis.features++; break;
        case 'fix': analysis.fixes++; break;
        case 'chore': analysis.chores++; break;
        case 'docs': analysis.docs++; break;
      }
    }

    return analysis;
  }

  async suggestVersion(currentVersion, analysis) {
    if (analysis.breaking) {
      return semver.inc(currentVersion, 'major');
    } else if (analysis.features > 0) {
      return semver.inc(currentVersion, 'minor');
    } else if (analysis.fixes > 0) {
      return semver.inc(currentVersion, 'patch');
    } else {
      return currentVersion; // No release needed
    }
  }

  async validateVersion(version, options = {}) {
    const validations = [];

    // Semver format validation
    if (!semver.valid(version)) {
      validations.push({ type: 'error', message: 'Invalid semantic version format' });
    }

    // Check if version already exists
    const tags = await this.getExistingTags();
    if (tags.includes(version)) {
      validations.push({ type: 'error', message: 'Version already exists' });
    }

    // Check version progression
    const latestVersion = await this.getLatestVersion();
    if (semver.lte(version, latestVersion)) {
      validations.push({ 
        type: 'error', 
        message: `Version ${version} is not greater than latest ${latestVersion}` 
      });
    }

    return validations;
  }
}
```

### Changelog Generation
```typescript
// changelog-generator.ts
interface ChangelogConfig {
  format: 'keepachangelog' | 'conventional' | 'custom';
  sections: string[];
  includeCompare: boolean;
  includeDate: boolean;
  groupBy: 'type' | 'scope' | 'breaking';
}

class ChangelogGenerator {
  private config: ChangelogConfig;
  
  constructor(config: ChangelogConfig) {
    this.config = config;
  }

  async generateChangelog(from: string, to: string = 'HEAD'): Promise<string> {
    const commits = await this.getCommitRange(from, to);
    const grouped = this.groupCommits(commits);
    const version = await this.getVersionFromTag(to);
    
    return this.formatChangelog(version, grouped);
  }

  private groupCommits(commits: Commit[]): GroupedCommits {
    const groups = new Map<string, Commit[]>();
    
    for (const commit of commits) {
      const parsed = parseCommit(commit.message);
      let groupKey = 'Other';
      
      switch (parsed.type) {
        case 'feat':
          groupKey = 'Features';
          break;
        case 'fix':
          groupKey = 'Bug Fixes';
          break;
        case 'docs':
          groupKey = 'Documentation';
          break;
        case 'style':
          groupKey = 'Styles';
          break;
        case 'refactor':
          groupKey = 'Code Refactoring';
          break;
        case 'perf':
          groupKey = 'Performance Improvements';
          break;
        case 'test':
          groupKey = 'Tests';
          break;
        case 'chore':
          groupKey = 'Chores';
          break;
      }
      
      if (parsed.notes.some(note => note.title === 'BREAKING CHANGE')) {
        groupKey = 'BREAKING CHANGES';
      }
      
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(commit);
    }
    
    return groups;
  }

  private formatChangelog(version: string, groups: GroupedCommits): string {
    const date = new Date().toISOString().split('T')[0];
    let changelog = `## [${version}] - ${date}\n\n`;
    
    // Sort groups by priority
    const groupOrder = [
      'BREAKING CHANGES',
      'Features',
      'Bug Fixes',
      'Performance Improvements',
      'Code Refactoring',
      'Documentation',
      'Tests',
      'Chores',
      'Other'
    ];
    
    for (const groupName of groupOrder) {
      const commits = groups.get(groupName);
      if (!commits || commits.length === 0) continue;
      
      changelog += `### ${groupName}\n\n`;
      
      for (const commit of commits) {
        const parsed = parseCommit(commit.message);
        const scope = parsed.scope ? `**${parsed.scope}**: ` : '';
        const shortHash = commit.hash.substring(0, 7);
        
        changelog += `- ${scope}${parsed.description} ([${shortHash}](${commit.url}))\n`;
        
        // Add breaking change notes
        for (const note of parsed.notes) {
          if (note.title === 'BREAKING CHANGE') {
            changelog += `  - **BREAKING**: ${note.text}\n`;
          }
        }
      }
      
      changelog += '\n';
    }
    
    return changelog;
  }
}
```

### Release Orchestration
```yaml
# release-orchestrator.yml
release_pipeline:
  stages:
    - name: "preparation"
      jobs:
        - validate_version
        - analyze_changes
        - generate_changelog
        - run_tests
        - security_scan
    
    - name: "build"
      jobs:
        - build_artifacts
        - package_distributions
        - sign_packages
        - upload_to_staging
    
    - name: "deploy"
      environments:
        - name: "staging"
          approvals: []
          tests:
            - smoke_tests
            - integration_tests
        
        - name: "production"
          approvals: ["release-manager"]
          tests:
            - health_checks
            - monitoring_validation
    
    - name: "post-release"
      jobs:
        - update_documentation
        - notify_stakeholders
        - create_next_milestone
        - archive_artifacts

validation_rules:
  - name: "version_format"
    type: "regex"
    pattern: "^\\d+\\.\\d+\\.\\d+$"
  
  - name: "changelog_exists"
    type: "file"
    path: "CHANGELOG.md"
  
  - name: "tests_passing"
    type: "command"
    command: "npm test"
  
  - name: "no_security_vulnerabilities"
    type: "command"
    command: "npm audit --audit-level high"

rollback_procedures:
  - name: "database_rollback"
    steps:
      - restore_database_snapshot
      - run_rollback_migrations
  
  - name: "application_rollback"
    steps:
      - revert_to_previous_version
      - restart_services
      - validate_health_checks
  
  - name: "infrastructure_rollback"
    steps:
      - revert_infrastructure_changes
      - update_load_balancer_config
```

### Multi-Repository Coordination
```typescript
// multi-repo-release.ts
interface RepoConfig {
  name: string;
  path: string;
  dependencies: string[];
  releaseStrategy: 'independent' | 'synchronized';
  buildCommand: string;
  testCommand: string;
}

class MultiRepoReleaseManager {
  private repos: RepoConfig[];
  private releaseGraph: Map<string, string[]>;
  
  constructor(repos: RepoConfig[]) {
    this.repos = repos;
    this.releaseGraph = this.buildDependencyGraph();
  }

  async coordinated_release(version: string): Promise<ReleaseResult> {
    const releaseOrder = this.topologicalSort();
    const results = new Map<string, ReleaseResult>();
    
    try {
      // Phase 1: Preparation
      for (const repoName of releaseOrder) {
        await this.prepareRepository(repoName, version);
      }
      
      // Phase 2: Building
      for (const repoName of releaseOrder) {
        const result = await this.buildRepository(repoName, version);
        results.set(repoName, result);
        
        if (!result.success) {
          await this.rollbackRelease(releaseOrder, repoName);
          throw new Error(`Build failed for ${repoName}: ${result.error}`);
        }
      }
      
      // Phase 3: Testing
      await this.runIntegrationTests(releaseOrder);
      
      // Phase 4: Deployment
      for (const repoName of releaseOrder) {
        await this.deployRepository(repoName, version);
      }
      
      // Phase 5: Verification
      await this.verifyDeployment(releaseOrder);
      
      return { success: true, results };
      
    } catch (error) {
      await this.rollbackRelease(releaseOrder);
      throw error;
    }
  }

  private buildDependencyGraph(): Map<string, string[]> {
    const graph = new Map<string, string[]>();
    
    for (const repo of this.repos) {
      graph.set(repo.name, repo.dependencies);
    }
    
    return graph;
  }

  private topologicalSort(): string[] {
    const visited = new Set<string>();
    const result: string[] = [];
    
    const visit = (node: string) => {
      if (visited.has(node)) return;
      visited.add(node);
      
      const dependencies = this.releaseGraph.get(node) || [];
      for (const dep of dependencies) {
        visit(dep);
      }
      
      result.push(node);
    };
    
    for (const repo of this.repos) {
      visit(repo.name);
    }
    
    return result;
  }

  async createReleaseManifest(version: string): Promise<ReleaseManifest> {
    const manifest: ReleaseManifest = {
      version,
      timestamp: new Date().toISOString(),
      repositories: [],
      dependencies: {},
      checksums: {}
    };
    
    for (const repo of this.repos) {
      const repoInfo = {
        name: repo.name,
        version: await this.getRepoVersion(repo.name),
        commit: await this.getRepoCommit(repo.name),
        buildArtifacts: await this.getArtifactList(repo.name)
      };
      
      manifest.repositories.push(repoInfo);
    }
    
    return manifest;
  }
}
```

## Release Automation Scripts

### Version Bump Automation
```bash
#!/bin/bash
# bump-version.sh

set -e

CURRENT_VERSION=$(git describe --tags --abbrev=0 2>/dev/null || echo "0.0.0")
RELEASE_TYPE=${1:-patch}

echo "Current version: $CURRENT_VERSION"

# Validate release type
case $RELEASE_TYPE in
  major|minor|patch|premajor|preminor|prepatch|prerelease)
    ;;
  *)
    echo "Invalid release type: $RELEASE_TYPE"
    echo "Valid types: major, minor, patch, premajor, preminor, prepatch, prerelease"
    exit 1
    ;;
esac

# Calculate new version
if command -v npm >/dev/null 2>&1; then
    NEW_VERSION=$(npm version --no-git-tag-version $RELEASE_TYPE | sed 's/v//')
elif command -v python3 >/dev/null 2>&1; then
    NEW_VERSION=$(python3 -c "
import semantic_version
current = semantic_version.Version('$CURRENT_VERSION')
if '$RELEASE_TYPE' == 'major':
    new = current.next_major()
elif '$RELEASE_TYPE' == 'minor':
    new = current.next_minor()
else:
    new = current.next_patch()
print(str(new))
")
else
    echo "Error: npm or python3 required for version calculation"
    exit 1
fi

echo "New version: $NEW_VERSION"

# Confirm release
read -p "Proceed with release $NEW_VERSION? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Release cancelled"
    exit 1
fi

# Generate changelog
echo "Generating changelog..."
if [ -f "CHANGELOG.md" ]; then
    # Backup existing changelog
    cp CHANGELOG.md CHANGELOG.md.bak
    
    # Generate new entry
    cat > temp_changelog.md << EOF
# Changelog

## [$NEW_VERSION] - $(date +%Y-%m-%d)

$(git log --pretty=format:"- %s" ${CURRENT_VERSION}..HEAD)

EOF
    
    # Merge with existing changelog
    tail -n +2 CHANGELOG.md.bak >> temp_changelog.md
    mv temp_changelog.md CHANGELOG.md
    rm CHANGELOG.md.bak
else
    # Create new changelog
    cat > CHANGELOG.md << EOF
# Changelog

## [$NEW_VERSION] - $(date +%Y-%m-%d)

$(git log --pretty=format:"- %s" ${CURRENT_VERSION}..HEAD)
EOF
fi

# Update version in project files
echo "Updating version in project files..."

# Package.json
if [ -f "package.json" ]; then
    sed -i.bak "s/\"version\": \".*\"/\"version\": \"$NEW_VERSION\"/" package.json
    rm package.json.bak
fi

# .NET project files
find . -name "*.csproj" -exec sed -i.bak "s/<Version>.*<\/Version>/<Version>$NEW_VERSION<\/Version>/" {} \;
find . -name "*.csproj.bak" -delete

# Python setup.py
if [ -f "setup.py" ]; then
    sed -i.bak "s/version=['\"].*['\"]/version='$NEW_VERSION'/" setup.py
    rm setup.py.bak
fi

# Commit changes
git add .
git commit -m "chore(release): bump version to $NEW_VERSION"

# Create tag
git tag -a "v$NEW_VERSION" -m "Release version $NEW_VERSION"

echo "✅ Version bumped to $NEW_VERSION"
echo "📋 Next steps:"
echo "  1. Review changes: git show"
echo "  2. Push changes: git push origin main && git push origin v$NEW_VERSION"
echo "  3. Create GitHub release with the generated changelog"
```

### Automated Release Workflow
```bash
#!/bin/bash
# release-workflow.sh

set -e

VERSION=$1
ENVIRONMENT=${2:-production}

if [ -z "$VERSION" ]; then
    echo "Usage: $0 <version> [environment]"
    exit 1
fi

echo "🚀 Starting release workflow for version $VERSION to $ENVIRONMENT"

# Pre-release checks
echo "📋 Running pre-release checks..."

# Check if working directory is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Working directory is not clean"
    git status --short
    exit 1
fi

# Check if we're on the correct branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$ENVIRONMENT" = "production" ] && [ "$CURRENT_BRANCH" != "main" ]; then
    echo "❌ Production releases must be made from main branch"
    echo "Current branch: $CURRENT_BRANCH"
    exit 1
fi

# Run tests
echo "🧪 Running test suite..."
if ! npm test; then
    echo "❌ Tests failed"
    exit 1
fi

# Run linting
echo "🔍 Running code quality checks..."
if ! npm run lint; then
    echo "❌ Linting failed"
    exit 1
fi

# Security audit
echo "🔒 Running security audit..."
if ! npm audit --audit-level high; then
    echo "❌ Security vulnerabilities detected"
    exit 1
fi

# Build application
echo "🔨 Building application..."
if ! npm run build; then
    echo "❌ Build failed"
    exit 1
fi

# Create release package
echo "📦 Creating release package..."
tar -czf "release-$VERSION.tar.gz" dist/ package.json package-lock.json

# Calculate checksums
echo "🔢 Calculating checksums..."
sha256sum "release-$VERSION.tar.gz" > "release-$VERSION.sha256"

# Deploy to environment
echo "🚀 Deploying to $ENVIRONMENT..."
case $ENVIRONMENT in
    staging)
        # Deploy to staging
        echo "Deploying to staging environment..."
        # Add staging deployment commands here
        ;;
    production)
        # Deploy to production
        echo "Deploying to production environment..."
        # Add production deployment commands here
        
        # Create GitHub release
        if command -v gh >/dev/null 2>&1; then
            echo "Creating GitHub release..."
            gh release create "v$VERSION" \
                "release-$VERSION.tar.gz" \
                "release-$VERSION.sha256" \
                --title "Release $VERSION" \
                --notes-file CHANGELOG.md \
                --latest
        fi
        ;;
    *)
        echo "❌ Unknown environment: $ENVIRONMENT"
        exit 1
        ;;
esac

# Post-deployment verification
echo "✅ Running post-deployment verification..."

# Health check
if command -v curl >/dev/null 2>&1; then
    HEALTH_URL="https://${ENVIRONMENT}.example.com/health"
    if curl -f "$HEALTH_URL" >/dev/null 2>&1; then
        echo "✅ Health check passed"
    else
        echo "❌ Health check failed"
        exit 1
    fi
fi

# Send notifications
echo "📢 Sending release notifications..."
if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"🚀 Release $VERSION deployed to $ENVIRONMENT successfully!\"}" \
        "$SLACK_WEBHOOK_URL"
fi

echo "✅ Release $VERSION completed successfully!"
echo "🔗 Release URL: https://${ENVIRONMENT}.example.com"

# Cleanup
rm -f "release-$VERSION.tar.gz" "release-$VERSION.sha256"
```

This comprehensive Release Management system provides automated, reliable, and scalable release processes that ensure quality, security, and proper communication throughout the software delivery lifecycle.