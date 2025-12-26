import React, { useState } from 'react';
import { publicClient, walletClient } from '../../../client';
import { contract } from '../LendingPoolAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const SetFee = () => {
  const [fee, setFee] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const account = useAccount();

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResult(null);
    setError(null);
    if (!fee) {
      setError('Vui lòng nhập giá trị fee.');
      return;
    }
    setLoading(true);
    try {
      const { request } = await publicClient.simulateContract({
        abi: contract.abi,
        address: contract.address as Address,
        functionName: 'setFee',
        args: [BigInt(fee)],
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
      <h2>Set Fee</h2>
      <form onSubmit={submit}>
        <div className="token-input">
          <label htmlFor='fee'>Fee (uint256)</label>
          <input
            type='number'
            name='fee'
            placeholder='Nhập fee'
            value={fee}
            onChange={e => setFee(e.target.value)}
            min='0'
          />
        </div>
        <div className="button-container">
          <button type='submit' disabled={loading}>
            {loading ? 'Đang gửi...' : 'Set Fee'}
          </button>
        </div>
        {result && <div className="success-message">{result}</div>}
        {error && <div className="error-message">{error}</div>}
      </form>
    </div>
  );
};

export default SetFee;
