'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { isConnected, requestAccess } from '@stellar/freighter-api';

const STORAGE_KEY = 'payl_wallet_pk';
const REQUEST_TIMEOUT = 5000;

type AccessResult = { address: string; error?: unknown };

async function requestAccessWithTimeout(): Promise<AccessResult> {
  const result = await Promise.race([
    requestAccess(),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Wallet did not respond. Please make sure Freighter is unlocked and try again.')), REQUEST_TIMEOUT),
    ),
  ]);
  return result as AccessResult;
}

export function useWallet() {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  const verifyAndRestore = useCallback(async () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    try {
      const conn = await isConnected();
      if (conn.isConnected) {
        const { address, error: addrErr } = await requestAccessWithTimeout();
        if (address && !addrErr) {
          setPublicKey(address);
          return;
        }
      }
    } catch {
      // freighter might not respond
    }
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  useEffect(() => {
    verifyAndRestore();
  }, [verifyAndRestore]);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const conn = await isConnected();
      if (!conn.isConnected) {
        setError('FREIGHTER_NOT_FOUND');
        return;
      }

      const { address, error: addrErr } = await requestAccessWithTimeout();
      if (addrErr) {
        const msg =
          typeof addrErr === 'string'
            ? addrErr
            : typeof addrErr === 'object' && addrErr !== null && 'message' in addrErr
              ? String((addrErr as { message: unknown }).message)
              : 'Connection declined.';
        if (mountedRef.current) setError(msg);
        return;
      }
      if (!address) {
        if (mountedRef.current) setError('No public key returned from wallet');
        return;
      }
      setPublicKey(address);
      localStorage.setItem(STORAGE_KEY, address);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to connect wallet';
      if (mountedRef.current) setError(msg);
    } finally {
      if (mountedRef.current) setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setPublicKey(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { publicKey, isConnecting, error, connect, disconnect };
}
