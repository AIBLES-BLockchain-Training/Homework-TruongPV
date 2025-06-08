import React, { useState } from 'react';
import { publicClient, walletClient } from '../../../client';
import { contract } from '../LendingPoolAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const WithdrawServiceFee = () => {
    const [amount, setAmount] = useState<string>('');
    const account = useAccount();

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!amount) {
            alert('Please provide the amount.');
            return;
        }
        try {
            const { request } = await publicClient.simulateContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'withdrawServiceFee',
                args: [BigInt(amount)],
                account: account.address as Address,
            });
            const hash = await walletClient.writeContract(request);
            console.log('Transaction hash:', hash);
        } catch (error) {
            console.error('Error calling withdrawServiceFee:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Withdraw Service Fee</h2>
            <form onSubmit={submit}>
                <label htmlFor='amount'>Amount</label>
                <input
                    type='number'
                    name='amount'
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
                <button type='submit'>Withdraw Service Fee</button>
            </form>
        </div>
    );
};

export default WithdrawServiceFee;