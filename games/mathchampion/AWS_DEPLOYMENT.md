# Math Champions - AWS Deployment Guide

This guide explains how to deploy the Math Champions game to AWS using the infrastructure defined in the CDK stacks.

## Prerequisites

1. **AWS CLI** installed and configured
   ```bash
   aws configure
   ```

2. **Node.js** 18+ and **npm** installed

3. **AWS CDK** installed globally
   ```bash
   npm install -g aws-cdk
   ```

4. **Docker** installed (for Lambda container builds)

## Architecture Overview

The game uses the following AWS services:

- **Amazon Cognito** - User authentication with OAuth (Google, Facebook, Email)
- **Amazon API Gateway** - REST API for game data
- **AWS Lambda** - Serverless API handlers
- **Amazon DynamoDB** - NoSQL database for:
  - User profiles and progress
  - Leaderboards
  - Achievements
- **Amazon CloudFront** - CDN for static assets
- **Amazon S3** - Static website hosting
- **AWS WAF** - Web application firewall
- **Amazon CloudWatch** - Logging and monitoring

## Deployment Steps

### 1. Clone and Install Dependencies

```bash
cd c:\MathQuizBB\infrastructure\aws
npm install
```

### 2. Bootstrap CDK (First Time Only)

```bash
cdk bootstrap aws://ACCOUNT_ID/REGION
```

Replace `ACCOUNT_ID` with your AWS account ID and `REGION` with your preferred region (e.g., `ap-southeast-1` for Hong Kong).

### 3. Configure OAuth Providers

Before deploying, you need to configure OAuth providers in Cognito:

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI: `https://your-domain.auth.REGION.amazoncognito.com/oauth2/idpresponse`

#### Facebook OAuth
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a Facebook App
3. Add Facebook Login product
4. Add redirect URI: `https://your-domain.auth.REGION.amazoncognito.com/oauth2/idpresponse`

### 4. Update Configuration

Edit `infrastructure/aws/config.ts` to set your OAuth provider credentials:

```typescript
export const config = {
  googleClientId: 'your-google-client-id',
  googleClientSecret: 'your-google-client-secret',  // Use AWS Secrets Manager
  facebookAppId: 'your-facebook-app-id',
  facebookAppSecret: 'your-facebook-app-secret',  // Use AWS Secrets Manager
  allowedOrigins: ['https://your-domain.com'],
};
```

**Important**: Store sensitive values in AWS Secrets Manager, don't hardcode them!

### 5. Deploy the Stack

```bash
cdk deploy --all
```

This will deploy:
- `MathChampionAuthStack` - Cognito User Pool
- `MathChampionDatabaseStack` - DynamoDB tables
- `MathChampionApiStack` - API Gateway and Lambda
- `MathChampionFrontendStack` - S3 and CloudFront

### 6. Get Deployment Outputs

After deployment, CDK will output important values:

```
MathChampionAuthStack.UserPoolId = us-east-1_XXXXXXXXX
MathChampionAuthStack.UserPoolClientId = xxxxxxxxxxxxxxxxxxxxxxxxxx
MathChampionAuthStack.CognitoDomain = your-domain.auth.us-east-1.amazoncognito.com
MathChampionApiStack.ApiUrl = https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod
MathChampionFrontendStack.CloudFrontUrl = https://xxxxxxxxxxxx.cloudfront.net
```

### 7. Update Frontend Configuration

Update `games/mathchampion/src/aws-config.ts` with the deployed values:

```typescript
export const awsConfig = {
  cognito: {
    userPoolId: 'us-east-1_XXXXXXXXX',
    userPoolClientId: 'xxxxxxxxxxxxxxxxxxxxxxxx',
    domain: 'your-domain.auth.us-east-1.amazoncognito.com',
    region: 'us-east-1',
  },
  api: {
    baseUrl: 'https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod',
  },
};
```

### 8. Build and Deploy Frontend

```bash
cd games/mathchampion
npm install
npm run build
```

Upload the `dist` folder to the S3 bucket:

```bash
aws s3 sync dist/ s3://your-bucket-name/ --delete
```

Or use the deployment script:

```bash
npm run deploy
```

## Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxx
VITE_COGNITO_DOMAIN=your-domain.auth.us-east-1.amazoncognito.com
VITE_API_URL=https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod
```

## Cost Estimate

Monthly costs for typical usage (Hong Kong region):

- **Cognito**: Free tier (50,000 MAUs)
- **API Gateway**: ~$1-5/month
- **Lambda**: ~$1-10/month
- **DynamoDB**: ~$5-15/month
- **CloudFront**: ~$1-5/month
- **S3**: ~$1-3/month
- **WAF**: ~$5-10/month

**Total**: ~$15-50/month for a small application

## Security Considerations

1. **Secrets Management**: Use AWS Secrets Manager for OAuth secrets
2. **WAF Rules**: Enabled by default to protect against common attacks
3. **CORS**: Configured to only allow your domain
4. **Authentication**: All API endpoints require authentication
5. **Rate Limiting**: Configured in WAF

## Monitoring

- **CloudWatch Logs**: Lambda function logs
- **CloudWatch Metrics**: API Gateway, Lambda, DynamoDB metrics
- **X-Ray**: Distributed tracing (optional)
- **CloudWatch Alarms**: Set up alerts for errors and latency

## Troubleshooting

### Cognito OAuth Not Working
- Check redirect URIs match exactly
- Verify OAuth credentials are correct
- Check Cognito domain is accessible

### API Returns 401 Unauthorized
- Verify token is being sent correctly
- Check token hasn't expired
- Verify Cognito User Pool configuration

### DynamoDB Errors
- Check IAM permissions for Lambda
- Verify table names in environment variables
- Check for throttling (increase capacity)

### CloudFront Not Updating
- Wait for cache invalidation (5-15 minutes)
- Force invalidation: `aws cloudfront create-invalidation`

## Useful Commands

```bash
# View stack status
cdk list

# View stack outputs
cdk synth

# Update a specific stack
cdk deploy MathChampionApiStack

# Destroy all stacks (WARNING: Deletes all data!)
cdk destroy --all

# View CloudFormation console
aws console cloudformation
```

## CI/CD Pipeline

To set up automated deployments:

1. Create a GitHub repository
2. Add AWS credentials to GitHub Secrets
3. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - run: npx cdk deploy --require-approval never
```

## Support

For issues or questions:
- AWS Documentation: https://docs.aws.amazon.com/
- CDK Documentation: https://docs.aws.amazon.com/cdk/
- Create an issue in the repository
