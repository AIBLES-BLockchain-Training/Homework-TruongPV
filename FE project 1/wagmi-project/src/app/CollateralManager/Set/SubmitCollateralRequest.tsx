import React, { useState } from 'react';
import { publicClient, walletClient } from '../../../client';
import { contract } from '../CollateralManagerAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const SubmitCollateralRequest = () => {
  const [token, setToken] = useState<string>('');
  const account = useAccount();

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token) {
      alert('Please provide the token address.');
      return;
    }

    try {
      const { request } = await publicClient.simulateContract({
        abi: contract.abi,
        address: contract.address as Address,
        functionName: 'submitCollateralRequest',
        args: [token],
        account: account.address as Address,
      });

      const hash = await walletClient.writeContract(request);
      console.log('Transaction hash:', hash);
    } catch (error) {
      console.error('Error calling submitCollateralRequest:', error);
    }
  };

  return (
    <div className="form-container">
      <h2>Submit Collateral Request</h2>
      <form onSubmit={submit}>
        <label htmlFor='token'>Token Address</label>
        <input
          type='text'
          name='token'
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <button type='submit'>Submit</button>
      </form>
    </div>
  );
};

export default SubmitCollateralRequest;