import React, { useState } from 'react';
import { publicClient, walletClient } from '../../../client';
import { contract } from '../LendingPoolAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const TransferExcessAmount = () => {
  const [asset, setAsset] = useState<string>('');
  const [user, setUser] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const account = useAccount();

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setTxHash(null);

    if (!asset || asset.length !== 42) {
      setError('Please provide a valid asset address.');
      return;
    }
    if (!user || user.length !== 42) {
      setError('Please provide a valid user address.');
      return;
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Please provide a valid amount.');
      return;
    }

    try {
      const { request } = await publicClient.simulateContract({
        abi: contract.abi,
        address: contract.address as Address,
        functionName: 'transferExcessAmount',
        args: [asset, user, BigInt(amount)],
        account: account.address as Address,
      });
      const hash = await walletClient.writeContract(request);
      setTxHash(hash as string);
    } catch (err) {
      setError('Error calling transferExcessAmount.');
      console.error('Error calling transferExcessAmount:', err);
    }
  };

  return (
    <div className="form-container">
      <h2>Transfer Excess Amount</h2>
      <form onSubmit={submit}>
        <div className="token-input">
          <label htmlFor='asset'>Asset Address</label>
          <input
            type='text'
            name='asset'
            value={asset}
            onChange={(e) => setAsset(e.target.value)}
            placeholder="Enter asset address"
          />
          <label htmlFor='user'>User Address</label>
          <input
            type='text'
            name='user'
            value={user}
            onChange={(e) => setUser(e.target.value)}
            placeholder="Enter user address"
          />
          <label htmlFor='amount'>Amount</label>
          <input
            type='number'
            name='amount'
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
          />
        </div>
        <div className="button-container">
          <button type='submit' className="submit-token">Transfer Excess Amount</button>
        </div>
      </form>
      {error && <div className="error" style={{ color: 'red', marginTop: '8px' }}>{error}</div>}
      {txHash && (
        <div className="tx-hash" style={{ marginTop: '8px', wordBreak: 'break-all' }}>
          <h6>Transaction Hash: {txHash}</h6>
        </div>
      )}
    </div>
  );
};

export default TransferExcessAmount;
