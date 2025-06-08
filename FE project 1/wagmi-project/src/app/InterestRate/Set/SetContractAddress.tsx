import React, { useState } from 'react';
import { publicClient, walletClient } from '../../../client';
import { contract } from '../InterestRateAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const SetContractAddress = () => {
  const [lendingPool, setLendingPool] = useState<string>('');
  const [borrower, setBorrower] = useState<string>('');
  const account = useAccount();

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!lendingPool || !borrower) {
      alert('Please provide both LendingPool and Borrower address.');
      return;
    }

    try {
      const { request } = await publicClient.simulateContract({
        abi: contract.abi,
        address: contract.address as Address,
        functionName: 'setContractAddress',
        args: [lendingPool, borrower],
        account: account.address as Address,
      });

      const hash = await walletClient.writeContract(request);
      console.log('Transaction hash:', hash);
    } catch (error) {
      console.error('Error calling setContractAddress:', error);
    }
  };

  return (
    <div className="form-container">
      <h2>Set Contract Address</h2>
      <form onSubmit={submit}>
        <label htmlFor='lendingPool'>LendingPool Address</label>
        <input
          type='text'
          name='lendingPool'
          value={lendingPool}
          onChange={(e) => setLendingPool(e.target.value)}
        />
        <label htmlFor='borrower'>Borrower Address</label>
        <input
          type='text'
          name='borrower'
          value={borrower}
          onChange={(e) => setBorrower(e.target.value)}
        />
        <button type='submit'>Set Contract Address</button>
      </form>
    </div>
  );
};

export default SetContractAddress;