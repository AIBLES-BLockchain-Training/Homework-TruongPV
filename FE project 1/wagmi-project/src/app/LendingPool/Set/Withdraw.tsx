import React, { useState } from 'react';
import { publicClient, walletClient } from '../../../client';
import { contract } from '../LendingPoolAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const Withdraw = () => {
    const [asset, setAsset] = useState<string>('');
    const [amount, setAmount] = useState<string>('');
    const account = useAccount();

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!asset || !amount) {
            alert('Please provide both asset address and amount.');
            return;
        }
        try {
            const { request } = await publicClient.simulateContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'withdraw',
                args: [asset, BigInt(amount)],
                account: account.address as Address,
                value: BigInt(amount), // Nếu cần gửi ETH, thay đổi giá trị này
            });
            const hash = await walletClient.writeContract(request);
            console.log('Transaction hash:', hash);
        } catch (error) {
            console.error('Error calling withdraw:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Withdraw</h2>
            <form onSubmit={submit}>
                <label htmlFor='asset'>Asset Address</label>
                <input
                    type='text'
                    name='asset'
                    value={asset}
                    onChange={(e) => setAsset(e.target.value)}
                />
                <label htmlFor='amount'>Amount</label>
                <input
                    type='number'
                    name='amount'
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
                <button type='submit'>Withdraw</button>
            </form>
        </div>
    );
};

export default Withdraw;