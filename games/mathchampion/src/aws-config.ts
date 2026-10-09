// AWS Configuration for Math Champions
// Uses EduQ AI shared infrastructure (Cognito + AppSync + DynamoDB)

export const awsConfig = {
  // Amazon Cognito Configuration (EduQ AI shared pool)
  cognito: {
    userPoolId: 'ap-southeast-1_ISUlRZfpp',
    userPoolClientId: '2ool529f04qgucriv7bqtbqpoh',
    domain: 'eduq-ai-gen2.auth.ap-southeast-1.amazoncognito.com',
    region: 'ap-southeast-1',
  },

  // AppSync GraphQL API (shared with main EduQ AI platform)
  appSync: {
    endpoint: 'https://due4h2licvclxcoxwqut7kzcve.appsync-api.ap-southeast-1.amazonaws.com/graphql',
    apiKey: 'da2-nqsvtcgt6bfrjgnwp6ec4x6s34',
    region: 'ap-southeast-1',
  },

  // API Gateway Configuration (DEPRECATED - using AppSync instead)
  api: {
    baseUrl: '', // Not used - MathChampion uses AppSync GraphQL
  },
};

// OAuth Configuration for Cognito
export const oauthConfig = {
  domain: awsConfig.cognito.domain,
  scope: ['email', 'openid', 'profile', 'aws.cognito.signin.user.admin'],
  redirectSignIn: typeof window !== 'undefined' 
    ? `${window.location.origin}/`
    : 'http://localhost:5173/',
  redirectSignOut: typeof window !== 'undefined'
    ? `${window.location.origin}/`
    : 'http://localhost:5173/',
  responseType: 'code',
};

// Feature flags for AWS integration
export const features = {
  useAwsBackend: true,
  offlineMode: false,
  analytics: false,
};
