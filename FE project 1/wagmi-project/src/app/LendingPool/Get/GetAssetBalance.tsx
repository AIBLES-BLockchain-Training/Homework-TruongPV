import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../LendingPoolAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const GetAssetBalance = () => {
    const [address, setAddress] = useState<string>('');
    const [balance, setBalance] = useState<string | null>(null);
    const account = useAccount();

    const getBalance = async () => {
        if (!address) {
            alert('Please provide the asset address.');
            return;
        }
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'assetBalance',
                args: [address],
            });
            setBalance((result as bigint).toString());
        } catch (error) {
            console.error('Error fetching assetBalance:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Get Asset Balance</h2>
            <label htmlFor='address'>Asset Address</label>
            <input
                type='text'
                name='address'
                value={address}
                onChange={(e) => setAddress(e.target.value)}
            />
            <button type='button' onClick={getBalance}>Get Balance</button>
            <div className="admin">
                <h6>Balance: {balance ? balance : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default GetAssetBalance;