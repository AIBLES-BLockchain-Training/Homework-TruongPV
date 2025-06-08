import React, { useState } from 'react';
import { publicClient, walletClient } from '../../../client';
import { contract } from '../BorrowerAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import "../Function.css";

const RepayLoan = () => {
    const [loanId, setLoanId] = useState<string>('');
    const [amount, setAmount] = useState<string>('');
    const account = useAccount();

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!loanId || !amount) {
            alert('Please provide both Loan ID and Amount.');
            return;
        }
        try {
            const { request } = await publicClient.simulateContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'repayLoan',
                args: [BigInt(loanId), BigInt(amount)],
                account: account.address as Address,
                value: BigInt(amount), // Nếu cần gửi ETH, thay đổi giá trị này
            });
            const hash = await walletClient.writeContract(request);
            console.log('Transaction hash:', hash);
        } catch (error) {
            console.error('Error calling repayLoan:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Repay Loan</h2>
            <form onSubmit={submit}>
                <label htmlFor='loanId'>Loan ID</label>
                <input
                    type='number'
                    name='loanId'
                    value={loanId}
                    onChange={(e) => setLoanId(e.target.value)}
                />
                <label htmlFor='amount'>Amount</label>
                <input
                    type='number'
                    name='amount'
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
                <button type='submit'>Repay Loan</button>
            </form>
        </div>
    );
};

export default RepayLoan;