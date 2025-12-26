import React, { useState } from 'react';
import { publicClient, walletClient } from '../../../client';
import { contract } from '../BorrowerAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const PerformUpkeep = () => {
  const [performData, setPerformData] = useState<string>('');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const account = useAccount();

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTxHash(null);
    setErrorMsg(null);

    if (!performData) {
      alert('Please provide performData (hex string).');
      return;
    }

    try {
      const { request } = await publicClient.simulateContract({
        abi: contract.abi,
        address: contract.address as Address,
        functionName: 'performUpkeep',
        args: [performData],
        account: account.address as Address,
      });
      const hash = await walletClient.writeContract(request);
      setTxHash(hash as string);
    } catch (error: any) {
      setErrorMsg('Error calling performUpkeep');
      console.error('Error calling performUpkeep:', error);
    }
  };

  return (
    <div className="form-container">
      <h2>Perform Upkeep</h2>
      <form onSubmit={submit}>
        <label htmlFor='performData'>performData (bytes, hex string)</label>
        <input
          type='text'
          name='performData'
          value={performData}
          onChange={(e) => setPerformData(e.target.value)}
          placeholder='0x...'
        />
        <button type='submit'>Perform Upkeep</button>
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

export default PerformUpkeep;
