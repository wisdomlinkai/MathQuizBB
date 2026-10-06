// AWS Cognito authentication for Math Champions
import { Amplify } from 'aws-amplify';
import { getCurrentUser, fetchAuthSession, signInWithRedirect, signOut as amplifySignOut } from 'aws-amplify/auth';

// Cognito configuration
const cognitoConfig = {
  userPoolId: 'ap-southeast-1_GBHJD77aF',
  userPoolClientId: '5ot2gj93pefpc2hj1l5mbugb5t',
  domain: 'eduq-games.auth.ap-southeast-1.amazoncognito.com',
  region: 'ap-southeast-1',
};

// OAuth configuration
const oauthConfig = {
  domain: cognitoConfig.domain,
  scope: ['email', 'openid', 'profile'],
  redirectSignIn: 'https://mathchampion.game.eduq-ai.com/',
  redirectSignOut: 'https://mathchampion.game.eduq-ai.com/',
  responseType: 'code',
};

// Configure Amplify
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: cognitoConfig.userPoolId,
      userPoolClientId: cognitoConfig.userPoolClientId,
      signUpVerificationMethod: 'code',
      loginWith: {
        oauth: oauthConfig,
      },
    },
  },
});

export interface AuthUser {
  userId: string;
  email: string;
  name: string;
}

// Get current authenticated user
export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const user = await getCurrentUser();
    const session = await fetchAuthSession();
    
    // Extract name from ID token if available
    const idToken = session.tokens?.idToken;
    const name = idToken?.payload?.name as string || 
                 idToken?.payload?.email?.split('@')[0] as string || 
                 'Player';
    
    return {
      userId: user.userId,
      email: idToken?.payload?.email as string || '',
      name,
    };
  } catch {
    return null;
  }
}

// Get access token for API calls
export async function getAccessToken(): Promise<string | null> {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.accessToken?.toString() || null;
  } catch {
    return null;
  }
}

// Sign in using Cognito hosted UI
export async function signIn() {
  await signInWithRedirect({
    provider: 'COGNITO',
  });
}

// Sign out
export async function signOut() {
  await amplifySignOut();
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  try {
    await getCurrentUser();
    return true;
  } catch {
    return false;
  }
}
