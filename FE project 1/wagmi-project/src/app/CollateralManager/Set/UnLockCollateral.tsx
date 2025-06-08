import React, { useState } from 'react';
import { publicClient, walletClient } from '../../../client';
import { contract } from '../CollateralManagerAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const UnlockCollateral = () => {
  const [user, setUser] = useState<string>('');
  const [assetAddress, setAssetAddress] = useState<string>('');
  const account = useAccount();

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user || !assetAddress) {
      alert('Please provide both user and asset address.');
      return;
    }

    try {
      const { request } = await publicClient.simulateContract({
        abi: contract.abi,
        address: contract.address as Address,
        functionName: 'unlockCollateral',
        args: [user, assetAddress],
        account: account.address as Address,
      });

      const hash = await walletClient.writeContract(request);
      console.log('Transaction hash:', hash);
    } catch (error) {
      console.error('Error calling unlockCollateral:', error);
    }
  };

  return (
    <div className="form-container">
      <h2>Unlock Collateral</h2>
      <form onSubmit={submit}>
        <label htmlFor='user'>User Address</label>
        <input
          type='text'
          name='user'
          value={user}
          onChange={(e) => setUser(e.target.value)}
        />
        <label htmlFor='assetAddress'>Asset Address</label>
        <input
          type='text'
          name='assetAddress'
          value={assetAddress}
          onChange={(e) => setAssetAddress(e.target.value)}
        />
        <button type='submit'>Unlock Collateral</button>
      </form>
    </div>
  );
};

export default UnlockCollateral;