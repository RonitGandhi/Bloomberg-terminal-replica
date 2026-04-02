export const oktaConfig = {
  issuer: process.env.NEXT_PUBLIC_OKTA_ISSUER || '',
  clientId: process.env.NEXT_PUBLIC_OKTA_CLIENT_ID || '',
  redirectUri: typeof window !== 'undefined' ? `${window.location.origin}/login/callback` : '',
  scopes: ['openid', 'profile', 'email'],
  pkce: true,
};
