import React, { useState } from 'react';
import { publicClient, walletClient } from '../../../client';
import { contract } from '../LendingPoolAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const Deposit = () => {
  const [assetAddress, setAssetAddress] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const account = useAccount();

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResult(null);
    setError(null);
    if (!assetAddress || !amount) {
      setError('Vui lòng nhập đầy đủ thông tin.');
      return;
    }
    setLoading(true);
    try {
      const { request } = await publicClient.simulateContract({
        abi: contract.abi,
        address: contract.address as Address,
        functionName: 'deposit',
        args: [assetAddress, BigInt(amount)],
        account: account.address as Address,
        value: BigInt(amount),
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
      <h2>Deposit</h2>
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
          <label htmlFor='amount'>Amount (uint256)</label>
          <input
            type='number'
            name='amount'
            placeholder='Số lượng'
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min='0'
          />
        </div>
        <div className="button-container">
          <button type='submit' disabled={loading}>
            {loading ? 'Đang gửi...' : 'Deposit'}
          </button>
        </div>
        {result && <div className="success-message">{result}</div>}
        {error && <div className="error-message">{error}</div>}
      </form>
    </div>
  );
};

export default Deposit;
