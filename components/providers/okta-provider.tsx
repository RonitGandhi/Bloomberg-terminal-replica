'use client';

import React from 'react';
import { Security } from '@okta/okta-react';
import { OktaAuth, toRelativeUrl } from '@okta/okta-auth-js';
import { useRouter } from 'next/navigation';
import { oktaConfig } from '@/lib/okta-config';

const oktaAuth = new OktaAuth(oktaConfig);

export const OktaProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  const restoreOriginalUri = async (_oktaAuth: any, originalUri: string) => {
    router.replace(toRelativeUrl(originalUri || '/', window.location.origin));
  };

  return (
    <Security oktaAuth={oktaAuth} restoreOriginalUri={restoreOriginalUri}>
      {children}
    </Security>
  );
};
