import React, { useState } from 'react';
import { publicClient, walletClient } from '../../../client';
import { contract } from '../CollateralManagerAbi'; // Adjust the import path to your contract ABI file
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const SetLTVLimit = () => {
  const [LTVLimit, setLTVLimit] = useState<string>('');
  const account = useAccount();

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!LTVLimit) {
      alert('Please provide LTV limit.');
      return;
    }

    try {
      const { request } = await publicClient.simulateContract({
        abi: contract.abi,
        address: contract.address as Address, 
        functionName: 'setLTVLimit',
        args: [BigInt(LTVLimit)],
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
        <label htmlFor='LTVLimit'>LTV Limit</label>
        <input
          type='text'
          name='LTVLimit'
          value={LTVLimit}
          onChange={(e) => setLTVLimit(e.target.value)}
        />
        <button type='submit'>Set LTV Limit</button>
      </form>
    </div>
  );
};

export default SetLTVLimit;