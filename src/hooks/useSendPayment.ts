'use client';

import { useState, useCallback } from 'react';
import { signTransaction } from '@stellar/freighter-api';
import { Transaction } from '@stellar/stellar-sdk';
import { server, buildPaymentTransaction, buildCreateAccountTransaction, StrKey, STELLAR_NETWORK, NotFoundError, MINIMUM_ACCOUNT_CREATION } from '@/lib/stellar';

export type TxStatus =
  | 'idle'
  | 'building'
  | 'awaiting_signature'
  | 'submitting'
  | 'success'
  | 'failed';

export type TxResult = {
  status: TxStatus;
  hash?: string;
  error?: string;
  source?: string;
  destination?: string;
  amount?: string;
};

export function useSendPayment() {
  const [result, setResult] = useState<TxResult>({ status: 'idle' });

  const sendPayment = useCallback(
    async (sourcePublicKey: string, destination: string, amount: string) => {
      setResult({ status: 'building' });
      try {
        if (!StrKey.isValidEd25519PublicKey(destination)) {
          setResult({
            status: 'failed',
            error: 'Invalid recipient address format. Please enter a valid Stellar public key starting with G.',
          });
          return;
        }

        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
          setResult({
            status: 'failed',
            error: 'Amount must be a positive number.',
          });
          return;
        }

        let sourceAccount: Awaited<ReturnType<typeof server.loadAccount>>;
        try {
          sourceAccount = await server.loadAccount(sourcePublicKey);
        } catch {
          setResult({
            status: 'failed',
            error: 'Source account not found on testnet. Please fund it first.',
          });
          return;
        }

        const nativeBalance = sourceAccount.balances.find(
          (b) => b.asset_type === 'native',
        );
        const availableBalance = nativeBalance
          ? parseFloat(nativeBalance.balance)
          : 0;

        const effectiveBalance = Math.max(0, availableBalance - 0.5);
        if (amountNum > effectiveBalance) {
          setResult({
            status: 'failed',
            error: `Insufficient balance. You have ${availableBalance.toFixed(2)} XLM but need at least ${(amountNum + 0.5).toFixed(2)} XLM (including reserve).`,
          });
          return;
        }

        setResult({ status: 'awaiting_signature' });

        let destinationExists = true;
        try {
          await server.loadAccount(destination);
        } catch (err: unknown) {
          if (err instanceof NotFoundError) {
            destinationExists = false;
          } else {
            throw err;
          }
        }

        let transactionXdr: string;
        if (destinationExists) {
          transactionXdr = buildPaymentTransaction(
            sourcePublicKey,
            sourceAccount.sequence,
            destination,
            amount,
          );
        } else {
          if (amountNum < MINIMUM_ACCOUNT_CREATION) {
            setResult({
              status: 'failed',
              error: `Destination account does not exist. New accounts need at least ${MINIMUM_ACCOUNT_CREATION} XLM to activate. Send at least ${MINIMUM_ACCOUNT_CREATION} XLM and the account will be created automatically.`,
            });
            return;
          }
          transactionXdr = buildCreateAccountTransaction(
            sourcePublicKey,
            sourceAccount.sequence,
            destination,
            amount,
          );
        }

        setResult({ status: 'awaiting_signature' });

        const { signedTxXdr, error: signError } = await signTransaction(
          transactionXdr,
          {
            networkPassphrase: STELLAR_NETWORK.networkPassphrase,
            address: sourcePublicKey,
          },
        );

        if (signError || !signedTxXdr) {
          let msg: string;
          if (typeof signError === 'string') {
            msg = signError;
          } else if (signError && typeof signError === 'object' && 'message' in signError) {
            msg = (signError as { message: string }).message;
          } else {
            msg = 'Transaction signing was declined or failed.';
          }
          setResult({ status: 'failed', error: msg });
          return;
        }

        setResult({ status: 'submitting' });

        const tx = new Transaction(
          signedTxXdr,
          STELLAR_NETWORK.networkPassphrase,
        );

        let submitResult: Awaited<ReturnType<typeof server.submitTransaction>>;
        try {
          submitResult = await server.submitTransaction(tx);
        } catch (submitErr: unknown) {
          const httpError = submitErr as
            | { response?: { data?: { extras?: { result_codes?: Record<string, unknown> }; title?: string }; status?: number }; message?: string }
            | undefined;
          const resultCodes = httpError?.response?.data?.extras?.result_codes;
          if (resultCodes) {
            setResult({ status: 'failed', error: `Transaction failed: ${JSON.stringify(resultCodes)}` });
          } else if (httpError?.response?.data?.title) {
            setResult({ status: 'failed', error: httpError.response.data.title });
          } else {
            setResult({
              status: 'failed',
              error: submitErr instanceof Error ? submitErr.message : 'Transaction submission failed',
            });
          }
          return;
        }

        if (submitResult.successful) {
          setResult({
            status: 'success',
            hash: submitResult.hash,
            source: sourcePublicKey,
            destination,
            amount,
          });
        } else {
          setResult({
            status: 'failed',
            error: 'Transaction submission was not successful.',
          });
        }
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : 'An unexpected error occurred.';
        setResult({ status: 'failed', error: msg });
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setResult({ status: 'idle' });
  }, []);

  return { result, sendPayment, reset };
}
