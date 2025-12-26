import React, { useState } from 'react';
import { publicClient, walletClient } from '../../../client';
import { contract } from '../CollateralManagerAbi'; // Adjust the import path to your contract ABI file
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const UnlockCollateral = () => {
  const [user, setUser] = useState<string>('');
  const [assetAddress, setAssetAddress] = useState<string>('');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const account = useAccount();

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setTxHash(null);
    setErrorMsg(null);

    if (!user || !assetAddress) {
      setErrorMsg('Please provide user address and asset address.');
      return;
    }

    try {
      const { request } = await publicClient.simulateContract({
        abi: contract.abi,
        address: contract.address as Address,
        functionName: 'unlockCollateral',
        args: [user as Address, assetAddress as Address],
        account: account.address as Address,
      });

      const hash = await walletClient.writeContract(request);
      setTxHash(hash as string);
    } catch (error: any) {
      setErrorMsg(error?.message || 'Error calling unlockCollateral');
      console.error('Error calling unlockCollateral:', error);
    }
  };

  return (
    <div className="form-container">
      <h2>Unlock Collateral</h2>
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
        <button type='submit' style={{ marginTop: '10px', background: '#c7b6f7', color: '#222', borderRadius: '6px', padding: '8px 16px', border: 'none', fontWeight: 'bold' }}>Unlock Collateral</button>
      </form>
      {txHash && (
        <div className="result" style={{ marginTop: '12px' }}>
          <h6>Transaction Hash: {txHash}</h6>
        </div>
      )}
      {errorMsg && (
        <div className="error" style={{ marginTop: '12px' }}>
          <h6 style={{ color: 'red' }}>{errorMsg}</h6>
        </div>
      )}
    </div>
  );
};

export default UnlockCollateral;