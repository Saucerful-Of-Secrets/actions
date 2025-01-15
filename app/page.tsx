/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import React, { useState, useEffect } from 'react';
import { clusterApiUrl, Transaction, Connection } from '@solana/web3.js';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import {
  WalletProvider,
  ConnectionProvider,
  useWallet,
} from '@solana/wallet-adapter-react';
import {
  WalletModalProvider,
  WalletMultiButton,
} from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

const ActionPage = () => {
  const { publicKey, connected, signTransaction } = useWallet();
  const [actionHref, setActionHref] = useState<string | null>(null);
  const [actionExecuted, setActionExecuted] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const href = urlParams.get('href');
    if (href) {
      setActionHref(href);
    } else {
      alert('No action specified!');
    }
  }, []);

  useEffect(() => {
    if (connected && publicKey && actionHref && !actionExecuted) {
      sendAction();
    }
  }, [connected, publicKey, actionHref, actionExecuted]);

  const sendAction = async () => {
    if (!connected || !publicKey || !actionHref) {
      alert('Please connect your wallet first or provide a valid action.');
      return;
    }

    try {
      setActionExecuted(true);
      const response = await fetch(actionHref, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ account: publicKey.toString() }),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const result = await response.json();

      if (result.transaction) {
        await sendTransactionToWallet(result.transaction);
      } else {
        alert('No transaction received from API.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(`Error: ${error}`);
    }
  };

  const sendTransactionToWallet = async (transactionBase64: string) => {
    try {
      if (!publicKey || !signTransaction) {
        alert('Wallet does not support signing transactions.');
        return;
      }

      const transactionBuffer = Buffer.from(transactionBase64, 'base64');
      const transaction = Transaction.from(transactionBuffer);

      if (!transaction.feePayer) {
        transaction.feePayer = publicKey;
      }

      const signedTransaction = await signTransaction(transaction);

      const connection = new Connection(
        clusterApiUrl(WalletAdapterNetwork.Devnet)
      );
      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize()
      );

      alert(`Transaction sent successfully! Signature: ${signature}`);
    } catch (error) {
      console.error('Error sending transaction:', error);
      alert(`Failed to send transaction: ${error}`);
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>Execute Action</h1>
      <WalletMultiButton />
      {!connected && <p>Please connect your wallet to proceed.</p>}
    </div>
  );
};

const App = () => {
  const wallets = [new PhantomWalletAdapter()];

  return (
    <ConnectionProvider endpoint={clusterApiUrl(WalletAdapterNetwork.Devnet)}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <ActionPage />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default App;
