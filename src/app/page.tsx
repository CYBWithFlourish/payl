'use client';

import { useEffect, useCallback, useState } from 'react';
import { Wallet, AlertCircle, X } from 'lucide-react';
import Header from '@/components/Header';
import BalanceCard, { BalanceSkeleton } from '@/components/BalanceCard';
import SendForm from '@/components/SendForm';
import TransactionResult from '@/components/TransactionResult';
import { useWallet } from '@/hooks/useWallet';
import { useBalance } from '@/hooks/useBalance';
import { useSendPayment } from '@/hooks/useSendPayment';

type Toast = {
  type: 'error' | 'info';
  message: string;
};

export default function Home() {
  const { publicKey, isConnecting, error: walletError, connect, disconnect } = useWallet();
  const { balance, loading: balanceLoading, notFound, fetchBalance, fundWithFriendbot } = useBalance();
  const { result, sendPayment, reset } = useSendPayment();
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    if (publicKey) {
      fetchBalance(publicKey);
    }
  }, [publicKey, fetchBalance]);

  const handleConnect = useCallback(() => {
    setToast(null);
    connect();
  }, [connect]);

  useEffect(() => {
    if (walletError) {
      if (walletError === 'FREIGHTER_NOT_FOUND') {
        setToast({
          type: 'error',
          message: 'Freighter wallet not found. Please install the Freighter browser extension from freighter.app to continue.',
        });
      } else {
        setToast({ type: 'error', message: walletError });
      }
    }
  }, [walletError]);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  const handleSend = useCallback(
    (destination: string, amount: string) => {
      if (!publicKey) return;
      sendPayment(publicKey, destination, amount);
    },
    [publicKey, sendPayment],
  );

  const handleDismissResult = useCallback(() => {
    reset();
    if (publicKey) fetchBalance(publicKey);
  }, [reset, publicKey, fetchBalance]);

  const isSending =
    result.status === 'building' ||
    result.status === 'awaiting_signature' ||
    result.status === 'submitting';

  return (
    <>
      <Header
        publicKey={publicKey}
        isConnecting={isConnecting}
        onConnect={handleConnect}
        onDisconnect={disconnect}
      />

      {toast && (
        <div className="fixed top-4 right-4 left-4 z-50 mx-auto max-w-md sm:right-4 sm:left-auto">
          <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-white p-4 shadow-lg ring-1 ring-red-50 dark:border-red-900/50 dark:bg-gray-900 dark:ring-red-900/20">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
              <AlertCircle size={14} className="text-red-500 dark:text-red-400" />
            </div>
            <p className="flex-1 text-sm text-gray-700 dark:text-gray-300">{toast.message}</p>
            <button onClick={dismissToast} className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
        {publicKey ? (
          <>
            {balanceLoading && !notFound ? (
              <BalanceSkeleton />
            ) : (
              <BalanceCard
                balance={balance}
                loading={balanceLoading}
                notFound={notFound}
                onRefresh={() => fetchBalance(publicKey)}
                onFund={() => fundWithFriendbot(publicKey)}
              />
            )}
            <SendForm balance={balance} sending={isSending} status={result.status} onSend={handleSend} />
            <TransactionResult result={result} onDismiss={handleDismissResult} publicKey={publicKey} />
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-900/30">
                <Wallet size={28} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Connect Your Wallet</h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                Connect your Freighter wallet to send and receive XLM on the Stellar testnet.
              </p>
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="mt-6 rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isConnecting ? 'Connecting…' : 'Connect Wallet'}
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
