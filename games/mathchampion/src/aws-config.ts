// AWS Configuration for Math Champions
// Uses EduQ AI shared Cognito User Pool

export const awsConfig = {
  // Amazon Cognito Configuration (EduQ AI shared pool)
  cognito: {
    userPoolId: 'ap-southeast-1_ISUlRZfpp',
    userPoolClientId: '2ool529f04qgucriv7bqtbqpoh',
    domain: 'eduq-ai-gen2.auth.ap-southeast-1.amazoncognito.com',
    region: 'ap-southeast-1',
  },

  // API Gateway Configuration (placeholder for future use)
  api: {
    baseUrl: import.meta.env.VITE_API_URL || '',
  },
};

// OAuth Configuration for Cognito
export const oauthConfig = {
  domain: awsConfig.cognito.domain,
  scope: ['email', 'openid', 'profile'],
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
