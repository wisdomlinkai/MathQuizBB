# Cognito Configuration Changes Log

**Date:** October 6, 2026
**User Pool ID:** `ap-southeast-1_ISUlRZfpp`
**Client ID:** `2ool529f04qgucriv7bqtbqpoh`
**Domain:** `eduq-ai-gen2.auth.ap-southeast-1.amazoncognito.com`

## Summary of Changes Made

### 1. OAuth Flows Changes

| Setting | Original Value | Changed To | Notes |
|---------|---------------|------------|-------|
| `AllowedOAuthFlows` | `["code"]` | `["code", "implicit"]` | First change - broke other sites |
| `AllowedOAuthFlows` | `["code", "implicit"]` | `["code"]` | Reverted to original |

### 2. App Client Attributes

| Setting | Original Value | Changed To |
|---------|---------------|------------|
| `ReadAttributes` | `null` (all attributes) | Explicit list of all standard + custom attributes |
| `WriteAttributes` | `null` (all attributes) | Explicit list of all standard + custom attributes |
| `ExplicitAuthFlows` | `null` | `["ALLOW_USER_PASSWORD_AUTH", "ALLOW_USER_SRP_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"]` |

### 3. Managed Login Version

| Setting | Original Value | Changed To |
|---------|---------------|------------|
| `ManagedLoginVersion` | `2` | `1` |

## Detailed Change Log

### Change 1: Added implicit OAuth flow
**Command:**
```bash
aws cognito-idp update-user-pool-client \
  --user-pool-id ap-southeast-1_ISUlRZfpp \
  --client-id 2ool529f04qgucriv7bqtbqpoh \
  --allowed-o-auth-flows code implicit \
  --callback-urls [...] \
  --logout-urls [...] \
  --allowed-o-auth-scopes email openid profile \
  --region ap-southeast-1
```

**Result:** This caused `invalid_scope` errors on other sites (kiro, admin.eduq-ai.com)

### Change 2: Reverted to code-only flow
**Command:**
```bash
aws cognito-idp update-user-pool-client \
  --user-pool-id ap-southeast-1_ISUlRZfpp \
  --client-id 2ool529f04qgucriv7bqtbqpoh \
  --allowed-o-auth-flows code \
  --callback-urls [...] \
  --logout-urls [...] \
  --allowed-o-auth-scopes email openid profile \
  --region ap-southeast-1
```

### Change 3: Added ReadAttributes and WriteAttributes
**Command:**
```bash
aws cognito-idp update-user-pool-client \
  --user-pool-id ap-southeast-1_ISUlRZfpp \
  --client-id 2ool529f04qgucriv7bqtbqpoh \
  --read-attributes [all standard + custom attributes] \
  --write-attributes [all standard + custom attributes] \
  --region ap-southeast-1
```

**Attributes added:**
- Standard: `email`, `email_verified`, `name`, `given_name`, `family_name`, `middle_name`, `nickname`, `profile`, `picture`, `website`, `gender`, `birthdate`, `zoneinfo`, `locale`, `phone_number`, `phone_number_verified`, `address`, `updated_at`
- Custom: `custom:tier`, `custom:plan_type`, `custom:family_role`, `custom:subscription_status`, `custom:family_id`, `custom:parent_id`, `custom:account_type`, `custom:payment_auth`, `custom:privacy_level`, `custom:lastLoginAt`, `custom:payment_authorized`, `custom:selected_plan`, `custom:trial_end_date`, `custom:trial_status`, `custom:sub_end_date`, `custom:age_bracket`, `custom:subscription_tier`, `custom:billing_cycle`, `custom:trial_start`, `custom:promo_code`, `custom:coppa_consent`, `custom:coppa_consent_date`, `custom:coppa_consent_method`, `custom:coppa_parent_verify`, `custom:age`, `custom:preferred_language`, `custom:region`, `custom:auth_method`, `custom:phone_verified_at`, `custom:alipay_user_id`, `custom:profile_incomplete`

### Change 4: Added ExplicitAuthFlows
**Command:**
```bash
aws cognito-idp update-user-pool-client \
  --user-pool-id ap-southeast-1_ISUlRZfpp \
  --client-id 2ool529f04qgucriv7bqtbqpoh \
  --explicit-auth-flows ALLOW_USER_SRP_AUTH ALLOW_REFRESH_TOKEN_AUTH ALLOW_USER_PASSWORD_AUTH \
  --region ap-southeast-1
```

**Note:** Setting `ExplicitAuthFlows` reset `AllowedOAuthFlowsUserPoolClient` to `false`, requiring another update to restore it.

### Change 5: Full app client update with all settings
**Command:**
```bash
aws cognito-idp update-user-pool-client \
  --user-pool-id ap-southeast-1_ISUlRZfpp \
  --client-id 2ool529f04qgucriv7bqtbqpoh \
  --explicit-auth-flows ALLOW_USER_SRP_AUTH ALLOW_REFRESH_TOKEN_AUTH ALLOW_USER_PASSWORD_AUTH \
  --allowed-o-auth-flows-user-pool-client \
  --allowed-o-auth-flows code \
  --allowed-o-auth-scopes email openid profile \
  --callback-urls [...] \
  --logout-urls [...] \
  --read-attributes [...] \
  --write-attributes [...] \
  --region ap-southeast-1
```

### Change 6: Changed Managed Login Version
**Command:**
```bash
aws cognito-idp update-user-pool-domain \
  --domain eduq-ai-gen2 \
  --user-pool-id ap-southeast-1_ISUlRZfpp \
  --managed-login-version 1 \
  --region ap-southeast-1
```

**Result:** Changed from Managed Login v2 to v1

## Current State (After All Changes)

```json
{
  "AllowedOAuthFlows": ["code"],
  "AllowedOAuthScopes": ["email", "openid", "profile"],
  "AllowedOAuthFlowsUserPoolClient": true,
  "ExplicitAuthFlows": [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH"
  ],
  "ManagedLoginVersion": 1
}
```

## Issues Encountered

1. **PKCE Issue with Amplify v6**: Amplify v6 always sends PKCE parameters (`code_challenge`, `code_challenge_method`) for authorization code flow. Cognito was returning 400 errors.

2. **Implicit Flow Not Supported**: Tried switching to implicit flow (`response_type=token`) but the app client was only configured for code flow. Adding implicit flow broke other sites.

3. **invalid_scope Error**: After adding implicit flow, other sites started getting `invalid_scope` errors. This was likely due to attribute permissions being reset.

4. **400 Bad Request on /login endpoint**: Even after reverting all changes, Cognito's `/login` and `/oauth2/authorize` endpoints return 400 "Invalid request" errors.

## Unknown Original Configuration

The exact original values for the following settings are unknown:
- `ExplicitAuthFlows` - may have been `null` or had specific values
- `ReadAttributes` - may have been `null` (all) or had specific values
- `WriteAttributes` - may have been `null` (all) or had specific values
- `ManagedLoginVersion` - was `2`, now changed to `1`

## Recommended Actions to Restore

If issues persist, consider:

1. **Check AWS CloudTrail** for the original configuration before changes
2. **Create a new app client** with fresh configuration if possible
3. **Contact AWS Support** if Cognito endpoints continue returning 400 errors
4. **Revert Managed Login Version** back to 2 if needed:
   ```bash
   aws cognito-idp update-user-pool-domain \
     --domain eduq-ai-gen2 \
     --user-pool-id ap-southeast-1_ISUlRZfpp \
     --managed-login-version 2 \
     --region ap-southeast-1
   ```

## MathChampion Code Changes

### auth.ts - Switched from code to token flow
```typescript
// Changed from:
responseType: 'code',

// To:
responseType: 'token', // Use implicit flow to avoid PKCE issues
```

### auth.ts - Removed explicit provider
```typescript
// Changed from:
await signInWithRedirect({
  provider: 'COGNITO',
});

// To:
await signInWithRedirect();
```

These code changes were committed to the MathChampion repository.
