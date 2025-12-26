import React, { useState } from 'react';
import { publicClient, walletClient } from '../../../client';
import { contract } from '../BorrowerAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const SetRickParams = () => {
  const [assetAddress, setAssetAddress] = useState<string>('');
  const [liquidationThreshold, setLiquidationThreshold] = useState<string>('');
  const [ltv, setLtv] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const account = useAccount();

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResult(null);
    setError(null);

    if (!assetAddress || !liquidationThreshold || !ltv) {
      setError('Vui lòng nhập đầy đủ các trường.');
      return;
    }

    setLoading(true);
    try {
      const { request } = await publicClient.simulateContract({
        abi: contract.abi,
        address: contract.address as Address,
        functionName: 'setRickParams',
        args: [assetAddress, BigInt(liquidationThreshold), BigInt(ltv)],
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
      <h2>SetRickParams</h2>
      <form onSubmit={submit}>
        <div className="token-input">
          <label htmlFor='assetAddress'>Asset Address</label>
          <input
            type='text'
            name='assetAddress'
            placeholder='0x...'
            value={assetAddress}
            onChange={(e) => setAssetAddress(e.target.value)}
            autoComplete='off'
          />
        </div>
        <div className="token-input">
          <label htmlFor='liquidationThreshold'>Liquidation Threshold (uint256)</label>
          <input
            type='number'
            name='liquidationThreshold'
            placeholder='Ví dụ: 8000'
            value={liquidationThreshold}
            onChange={(e) => setLiquidationThreshold(e.target.value)}
            min='0'
          />
        </div>
        <div className="token-input">
          <label htmlFor='ltv'>Loan-to-Value (LTV, uint256)</label>
          <input
            type='number'
            name='ltv'
            placeholder='Ví dụ: 7500'
            value={ltv}
            onChange={(e) => setLtv(e.target.value)}
            min='0'
          />
        </div>
        <div className="button-container">
          <button type='submit' disabled={loading}>
            {loading ? 'Đang gửi...' : 'Thiết lập'}
          </button>
        </div>
        {result && <div className="success-message">{result}</div>}
        {error && <div className="error-message">{error}</div>}
      </form>
    </div>
  );
};

export default SetRickParams;
