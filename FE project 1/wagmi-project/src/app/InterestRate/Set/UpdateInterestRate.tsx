import React, { useState } from 'react';
import { publicClient, walletClient } from '../../../client';
import { contract } from '../InterestRateAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const UpdateInterestRate = () => {
  const [tokenAddress, setTokenAddress] = useState<string>('');
  const account = useAccount();

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!tokenAddress) {
      alert('Please provide a token address.');
      return;
    }

    try {
      const { request } = await publicClient.simulateContract({
        abi: contract.abi,
        address: contract.address as Address,
        functionName: 'updateInterestRate',
        args: [tokenAddress],
        account: account.address as Address,
      });

      const hash = await walletClient.writeContract(request);
      console.log('Transaction hash:', hash);
    } catch (error) {
      console.error('Error calling updateInterestRate:', error);
    }
  };

  return (
    <div className="form-container">
      <h2>Update Interest Rate</h2>
      <form onSubmit={submit}>
        <label htmlFor='tokenAddress'>Token Address</label>
        <input
          type='text'
          name='tokenAddress'
          value={tokenAddress}
          onChange={(e) => setTokenAddress(e.target.value)}
        />
        <button type='submit'>Update Interest Rate</button>
      </form>
    </div>
  );
};

export default UpdateInterestRate;