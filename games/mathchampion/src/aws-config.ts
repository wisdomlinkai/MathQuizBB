// AWS Configuration for Math Champions
// Production values are hardcoded for Amplify deployment

export const awsConfig = {
  // Amazon Cognito Configuration
  cognito: {
    userPoolId: 'ap-southeast-1_GBHJD77aF',
    userPoolClientId: '5ot2gj93pefpc2hj1l5mbugb5t',
    domain: 'eduq-games.auth.ap-southeast-1.amazoncognito.com',
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
  // Enable/disable AWS backend sync
  useAwsBackend: true,
  
  // Enable/disable offline mode
  offlineMode: false,
  
  // Enable/disable analytics
  analytics: false,
};

