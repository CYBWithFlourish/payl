'use client';

import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  publicKey: string | null;
  isConnecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
};

function truncateKey(key: string): string {
  if (key.length <= 8) return key;
  return `${key.slice(0, 4)}…${key.slice(-4)}`;
}

export default function Header({ publicKey, isConnecting, onConnect, onDisconnect }: Props) {
  const { mode, cycle, resolved } = useTheme();

  return (
    <header className="border-b border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900 transition-colors">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Payl</h1>
          <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:ring-amber-700/40">
            Testnet
          </span>
          <button
            onClick={cycle}
            className="ml-1 rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 dark:text-gray-500 dark:hover:bg-gray-800"
            title={`Theme: ${mode}`}
          >
            {mode === 'light' && <Sun size={16} />}
            {mode === 'dark' && <Moon size={16} />}
            {mode === 'system' && <Monitor size={16} />}
          </button>
        </div>

        <div>
          {publicKey ? (
            <div className="flex items-center gap-3">
              <code className="rounded-lg bg-gray-50 px-3 py-1.5 text-sm font-mono text-gray-600 ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700">
                {truncateKey(publicKey)}
              </code>
              <button
                onClick={onDisconnect}
                className="rounded-full px-4 py-1.5 text-sm font-medium text-gray-500 ring-1 ring-gray-200 transition-colors hover:bg-gray-50 hover:text-gray-700 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={onConnect}
              disabled={isConnecting}
              className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isConnecting ? 'Connecting…' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
