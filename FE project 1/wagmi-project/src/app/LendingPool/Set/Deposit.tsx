import React, { useState } from 'react';
import { publicClient, walletClient } from '../../../client';
import { contract } from '../LendingPoolAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const Deposit = () => {
    const [assetAddress, setAssetAddress] = useState<string>('');
    const [amount, setAmount] = useState<string>('');
    const account = useAccount();

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!assetAddress || !amount) {
            alert('Please provide both asset address and amount.');
            return;
        }
        try {
            const { request } = await publicClient.simulateContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'deposit',
                args: [assetAddress, BigInt(amount)],
                account: account.address as Address,
                value: BigInt(amount), // Nếu cần gửi ETH, thay đổi giá trị này
            });
            const hash = await walletClient.writeContract(request);
            console.log('Transaction hash:', hash);
        } catch (error) {
            console.error('Error calling deposit:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Deposit</h2>
            <form onSubmit={submit}>
                <label htmlFor='assetAddress'>Asset Address</label>
                <input
                    type='text'
                    name='assetAddress'
                    value={assetAddress}
                    onChange={(e) => setAssetAddress(e.target.value)}
                />
                <label htmlFor='amount'>Amount</label>
                <input
                    type='number'
                    name='amount'
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
                <button type='submit'>Deposit</button>
            </form>
        </div>
    );
};

export default Deposit;