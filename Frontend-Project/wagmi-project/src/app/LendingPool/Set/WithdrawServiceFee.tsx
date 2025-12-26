import React, { useState } from 'react';
import { publicClient, walletClient } from '../../../client';
import { contract } from '../LendingPoolAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const WithdrawServiceFee = () => {
  const [amount, setAmount] = useState<string>('');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const account = useAccount();

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setTxHash(null);

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Please provide a valid amount.');
      return;
    }

    try {
      const { request } = await publicClient.simulateContract({
        abi: contract.abi,
        address: contract.address as Address,
        functionName: 'withdrawServiceFee',
        args: [BigInt(amount)],
        account: account.address as Address,
      });
      const hash = await walletClient.writeContract(request);
      setTxHash(hash as string);
    } catch (err) {
      setError('Error calling withdrawServiceFee.');
      console.error('Error calling withdrawServiceFee:', err);
    }
  };

  return (
    <div className="form-container">
      <h2>Withdraw Service Fee</h2>
      <form onSubmit={submit}>
        <div className="token-input">
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
          <button type='submit' className="submit-token">Withdraw Service Fee</button>
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

export default WithdrawServiceFee;
