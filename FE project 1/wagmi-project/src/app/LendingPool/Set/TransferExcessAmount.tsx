import React, { useState } from 'react';
import { publicClient, walletClient } from '../../../client';
import { contract } from '../LendingPoolAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const TransferExcessAmount = () => {
    const [asset, setAsset] = useState<string>('');
    const [user, setUser] = useState<string>('');
    const [amount, setAmount] = useState<string>('');
    const account = useAccount();

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!asset || !user || !amount) {
            alert('Please provide asset address, user address, and amount.');
            return;
        }
        try {
            const { request } = await publicClient.simulateContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'transferExcessAmount',
                args: [asset, user, BigInt(amount)],
                account: account.address as Address,
            });
            const hash = await walletClient.writeContract(request);
            console.log('Transaction hash:', hash);
        } catch (error) {
            console.error('Error calling transferExcessAmount:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Transfer Excess Amount</h2>
            <form onSubmit={submit}>
                <label htmlFor='asset'>Asset Address</label>
                <input
                    type='text'
                    name='asset'
                    value={asset}
                    onChange={(e) => setAsset(e.target.value)}
                />
                <label htmlFor='user'>User Address</label>
                <input
                    type='text'
                    name='user'
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                />
                <label htmlFor='amount'>Amount</label>
                <input
                    type='number'
                    name='amount'
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
                <button type='submit'>Transfer</button>
            </form>
        </div>
    );
};

export default TransferExcessAmount;