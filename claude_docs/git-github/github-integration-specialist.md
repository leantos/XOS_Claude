# GitHub Integration Specialist Subagent

## Overview
The GitHub Integration Specialist is a dedicated subagent for automating GitHub platform operations, API integrations, and project management workflows. It handles GitHub-specific features like repositories, pull requests, issues, projects, and organizational management.

## Core Responsibilities

### 1. Repository Management
- Repository creation, configuration, and maintenance
- Branch protection rules and access controls
- Repository settings and webhook configuration
- Multi-repository coordination and synchronization

### 2. Pull Request Automation
- Automated PR creation, review, and merging
- PR template management and enforcement
- Review assignment and approval workflows
- Conflict detection and resolution assistance

### 3. Issue & Project Management
- Issue lifecycle automation (creation, labeling, assignment)
- Project board management and card automation
- Milestone tracking and release planning
- Cross-repository issue linking and dependencies

### 4. GitHub API Integration
- RESTful API operations and GraphQL queries
- Webhook processing and event handling
- Rate limiting and error handling
- Authentication and permission management

## Optimal Prompt Template

```
You are the GitHub Integration Specialist 🐙

TASK: Implement GitHub automation for [REPOSITORY/ORGANIZATION] with these requirements:

REPOSITORY CONFIGURATION:
- Repository settings: [public/private, features enabled]
- Branch protection: [required reviews, status checks, admin enforcement]
- Access controls: [teams, collaborators, permissions]
- Webhook endpoints: [CI/CD, notifications, integrations]

API INTEGRATION REQUIREMENTS:
- Authentication: [Personal tokens, GitHub Apps, OAuth]
- Rate limiting: [requests per hour, caching strategy]
- Error handling: [retry logic, fallback mechanisms]
- Data synchronization: [real-time, batch processing]

WORKFLOW AUTOMATION:
1. Pull Request Management:
   - Auto-creation from feature branches
   - Review assignment based on code ownership
   - Automated testing and status checks
   - Merge strategies and branch cleanup

2. Issue Management:
   - Auto-labeling based on content analysis
   - Assignment to appropriate team members
   - Project board card creation and movement
   - Cross-reference linking and dependencies

3. Project Coordination:
   - Milestone creation and tracking
   - Release planning and coordination
   - Cross-repository synchronization
   - Team notification and communication

DELIVERABLES:
1. GitHub API client configuration
2. Webhook handlers for event processing
3. Automated workflows for PR/issue management
4. Repository configuration templates
5. Team and permission management scripts
6. Integration documentation and runbooks
7. Monitoring and alerting setup

INTEGRATION POINTS:
- External Tools: [Jira, Slack, Discord, Teams]
- CI/CD Systems: [GitHub Actions, Jenkins, CircleCI]
- Project Management: [GitHub Projects, external tools]
- Communication: [Email, chat platforms, notifications]

SECURITY CONSIDERATIONS:
- Token management and rotation
- Webhook signature verification
- Access control and permissions
- Audit logging and compliance

ERROR HANDLING:
- API rate limit management
- Network failure recovery
- Invalid webhook payload handling
- Permission denied scenarios

OUTPUT FORMAT:
Provide working code examples, API configurations, and comprehensive documentation for each integration component.
```

## Advanced Features

### Repository Automation
```yaml
repository_templates:
  new_project:
    description: "Template for new projects"
    private: false
    has_issues: true
    has_projects: true
    has_wiki: false
    auto_init: true
    gitignore_template: "Node"
    license_template: "mit"
    
    branch_protection:
      main:
        required_status_checks:
          strict: true
          contexts: ["ci/build", "ci/test"]
        enforce_admins: false
        required_pull_request_reviews:
          required_approving_review_count: 2
          dismiss_stale_reviews: true
          require_code_owner_reviews: true
        restrictions:
          users: []
          teams: ["core-team"]

webhook_configuration:
  endpoints:
    - url: "https://api.company.com/github/webhook"
      events: ["push", "pull_request", "issues"]
      secret: "${WEBHOOK_SECRET}"
      active: true
```

### Pull Request Automation
```typescript
interface PRAutomationConfig {
  templates: {
    feature: {
      title: string;
      body: string;
      labels: string[];
      assignees: string[];
      reviewers: string[];
    };
  };
  
  auto_merge: {
    enabled: boolean;
    required_checks: string[];
    required_reviews: number;
    strategy: 'merge' | 'squash' | 'rebase';
  };
  
  review_assignment: {
    algorithm: 'round-robin' | 'load-balanced' | 'code-owners';
    team_reviewers: string[];
    skip_draft: boolean;
  };
}

// Example automation workflow
const prAutomation = {
  onPROpened: async (pr: PullRequest) => {
    // Auto-assign reviewers based on changed files
    const reviewers = await getCodeOwners(pr.changed_files);
    await assignReviewers(pr.number, reviewers);
    
    // Add labels based on PR content
    const labels = await analyzeLabels(pr.title, pr.body);
    await addLabels(pr.number, labels);
    
    // Create project card
    await createProjectCard(pr);
  },
  
  onReviewSubmitted: async (review: Review) => {
    if (review.state === 'approved' && await allChecksPass(review.pr)) {
      await autoMerge(review.pr);
    }
  }
};
```

### Issue Management System
```javascript
class IssueAutomation {
  constructor(github, config) {
    this.github = github;
    this.config = config;
  }
  
  async onIssueOpened(issue) {
    // Auto-label based on content analysis
    const labels = await this.analyzeIssueContent(issue);
    await this.github.issues.addLabels({
      issue_number: issue.number,
      labels: labels
    });
    
    // Auto-assign based on component
    const assignee = await this.getComponentOwner(issue);
    if (assignee) {
      await this.github.issues.addAssignees({
        issue_number: issue.number,
        assignees: [assignee]
      });
    }
    
    // Create project card
    await this.addToProjectBoard(issue);
    
    // Send notifications
    await this.notifyTeam(issue, 'new_issue');
  }
  
  async triageIssues() {
    const issues = await this.getUntriagedIssues();
    
    for (const issue of issues) {
      const priority = await this.analyzePriority(issue);
      const category = await this.categorizeIssue(issue);
      
      await this.github.issues.update({
        issue_number: issue.number,
        labels: [...issue.labels, priority, category]
      });
    }
  }
}
```

### Project Board Integration
```yaml
project_automation:
  board_columns:
    - name: "Backlog"
      automation: "to_do"
    - name: "In Progress"
      automation: "in_progress"
    - name: "Review"
      automation: "in_review"
    - name: "Done"
      automation: "done"
  
  card_movement_rules:
    - trigger: "pr_opened"
      from: "In Progress"
      to: "Review"
    - trigger: "pr_merged"
      from: "Review"
      to: "Done"
    - trigger: "issue_closed"
      from: "*"
      to: "Done"
  
  automation_triggers:
    - event: "issues.assigned"
      action: "move_to_in_progress"
    - event: "pull_request.opened"
      action: "create_review_card"
    - event: "pull_request.closed"
      action: "archive_cards"
```

## API Integration Examples

### GitHub GraphQL Client
```typescript
import { Octokit } from "@octokit/rest";
import { graphql } from "@octokit/graphql";

class GitHubClient {
  private octokit: Octokit;
  private graphqlClient: typeof graphql;
  
  constructor(auth: string) {
    this.octokit = new Octokit({ auth });
    this.graphqlClient = graphql.defaults({
      headers: { authorization: `token ${auth}` }
    });
  }
  
  async getRepositoryInfo(owner: string, name: string) {
    const query = `
      query($owner: String!, $name: String!) {
        repository(owner: $owner, name: $name) {
          id
          name
          description
          stargazerCount
          forkCount
          pullRequests(states: OPEN) {
            totalCount
          }
          issues(states: OPEN) {
            totalCount
          }
          releases(first: 5) {
            nodes {
              name
              tagName
              publishedAt
            }
          }
        }
      }
    `;
    
    return await this.graphqlClient(query, { owner, name });
  }
  
  async bulkUpdateIssues(issues: Array<{number: number, labels: string[]}>) {
    const mutations = issues.map((issue, index) => ({
      query: `
        mutation UpdateIssue${index}($issueId: ID!, $labelIds: [ID!]!) {
          updateIssue(input: {id: $issueId, labelIds: $labelIds}) {
            issue {
              id
              number
            }
          }
        }
      `,
      variables: {
        issueId: issue.id,
        labelIds: issue.labels
      }
    }));
    
    // Execute mutations in batches to avoid rate limits
    return await this.executeMutationBatch(mutations);
  }
}
```

### Webhook Processing
```typescript
import { createHmac } from 'crypto';
import express from 'express';

class WebhookProcessor {
  private app: express.Application;
  private secret: string;
  
  constructor(secret: string) {
    this.app = express();
    this.secret = secret;
    this.setupRoutes();
  }
  
  private verifySignature(payload: string, signature: string): boolean {
    const hmac = createHmac('sha256', this.secret);
    hmac.update(payload, 'utf8');
    const calculatedSignature = `sha256=${hmac.digest('hex')}`;
    return signature === calculatedSignature;
  }
  
  private setupRoutes() {
    this.app.use(express.raw({ type: 'application/json' }));
    
    this.app.post('/webhook', async (req, res) => {
      const signature = req.headers['x-hub-signature-256'] as string;
      const payload = req.body.toString('utf8');
      
      if (!this.verifySignature(payload, signature)) {
        return res.status(403).send('Invalid signature');
      }
      
      const event = req.headers['x-github-event'] as string;
      const data = JSON.parse(payload);
      
      try {
        await this.processEvent(event, data);
        res.status(200).send('OK');
      } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).send('Internal Server Error');
      }
    });
  }
  
  private async processEvent(event: string, data: any) {
    switch (event) {
      case 'push':
        await this.handlePushEvent(data);
        break;
      case 'pull_request':
        await this.handlePullRequestEvent(data);
        break;
      case 'issues':
        await this.handleIssueEvent(data);
        break;
      case 'release':
        await this.handleReleaseEvent(data);
        break;
      default:
        console.log(`Unhandled event: ${event}`);
    }
  }
}
```

### Multi-Repository Coordination
```typescript
class MultiRepoManager {
  private repos: string[];
  private github: GitHubClient;
  
  constructor(repos: string[], github: GitHubClient) {
    this.repos = repos;
    this.github = github;
  }
  
  async syncLabels() {
    const masterRepo = this.repos[0];
    const masterLabels = await this.github.getLabels(masterRepo);
    
    for (const repo of this.repos.slice(1)) {
      await this.github.syncLabels(repo, masterLabels);
    }
  }
  
  async createCrossRepoIssue(title: string, body: string, repos: string[]) {
    const issues = [];
    
    for (const repo of repos) {
      const issue = await this.github.createIssue(repo, {
        title: `[Cross-repo] ${title}`,
        body: `${body}\n\nRelated issues: ${issues.map(i => `${i.repo}#${i.number}`).join(', ')}`
      });
      
      issues.push({ repo, number: issue.number });
    }
    
    // Link all issues together
    for (const issue of issues) {
      const otherIssues = issues.filter(i => i !== issue);
      await this.github.addComment(issue.repo, issue.number, 
        `Related issues: ${otherIssues.map(i => `${i.repo}#${i.number}`).join(', ')}`
      );
    }
    
    return issues;
  }
  
  async coordinateRelease(version: string) {
    const releaseData = {
      tag_name: version,
      name: `Release ${version}`,
      body: await this.generateReleaseNotes(version)
    };
    
    const releases = [];
    for (const repo of this.repos) {
      const release = await this.github.createRelease(repo, releaseData);
      releases.push({ repo, release });
    }
    
    return releases;
  }
}
```

## Integration Patterns

### GitHub Apps Integration
```typescript
import { App } from "@octokit/app";

class GitHubAppIntegration {
  private app: App;
  
  constructor(appId: string, privateKey: string) {
    this.app = new App({
      appId,
      privateKey,
    });
  }
  
  async installationHandler(installationId: number) {
    const octokit = await this.app.getInstallationOctokit(installationId);
    
    // Get repositories for this installation
    const { data: repositories } = await octokit.apps.listReposAccessibleToInstallation();
    
    // Setup automation for each repository
    for (const repo of repositories.repositories) {
      await this.setupRepositoryAutomation(octokit, repo);
    }
  }
  
  private async setupRepositoryAutomation(octokit: any, repo: any) {
    // Setup branch protection
    await this.setupBranchProtection(octokit, repo);
    
    // Create initial labels if they don't exist
    await this.setupLabels(octokit, repo);
    
    // Setup project boards
    await this.setupProjectBoards(octokit, repo);
    
    // Configure issue templates
    await this.setupIssueTemplates(octokit, repo);
  }
}
```

### Slack Integration
```typescript
class SlackGitHubIntegration {
  private slack: WebClient;
  private github: GitHubClient;
  
  async onPullRequestOpened(pr: PullRequest) {
    const message = {
      channel: '#development',
      text: `New Pull Request: ${pr.title}`,
      attachments: [{
        color: 'good',
        fields: [
          { title: 'Repository', value: pr.base.repo.full_name, short: true },
          { title: 'Author', value: pr.user.login, short: true },
          { title: 'Changes', value: `+${pr.additions} -${pr.deletions}`, short: true }
        ],
        actions: [{
          type: 'button',
          text: 'View PR',
          url: pr.html_url
        }]
      }]
    };
    
    await this.slack.chat.postMessage(message);
  }
  
  async onIssueOpened(issue: Issue) {
    if (issue.labels.some(label => label.name === 'critical')) {
      await this.slack.chat.postMessage({
        channel: '#alerts',
        text: `🚨 Critical Issue: ${issue.title}`,
        attachments: [{
          color: 'danger',
          text: issue.body,
          fields: [
            { title: 'Repository', value: issue.repository.full_name },
            { title: 'Reporter', value: issue.user.login }
          ]
        }]
      });
    }
  }
}
```

## Best Practices

### API Usage Optimization
1. **Rate Limiting**: Implement exponential backoff and request batching
2. **Caching**: Cache frequently accessed data to reduce API calls
3. **GraphQL**: Use GraphQL for complex queries to reduce round trips
4. **Webhooks**: Prefer webhooks over polling for real-time updates

### Security & Compliance
1. **Token Management**: Use short-lived tokens and proper rotation
2. **Webhook Security**: Always verify webhook signatures
3. **Access Controls**: Implement least-privilege access patterns
4. **Audit Logging**: Log all automated actions for compliance

### Error Handling & Reliability
1. **Retry Logic**: Implement intelligent retry for transient failures
2. **Circuit Breakers**: Prevent cascade failures in integrations
3. **Monitoring**: Track API usage, error rates, and performance
4. **Fallback**: Provide manual fallback options for critical operations

This GitHub Integration Specialist provides comprehensive automation for GitHub platform operations while maintaining security, reliability, and team productivity.