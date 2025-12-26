import React, { useState } from 'react';
import { publicClient, walletClient } from '../../../client';
import { contract } from '../CollateralManagerAbi'; // Adjust the import path to your contract ABI file
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const RejectCollateralRequest = () => {
  const [token, setToken] = useState<string>('');
  const account = useAccount();

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token) {
      alert('Please provide a token address.');
      return;
    }

    try {
      const { request } = await publicClient.simulateContract({
        abi: contract.abi,
        address: contract.address as Address, 
        functionName: 'rejectCollateralRequest',
        args: [token as Address],
        account: account.address as Address,
      });

      const hash = await walletClient.writeContract(request);
      console.log('Transaction hash:', hash);
    } catch (error) {
      console.error('Error calling rejectCollateralRequest:', error);
    }
  };

  return (
    <div className="form-container">
      <h2>Reject Collateral Request</h2>
      <form onSubmit={submit}>
        <label htmlFor='token'>Token Address</label>
        <input
          type='text'
          name='token'
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <button type='submit'>Reject Collateral Request</button>
      </form>
    </div>
  );
};

export default RejectCollateralRequest;