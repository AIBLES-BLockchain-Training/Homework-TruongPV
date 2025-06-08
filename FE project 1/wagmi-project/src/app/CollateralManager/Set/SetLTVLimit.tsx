import React, { useState } from 'react';
import { publicClient, walletClient } from '../../../client';
import { contract } from '../CollateralManagerAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const SetLTVLimit = () => {
  const [ltvLimit, setLtvLimit] = useState<string>('');
  const account = useAccount();

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!ltvLimit) {
      alert('Please provide the LTV Limit.');
      return;
    }

    try {
      const { request } = await publicClient.simulateContract({
        abi: contract.abi,
        address: contract.address as Address,
        functionName: 'setLTVLimit',
        args: [BigInt(ltvLimit)],
        account: account.address as Address,
      });

      const hash = await walletClient.writeContract(request);
      console.log('Transaction hash:', hash);
    } catch (error) {
      console.error('Error calling setLTVLimit:', error);
    }
  };

  return (
    <div className="form-container">
      <h2>Set LTV Limit</h2>
      <form onSubmit={submit}>
        <label htmlFor='ltvLimit'>LTV Limit</label>
        <input
          type='number'
          name='ltvLimit'
          value={ltvLimit}
          onChange={(e) => setLtvLimit(e.target.value)}
        />
        <button type='submit'>Set LTV Limit</button>
      </form>
    </div>
  );
};

export default SetLTVLimit;