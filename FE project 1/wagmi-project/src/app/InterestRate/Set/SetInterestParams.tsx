import React, { useState } from 'react';
import { publicClient, walletClient } from '../../../client';
import { contract } from '../InterestRateAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const SetInterestParams = () => {
  const [tokenAddress, setTokenAddress] = useState<string>('');
  const [slope1, setSlope1] = useState<string>('');
  const [slope2, setSlope2] = useState<string>('');
  const [baseRate, setBaseRate] = useState<string>('');
  const [utilizationOptimal, setUtilizationOptimal] = useState<string>('');
  const account = useAccount();

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!tokenAddress || !slope1 || !slope2 || !baseRate || !utilizationOptimal) {
      alert('Please provide all parameters.');
      return;
    }

    try {
      const { request } = await publicClient.simulateContract({
        abi: contract.abi,
        address: contract.address as Address,
        functionName: 'setInterestParams',
        args: [
          tokenAddress,
          BigInt(slope1),
          BigInt(slope2),
          BigInt(baseRate),
          BigInt(utilizationOptimal)
        ],
        account: account.address as Address,
      });

      const hash = await walletClient.writeContract(request);
      console.log('Transaction hash:', hash);
    } catch (error) {
      console.error('Error calling setInterestParams:', error);
    }
  };

  return (
    <div className="form-container">
      <h2>Set Interest Params</h2>
      <form onSubmit={submit}>
        <label htmlFor='tokenAddress'>Token Address</label>
        <input
          type='text'
          name='tokenAddress'
          value={tokenAddress}
          onChange={(e) => setTokenAddress(e.target.value)}
        />
        <label htmlFor='slope1'>Slope1</label>
        <input
          type='number'
          name='slope1'
          value={slope1}
          onChange={(e) => setSlope1(e.target.value)}
        />
        <label htmlFor='slope2'>Slope2</label>
        <input
          type='number'
          name='slope2'
          value={slope2}
          onChange={(e) => setSlope2(e.target.value)}
        />
        <label htmlFor='baseRate'>Base Rate</label>
        <input
          type='number'
          name='baseRate'
          value={baseRate}
          onChange={(e) => setBaseRate(e.target.value)}
        />
        <label htmlFor='utilizationOptimal'>Utilization Optimal</label>
        <input
          type='number'
          name='utilizationOptimal'
          value={utilizationOptimal}
          onChange={(e) => setUtilizationOptimal(e.target.value)}
        />
        <button type='submit'>Set Interest Params</button>
      </form>
    </div>
  );
};

export default SetInterestParams;