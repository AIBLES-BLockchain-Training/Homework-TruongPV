import React, { useState } from 'react';
import { publicClient, walletClient } from '../../../client';
import { contract } from '../CollateralManagerAbi'; // Adjust the import path to your contract ABI file
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const SetContractAddresses = () => {
  const [priceOracle, setPriceOracle] = useState<string>('');
  const [mockToken, setMockToken] = useState<string>('');
  const [lendingPool, setLendingPool] = useState<string>('');
  const [borrower, setBorrower] = useState<string>('');
  const [interestRate, setInterestRate] = useState<string>('');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const account = useAccount();

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setTxHash(null);
    setErrorMsg(null);

    if (!priceOracle || !mockToken || !lendingPool || !borrower || !interestRate) {
      setErrorMsg('Please provide all contract addresses.');
      return;
    }

    try {
      const { request } = await publicClient.simulateContract({
        abi: contract.abi,
        address: contract.address as Address,
        functionName: 'setContractAddresses',
        args: [
          priceOracle as Address,
          mockToken as Address,
          lendingPool as Address,
          borrower as Address,
          interestRate as Address
        ],
        account: account.address as Address,
      });

      const hash = await walletClient.writeContract(request);
      setTxHash(hash as string);
    } catch (error: any) {
      setErrorMsg(error?.message || 'Error calling setContractAddresses');
      console.error('Error calling setContractAddresses:', error);
    }
  };

  return (
    <div className="form-container">
      <h2>Set Contract Addresses</h2>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label htmlFor='priceOracle' style={{ fontWeight: 'bold' }}>Price Oracle Address</label>
          <input
            type='text'
            name='priceOracle'
            value={priceOracle}
            placeholder='Enter price oracle address'
            onChange={(e) => setPriceOracle(e.target.value)}
            style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label htmlFor='mockToken' style={{ fontWeight: 'bold' }}>Mock Token Address</label>
          <input
            type='text'
            name='mockToken'
            value={mockToken}
            placeholder='Enter mock token address'
            onChange={(e) => setMockToken(e.target.value)}
            style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label htmlFor='lendingPool' style={{ fontWeight: 'bold' }}>Lending Pool Address</label>
          <input
            type='text'
            name='lendingPool'
            value={lendingPool}
            placeholder='Enter lending pool address'
            onChange={(e) => setLendingPool(e.target.value)}
            style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label htmlFor='borrower' style={{ fontWeight: 'bold' }}>Borrower Address</label>
          <input
            type='text'
            name='borrower'
            value={borrower}
            placeholder='Enter borrower address'
            onChange={(e) => setBorrower(e.target.value)}
            style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label htmlFor='interestRate' style={{ fontWeight: 'bold' }}>Interest Rate Address</label>
          <input
            type='text'
            name='interestRate'
            value={interestRate}
            placeholder='Enter interest rate address'
            onChange={(e) => setInterestRate(e.target.value)}
            style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <button type='submit' style={{ marginTop: '10px', background: '#c7b6f7', color: '#222', borderRadius: '6px', padding: '8px 16px', border: 'none', fontWeight: 'bold' }}>Set Contract Addresses</button>
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

export default SetContractAddresses;