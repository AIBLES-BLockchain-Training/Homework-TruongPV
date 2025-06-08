import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../LendingPoolAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const GetTotalBalance = () => {
    const [asset, setAsset] = useState<string>('');
    const [balances, setBalances] = useState<{ total: string; other: string } | null>(null);
    const account = useAccount();

    const getTotalBalance = async () => {
        if (!asset) {
            alert('Please provide the asset address.');
            return;
        }
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'getTotalBalance',
                args: [asset],
            });
            const [total, other] = result as [bigint, bigint];
            setBalances({
                total: total.toString(),
                other: other.toString(),
            });
        } catch (error) {
            console.error('Error fetching getTotalBalance:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Get Total Balance</h2>
            <label htmlFor='asset'>Asset Address</label>
            <input
                type='text'
                name='asset'
                value={asset}
                onChange={(e) => setAsset(e.target.value)}
            />
            <button type='button' onClick={getTotalBalance}>Get Total Balance</button>
            <div className="admin">
                {balances ? (
                    <div>
                        <h6>Total: {balances.total}</h6>
                        <h6>Other: {balances.other}</h6>
                    </div>
                ) : (
                    <h6>Balances: N/A</h6>
                )}
            </div>
        </div>
    );
};

export default GetTotalBalance;