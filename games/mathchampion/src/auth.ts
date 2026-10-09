// AWS Cognito authentication for Math Champions
// Uses the main EduQ AI User Pool for shared authentication
import { Amplify } from 'aws-amplify';
import { getCurrentUser, fetchAuthSession, signInWithRedirect, signOut as amplifySignOut } from 'aws-amplify/auth';

// Determine redirect URLs based on environment
const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
const redirectUrl = isLocalhost ? 'http://localhost:5173/' : 'https://mathchampion.game.eduq-ai.com/';

// EduQ AI Cognito configuration (shared with main platform)
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'ap-southeast-1_ISUlRZfpp',
      userPoolClientId: '2ool529f04qgucriv7bqtbqpoh',
      loginWith: {
        oauth: {
          domain: 'eduq-ai-gen2.auth.ap-southeast-1.amazoncognito.com',
          scopes: ['email', 'openid', 'profile', 'aws.cognito.signin.user.admin'],
          redirectSignIn: [redirectUrl],
          redirectSignOut: [redirectUrl],
          responseType: 'code', // Use code flow with PKCE (Amplify v6 handles PKCE automatically)
        },
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
    
    // Try multiple sources for the name
    let name = 'Player';
    
    // 1. Check if name is in the token payload
    if (idToken?.payload?.name) {
      name = idToken.payload.name as string;
    }
    // 2. Check if there's a custom attribute for name
    else if (idToken?.payload?.['custom:name']) {
      name = idToken.payload['custom:name'] as string;
    }
    // 3. Try to get from Cognito attributes
    else if (idToken?.payload?.given_name) {
      const givenName = idToken.payload.given_name as string;
      const familyName = idToken?.payload?.family_name as string;
      name = familyName ? `${givenName} ${familyName}` : givenName;
    }
    // 4. Fallback to email username
    else if (idToken?.payload?.email) {
      const email = idToken.payload.email as string;
      name = email.split('@')[0];
    }
    
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
  await signInWithRedirect();
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
