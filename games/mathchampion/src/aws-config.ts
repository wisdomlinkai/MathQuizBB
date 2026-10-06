// AWS Configuration for Math Champions
// These values are set after deploying the CDK stacks

export const awsConfig = {
  // Amazon Cognito Configuration
  cognito: {
    // Replace with your User Pool ID from CDK output
    userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || 'us-east-1_XXXXXXXXX',
    
    // Replace with your User Pool Client ID from CDK output
    userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || 'xxxxxxxxxxxxxxxxxxxxxxxx',
    
    // Replace with your Cognito domain from CDK output
    domain: import.meta.env.VITE_COGNITO_DOMAIN || 'math-champions.auth.us-east-1.amazoncognito.com',
    
    // AWS Region
    region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
  },

  // API Gateway Configuration
  api: {
    // Replace with your API URL from CDK output
    baseUrl: import.meta.env.VITE_API_URL || 'https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod',
  },

  // CloudFront/S3 Configuration (for static hosting)
  cloudfront: {
    // Replace with your CloudFront URL from CDK output
    url: import.meta.env.VITE_CLOUDFRONT_URL || 'https://xxxxxxxxxxxx.cloudfront.net',
  },
};

// OAuth Configuration for Cognito
export const oauthConfig = {
  domain: awsConfig.cognito.domain,
  scope: ['email', 'profile', 'openid'],
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
  useAwsBackend: import.meta.env.VITE_USE_AWS_BACKEND === 'true',
  
  // Enable/disable offline mode
  offlineMode: import.meta.env.VITE_OFFLINE_MODE === 'true',
  
  // Enable/disable analytics
  analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
};

// Validate configuration
export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!awsConfig.cognito.userPoolId || awsConfig.cognito.userPoolId === 'us-east-1_XXXXXXXXX') {
    errors.push('Cognito User Pool ID not configured. Set VITE_COGNITO_USER_POOL_ID environment variable.');
  }

  if (!awsConfig.cognito.userPoolClientId || awsConfig.cognito.userPoolClientId === 'xxxxxxxxxxxxxxxxxxxxxxxx') {
    errors.push('Cognito User Pool Client ID not configured. Set VITE_COGNITO_CLIENT_ID environment variable.');
  }

  if (!awsConfig.api.baseUrl || awsConfig.api.baseUrl.includes('xxxxxxxxxx')) {
    errors.push('API Gateway URL not configured. Set VITE_API_URL environment variable.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
