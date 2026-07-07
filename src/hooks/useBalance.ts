'use client';

import { useState, useCallback } from 'react';
import { server, parseBalance, NotFoundError } from '@/lib/stellar';

type BalanceState = {
  balance: string;
  loading: boolean;
  error: string | null;
  notFound: boolean;
};

export function useBalance() {
  const [state, setState] = useState<BalanceState>({
    balance: '0',
    loading: false,
    error: null,
    notFound: false,
  });

  const fetchBalance = useCallback(async (publicKey: string) => {
    setState((s) => ({ ...s, loading: true, error: null, notFound: false }));
    try {
      const account = await server.loadAccount(publicKey);
      const balance = parseBalance(account);
      setState({ balance, loading: false, error: null, notFound: false });
    } catch (err: unknown) {
      if (err instanceof NotFoundError) {
        setState({ balance: '0', loading: false, error: null, notFound: true });
      } else {
        const msg = err instanceof Error ? err.message : 'Failed to fetch balance';
        setState((s) => ({ ...s, loading: false, error: msg }));
      }
    }
  }, []);

  const fundWithFriendbot = useCallback(async (publicKey: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const response = await fetch(
        `https://friendbot.stellar.org?addr=${publicKey}`,
      );
      const data = await response.json();
      if (response.ok) {
        await fetchBalance(publicKey);
      } else {
        const detail = data.detail || data.title || 'Friendbot request failed';
        setState((s) => ({ ...s, loading: false, error: detail }));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fund account';
      setState((s) => ({ ...s, loading: false, error: msg }));
    }
  }, [fetchBalance]);

  return { ...state, fetchBalance, fundWithFriendbot };
}
