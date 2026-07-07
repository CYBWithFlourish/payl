'use client';

import { CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { TxResult } from '@/hooks/useSendPayment';

type Props = {
  result: TxResult;
  onDismiss: () => void;
  publicKey?: string | null;
};

function truncateKey(key: string): string {
  if (key.length <= 8) return key;
  return `${key.slice(0, 4)}…${key.slice(-4)}`;
}

export default function TransactionResult({ result, onDismiss, publicKey }: Props) {
  if (result.status === 'idle' || result.status === 'building' || result.status === 'awaiting_signature' || result.status === 'submitting') return null;

  if (result.status === 'success') {
    const fromKey = result.source || publicKey || '';
    const toKey = result.destination || '';

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-2xl border border-emerald-100 bg-white p-6 shadow-xl dark:border-emerald-900/50 dark:bg-gray-900 sm:p-8">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
              <CheckCircle2 size={28} className="text-emerald-600 dark:text-emerald-400" />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Payment Successful!</h2>

            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Your transaction of{' '}
              <span className="font-semibold text-gray-900 dark:text-white">
                {result.amount ?? ''} XLM
              </span>{' '}
              from{' '}
              <span className="font-mono text-xs font-medium text-gray-700 dark:text-gray-300">
                {truncateKey(fromKey)}
              </span>{' '}
              to{' '}
              <span className="font-mono text-xs font-medium text-gray-700 dark:text-gray-300">
                {truncateKey(toKey)}
              </span>{' '}
              is confirmed on the Stellar testnet.
            </p>

            {result.hash && (
              <a
                href={`https://stellar.expert/explorer/testnet/tx/${result.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-5 py-2.5 text-sm font-medium text-indigo-700 ring-1 ring-indigo-200 transition-all hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:ring-indigo-800/40 dark:hover:bg-indigo-900/50"
              >
                View Transaction on Stellar Expert
                <ExternalLink size={16} />
              </a>
            )}

            <p className="mt-3 text-xs text-gray-400 font-mono break-all dark:text-gray-500">{result.hash}</p>

            <button
              onClick={onDismiss}
              className="mt-6 w-full rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-500"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-red-100 bg-red-50 p-6 shadow-sm dark:border-red-900/50 dark:bg-red-950/30 sm:p-8">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
          <XCircle size={20} className="text-red-600 dark:text-red-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-red-900 dark:text-red-300">Payment failed</p>
          <p className="mt-1 text-sm text-red-700 dark:text-red-400">{result.error}</p>
          <button
            onClick={onDismiss}
            className="mt-3 rounded-full bg-red-100 px-4 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300 dark:hover:bg-red-900/60"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
