import React, { useState } from 'react';
import { publicClient, walletClient } from '../../../client';
import { contract } from '../CollateralManagerAbi'; // Adjust the import path to your contract ABI file
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const SetFees = () => {
  const [addCollateralFee, setAddCollateralFee] = useState<string>('');
  const [removeCollateralFee, setRemoveCollateralFee] = useState<string>('');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const account = useAccount();

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setTxHash(null);
    setErrorMsg(null);

    if (!addCollateralFee || !removeCollateralFee) {
      setErrorMsg('Please provide both fees.');
      return;
    }

    try {
      const { request } = await publicClient.simulateContract({
        abi: contract.abi,
        address: contract.address as Address,
        functionName: 'setFees',
        args: [BigInt(addCollateralFee), BigInt(removeCollateralFee)],
        account: account.address as Address,
      });

      const hash = await walletClient.writeContract(request);
      setTxHash(hash as string);
    } catch (error: any) {
      setErrorMsg(error?.message || 'Error calling setFees');
      console.error('Error calling setFees:', error);
    }
  };

  return (
    <div className="form-container">
      <h2>Set Fees</h2>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label htmlFor='addCollateralFee' style={{ fontWeight: 'bold' }}>Add Collateral Fee</label>
          <input
            type='text'
            name='addCollateralFee'
            value={addCollateralFee}
            placeholder='Enter add collateral fee (wei)'
            onChange={(e) => setAddCollateralFee(e.target.value)}
            style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label htmlFor='removeCollateralFee' style={{ fontWeight: 'bold' }}>Remove Collateral Fee</label>
          <input
            type='text'
            name='removeCollateralFee'
            value={removeCollateralFee}
            placeholder='Enter remove collateral fee (wei)'
            onChange={(e) => setRemoveCollateralFee(e.target.value)}
            style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <button type='submit' style={{ marginTop: '10px', background: '#c7b6f7', color: '#222', borderRadius: '6px', padding: '8px 16px', border: 'none', fontWeight: 'bold' }}>Set Fees</button>
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

export default SetFees;