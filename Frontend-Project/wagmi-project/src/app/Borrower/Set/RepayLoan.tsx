import React, { useState } from 'react';
import { publicClient, walletClient } from '../../../client';
import { contract } from '../BorrowerAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const RepayLoan = () => {
  const [loanId, setLoanId] = useState('');
  const [amount, setAmount] = useState('');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const account = useAccount();

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTxHash(null);
    setErrorMsg(null);

    if (!loanId || !amount) {
      alert('Please provide both loanId and amount.');
      return;
    }

    try {
      const { request } = await publicClient.simulateContract({
        abi: contract.abi,
        address: contract.address as Address,
        functionName: 'repayLoan',
        args: [parseInt(loanId, 10), parseInt(amount, 10)],
        account: account.address as Address,
        value: BigInt(amount),
      });
      const hash = await walletClient.writeContract(request);
      setTxHash(hash as string);
    } catch (error: any) {
      setErrorMsg('Error calling repayLoan');
      console.error('Error calling repayLoan:', error);
    }
  };

  return (
    <div className="form-container">
      <h2>Repay Loan</h2>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label htmlFor='loanId' style={{ fontWeight: 'bold' }}>Loan ID</label>
          <input
            type='number'
            name='loanId'
            value={loanId}
            onChange={(e) => setLoanId(e.target.value)}
            placeholder='Loan ID'
            style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label htmlFor='amount' style={{ fontWeight: 'bold' }}>Amount (wei)</label>
          <input
            type='number'
            name='amount'
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder='Amount in wei'
            style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <button type='submit' style={{ marginTop: '10px', background: '#c7b6f7', color: '#222', borderRadius: '6px', padding: '8px 16px', border: 'none', fontWeight: 'bold' }}>Repay Loan</button>
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

export default RepayLoan;
