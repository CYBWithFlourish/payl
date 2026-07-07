'use client';

import { RefreshCw } from 'lucide-react';
import { formatBalance } from '@/lib/stellar';

type Props = {
  balance: string;
  loading: boolean;
  notFound: boolean;
  onRefresh: () => void;
  onFund: () => void;
};

export function BalanceSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8">
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-24 rounded bg-gray-100 dark:bg-gray-800" />
        <div className="h-10 w-48 rounded bg-gray-100 dark:bg-gray-800" />
        <div className="h-4 w-32 rounded bg-gray-100 dark:bg-gray-800" />
      </div>
    </div>
  );
}

export default function BalanceCard({ balance, loading, notFound, onRefresh, onFund }: Props) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Your Balance</p>
          <p className="mt-1 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            {formatBalance(balance)}
          </p>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">XLM</p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600 disabled:opacity-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          title="Refresh balance"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      {notFound && (
        <div className="mt-6 rounded-xl bg-amber-50 p-4 ring-1 ring-amber-100 dark:bg-amber-900/20 dark:ring-amber-800/30">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
            This account hasn&apos;t been funded on testnet yet.
          </p>
          <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
            Use the button below to request free test XLM from the Friendbot faucet.
          </p>
          <button
            onClick={onFund}
            disabled={loading}
            className="mt-3 rounded-full bg-amber-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Funding…' : 'Fund with Friendbot'}
          </button>
        </div>
      )}
    </div>
  );
}
