import {
  Horizon,
  TransactionBuilder,
  Operation,
  Asset,
  BASE_FEE,
  StrKey,
  Account,
  NotFoundError,
} from '@stellar/stellar-sdk';

// The Stellar testnet uses its own network passphrase to differentiate
// transactions from mainnet. Every transaction must include this to be valid.
export const STELLAR_NETWORK = {
  networkPassphrase: 'Test SDF Network ; September 2015',
  horizonUrl: 'https://horizon-testnet.stellar.org',
  friendbotUrl: 'https://friendbot.stellar.org',
} as const;

/// The minimum XLM required to create a new account (2 × base reserve).
export const MINIMUM_ACCOUNT_CREATION = 1;

// Horizon is the REST API that indexes the Stellar ledger.
// The Server class provides methods to query accounts, submit transactions, etc.
export const server = new Horizon.Server(STELLAR_NETWORK.horizonUrl);

// StrKey is used for validating Stellar public/secret keys.
// BASE_FEE is the minimum transaction fee (100 stroops = 0.00001 XLM).
export { StrKey, BASE_FEE, NotFoundError };

// Builds a signed XDR (serialized) payment transaction string.
// Stellar uses sequence numbers to prevent replay attacks — every transaction
// must include the current sequence number of the source account, and each
// transaction bumps the sequence number by 1.
export function buildPaymentTransaction(
  sourcePublicKey: string,
  sequenceNumber: string,
  destination: string,
  amount: string,
): string {
  const sourceAccount = new Account(sourcePublicKey, sequenceNumber);

  const transaction = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: STELLAR_NETWORK.networkPassphrase,
  })
    .addOperation(
      Operation.payment({
        destination,
        asset: Asset.native(), // XLM — the native asset of the Stellar network
        amount,
      }),
    )
    .setTimeout(30)
    .build();

  return transaction.toXDR();
}

/// Builds a signed XDR transaction that creates a new Stellar account and funds
/// it with the starting balance in a single operation.
export function buildCreateAccountTransaction(
  sourcePublicKey: string,
  sequenceNumber: string,
  destination: string,
  startingBalance: string,
): string {
  const sourceAccount = new Account(sourcePublicKey, sequenceNumber);

  const transaction = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: STELLAR_NETWORK.networkPassphrase,
  })
    .addOperation(
      Operation.createAccount({
        destination,
        startingBalance,
      }),
    )
    .setTimeout(30)
    .build();

  return transaction.toXDR();
}

interface HasBalances {
  balances: { asset_type: string; balance: string }[];
}

// Extracts the native XLM balance from an account record.
// Accounts can hold multiple assets (via trustlines); the native XLM balance
// is always identified by asset_type === 'native'.
export function parseBalance(account: HasBalances): string {
  const nativeBalance = account.balances.find(
    (b) => b.asset_type === 'native',
  );
  return nativeBalance ? nativeBalance.balance : '0';
}

export function formatBalance(balance: string): string {
  const num = parseFloat(balance);
  if (num === 0) return '0.0000';
  if (num < 0.0001) return num.toFixed(6);
  if (num < 1) return num.toFixed(4);
  if (num < 10000) return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
