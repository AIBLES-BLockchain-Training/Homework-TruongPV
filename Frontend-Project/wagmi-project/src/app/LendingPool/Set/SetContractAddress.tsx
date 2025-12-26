import React, { useState } from 'react';
import { publicClient, walletClient } from '../../../client';
import { contract } from '../LendingPoolAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const SetContractAddress = () => {
  const [priceOracle, setPriceOracle] = useState('');
  const [collateralManager, setCollateralManager] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [borrower, setBorrower] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const account = useAccount();

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResult(null);
    setError(null);
    if (!priceOracle || !collateralManager || !interestRate || !borrower) {
      setError('Vui lòng nhập đầy đủ các trường.');
      return;
    }
    setLoading(true);
    try {
      const { request } = await publicClient.simulateContract({
        abi: contract.abi,
        address: contract.address as Address,
        functionName: 'setContractAddress',
        args: [priceOracle, collateralManager, interestRate, borrower],
        account: account.address as Address,
      });
      const hash = await walletClient.writeContract(request);
      setResult('Giao dịch thành công! Hash: ' + hash);
    } catch (err: any) {
      setError('Giao dịch thất bại: ' + (err?.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Set Contract Address</h2>
      <form onSubmit={submit}>
        <div className="token-input">
          <label htmlFor='priceOracle'>Price Oracle Address</label>
          <input
            type='text'
            name='priceOracle'
            placeholder='0x...'
            value={priceOracle}
            onChange={e => setPriceOracle(e.target.value)}
            autoComplete='off'
          />
        </div>
        <div className="token-input">
          <label htmlFor='collateralManager'>Collateral Manager Address</label>
          <input
            type='text'
            name='collateralManager'
            placeholder='0x...'
            value={collateralManager}
            onChange={e => setCollateralManager(e.target.value)}
            autoComplete='off'
          />
        </div>
        <div className="token-input">
          <label htmlFor='interestRate'>Interest Rate Address</label>
          <input
            type='text'
            name='interestRate'
            placeholder='0x...'
            value={interestRate}
            onChange={e => setInterestRate(e.target.value)}
            autoComplete='off'
          />
        </div>
        <div className="token-input">
          <label htmlFor='borrower'>Borrower Address</label>
          <input
            type='text'
            name='borrower'
            placeholder='0x...'
            value={borrower}
            onChange={e => setBorrower(e.target.value)}
            autoComplete='off'
          />
        </div>
        <div className="button-container">
          <button type='submit' disabled={loading}>
            {loading ? 'Đang gửi...' : 'Set Contract Address'}
          </button>
        </div>
        {result && <div className="success-message">{result}</div>}
        {error && <div className="error-message">{error}</div>}
      </form>
    </div>
  );
};

export default SetContractAddress;
