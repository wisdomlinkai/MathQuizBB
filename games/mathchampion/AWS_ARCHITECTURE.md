# Math Champions - AWS Architecture

## Overview

This document describes the AWS infrastructure architecture for the Math Champions game, a multiplayer math quiz game for Hong Kong students.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CloudFront (CDN)                            │
│                    Global Edge Locations                             │
│                  https://mathchampions.eduq.ai                      │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          S3 Bucket                                   │
│                    Static Website Hosting                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │  index   │  │   CSS    │  │    JS    │  │  Assets  │           │
│  │   .html  │  │  Files   │  │  Bundle  │  │  Images  │           │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘           │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                       Authentication Layer                           │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │              Amazon Cognito User Pool                          │ │
│  │         (OAuth 2.0 / Google / Facebook / Email)               │ │
│  │                                                                │ │
│  │  Features:                                                     │ │
│  │  - User registration and login                                 │ │
│  │  - Social login (Google, Facebook)                            │ │
│  │  - JWT token management                                        │ │
│  │  - MFA support                                                 │ │
│  │  - Password policies                                           │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            │ JWT Token
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      API Gateway (REST API)                          │
│                    https://api.mathchampions.eduq.ai                │
│                                                                     │
│  Endpoints:                                                         │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  GET    /leaderboard?stageId={id}&limit={n}                 │   │
│  │  POST   /leaderboard                                         │   │
│  │  GET    /leaderboard/rank?stageId={id}                      │   │
│  │  GET    /progress                                            │   │
│  │  PUT    /progress                                            │   │
│  │  GET    /achievements                                        │   │
│  │  POST   /achievements/unlock                                 │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Features:                                                          │
│  - CORS enabled                                                     │
│  - JWT authorization                                                │
│  - Request validation                                               │
│  - Rate limiting                                                    │
│  - Request/response transformation                                  │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       AWS Lambda Functions                           │
│                                                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐    │
│  │   leaderboard   │  │    progress     │  │  achievements   │    │
│  │    handler      │  │    handler      │  │    handler      │    │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘    │
│           │                    │                    │              │
│           └────────────────────┼────────────────────┘              │
│                                │                                   │
└────────────────────────────────┼───────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         DynamoDB Tables                              │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │                 UserProgressTable                              │ │
│  │  Partition Key: userId (S)                                     │ │
│  │  Attributes: stages, totalScore, achievements                  │ │
│  │  GSIs: ByScore, ByDate                                        │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │                 LeaderboardTable                               │ │
│  │  Partition Key: stageId (S)                                    │ │
│  │  Sort Key: score#timestamp (S)                                 │ │
│  │  Attributes: userId, userName, score, timeInSeconds            │ │
│  │  GSIs: GlobalByScore                                          │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │                 AchievementsTable                              │ │
│  │  Partition Key: userId (S)                                     │ │
│  │  Sort Key: achievementId (S)                                   │ │
│  │  Attributes: unlockedAt, progress                              │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Models

### UserProgress
```typescript
{
  userId: string;           // Cognito User ID
  stages: {
    [stageId: string]: {
      completed: boolean;
      bestScore: number;
      attempts: number;
      lastPlayed: string;
    };
  };
  totalScore: number;
  achievements: string[];
  createdAt: string;
  updatedAt: string;
}
```

### LeaderboardEntry
```typescript
{
  entryId: string;          // Unique entry ID
  userId: string;           // Cognito User ID
  userName: string;         // Display name
  stageId: string;          // Stage identifier
  score: number;            // Score achieved
  timeInSeconds: number;    // Time taken
  timestamp: string;        // ISO timestamp
  rank?: number;            // Calculated rank
}
```

### Achievement
```typescript
{
  id: string;               // Achievement ID
  name: string;             // Display name
  description: string;      // Achievement description
  iconUrl: string;          // Icon URL
  criteria: {               // Unlock criteria
    type: string;
    value: number;
  };
}
```

## Security

### Authentication Flow
1. User clicks "Login" → Redirects to Cognito Hosted UI
2. User authenticates with Google/Facebook/Email
3. Cognito returns authorization code to redirect URI
4. Frontend exchanges code for JWT tokens
5. JWT token stored in browser (localStorage/memory)
6. Token included in all API requests

### Authorization
- All API endpoints require valid JWT token
- Token validated by API Gateway Lambda authorizer
- User ID extracted from token for data access
- Users can only access their own data (except leaderboard)

### Network Security
- HTTPS only (TLS 1.2+)
- WAF enabled on CloudFront
- Rate limiting (100 requests/minute per IP)
- Geographic restrictions (optional)
- CORS configured for specific origins

## Scalability

### Auto-Scaling
- **Lambda**: Automatic scaling based on requests
- **DynamoDB**: On-demand capacity mode
- **CloudFront**: Global edge locations
- **API Gateway**: Automatic throttling

### Performance
- **CloudFront**: <50ms latency for static assets
- **DynamoDB**: Single-digit millisecond reads
- **Lambda**: Cold start <100ms (Node.js 18)
- **API Gateway**: <10ms overhead

## Monitoring

### CloudWatch Metrics
- API Gateway: Request count, latency, errors
- Lambda: Invocations, duration, errors
- DynamoDB: Read/write capacity, throttling
- CloudFront: Requests, bandwidth, errors

### CloudWatch Logs
- Lambda function logs
- API Gateway access logs
- CloudFront access logs (optional)

### Alarms
- API Gateway 5XX errors > 1%
- Lambda errors > 0.1%
- DynamoDB throttling events
- CloudFront origin errors

## Cost Optimization

### Monthly Cost Estimate (10,000 DAU)
- Cognito: $0 (Free tier: 50,000 MAU)
- API Gateway: ~$3.50 (1M requests)
- Lambda: ~$2.00 (1M invocations)
- DynamoDB: ~$15.00 (On-demand)
- CloudFront: ~$5.00 (10GB transfer)
- S3: ~$1.00 (5GB storage)
- WAF: ~$5.00 (Web ACL)

**Total**: ~$30-35/month

### Cost Reduction Strategies
1. Use CloudFront for caching
2. Enable DynamoDB auto-scaling
3. Optimize Lambda memory/timeout
4. Use S3 Intelligent-Tiering
5. Reserved capacity for predictable traffic

## Disaster Recovery

### Backup Strategy
- DynamoDB: Point-in-time recovery enabled
- S3: Versioning enabled
- Lambda: Source code in Git
- CloudFormation: Infrastructure as Code

### RTO/RPO
- RTO (Recovery Time Objective): <1 hour
- RPO (Recovery Point Objective): <5 minutes (DynamoDB PITR)

### Multi-Region (Optional)
- DynamoDB Global Tables
- CloudFront (global by default)
- Route 53 health checks
- Active-passive failover

## CI/CD Pipeline

### Development Workflow
```
Feature Branch → Pull Request → Review → Merge to Main
                                              ↓
                                        GitHub Actions
                                              ↓
                                    ┌─────────┴─────────┐
                                    │                   │
                              Build Frontend      Deploy CDK Stack
                                    │                   │
                              Run Tests           Update Lambda
                                    │                   │
                              Upload to S3        Run Integration Tests
```

### Deployment Strategy
- Blue/Green deployments for Lambda
- CloudFront cache invalidation
- Zero-downtime deployments
- Automatic rollback on errors

## Compliance

### Data Protection
- Data encrypted at rest (KMS)
- Data encrypted in transit (TLS 1.2+)
- User data isolation
- GDPR-compliant data handling

### Access Control
- IAM roles for service-to-service
- Least privilege principle
- CloudTrail for audit logging
- Regular security reviews

## Future Enhancements

### Phase 2 Features
1. Real-time multiplayer with API Gateway WebSocket
2. Push notifications with Amazon SNS/Pinpoint
3. User analytics with Amazon Pinpoint
4. Machine learning for personalized difficulty
5. Voice commands with Amazon Lex

### Phase 3 Features
1. Tournament system
2. Team battles
3. Global leaderboards
4. Achievement sharing
5. Social features

## Support & Maintenance

### Monitoring Dashboard
- CloudWatch dashboard for all services
- Custom metrics for business KPIs
- Alert notifications via SNS

### Runbook
- Common issues and resolutions
- Escalation procedures
- Contact information
- Maintenance windows
