import React, { useState } from 'react';
import { publicClient, walletClient } from '../../../client';
import { contract } from '../CollateralManagerAbi'; // Adjust the import path to your contract ABI file
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const LockCollateral = () => {
  const [user, setUser] = useState<string>('');
  const [assetAddress, setAssetAddress] = useState<string>('');
  const account = useAccount();

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user || !assetAddress) {
      alert('Please provide user address and asset address.');
      return;
    }

    try {
      const { request } = await publicClient.simulateContract({
        abi: contract.abi,
        address: contract.address as Address, 
        functionName: 'lockCollateral',
        args: [user as Address, assetAddress as Address],
        account: account.address as Address,
      });

      const hash = await walletClient.writeContract(request);
      console.log('Transaction hash:', hash);
    } catch (error) {
      console.error('Error calling lockCollateral:', error);
    }
  };

  return (
    <div className="form-container">
      <h2>Lock Collateral</h2>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label htmlFor='user' style={{ fontWeight: 'bold' }}>User Address</label>
          <input
            type='text'
            name='user'
            value={user}
            placeholder='Enter user address'
            onChange={(e) => setUser(e.target.value)}
            style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label htmlFor='assetAddress' style={{ fontWeight: 'bold' }}>Asset Address</label>
          <input
            type='text'
            name='assetAddress'
            value={assetAddress}
            placeholder='Enter asset address'
            onChange={(e) => setAssetAddress(e.target.value)}
            style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <button type='submit' style={{ marginTop: '10px', background: '#c7b6f7', color: '#222', borderRadius: '6px', padding: '8px 16px', border: 'none', fontWeight: 'bold' }}>Lock Collateral</button>
      </form>
    </div>
  );
};

export default LockCollateral;