'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { TxStatus } from '@/hooks/useSendPayment';

type Props = {
  balance: string;
  sending: boolean;
  status: TxStatus;
  onSend: (destination: string, amount: string) => void;
};

export default function SendForm({ balance, sending, onSend }: Props) {
  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState('');

  const balanceNum = parseFloat(balance) || 0;
  const maxSendable = Math.max(0, balanceNum - 0.5);

  const handleMax = () => {
    setAmount(maxSendable > 0 ? maxSendable.toFixed(4) : '0');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim() || !amount) return;
    onSend(destination.trim(), amount);
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Send XLM</h2>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Available: {balanceNum.toFixed(4)} XLM
        {maxSendable > 0 && maxSendable < balanceNum && (
          <span className="text-gray-400 dark:text-gray-500"> ({maxSendable.toFixed(4)} spendable after reserve)</span>
        )}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label htmlFor="destination" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Recipient Address
          </label>
          <input
            id="destination"
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="GABC…WXYZ"
            className="mt-1 block w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 ring-1 ring-gray-200 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:ring-gray-700 dark:focus:border-indigo-400 dark:focus:ring-indigo-800"
            disabled={sending}
          />
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Amount (XLM)
          </label>
          <div className="relative mt-1">
            <input
              id="amount"
              type="number"
              step="0.0001"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="block w-full rounded-xl border border-gray-200 px-4 py-2.5 pr-16 text-sm text-gray-900 placeholder-gray-400 ring-1 ring-gray-200 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:ring-gray-700 dark:focus:border-indigo-400 dark:focus:ring-indigo-800"
              disabled={sending}
            />
            <button
              type="button"
              onClick={handleMax}
              disabled={sending || maxSendable <= 0}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2.5 py-1 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-indigo-400 dark:hover:bg-indigo-900/30"
            >
              Max
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={sending || !destination.trim() || !amount}
          className="flex w-full items-center justify-center rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sending ? (
            <span className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              Sending…
            </span>
          ) : (
            'Send'
          )}
        </button>
      </form>
    </div>
  );
}
