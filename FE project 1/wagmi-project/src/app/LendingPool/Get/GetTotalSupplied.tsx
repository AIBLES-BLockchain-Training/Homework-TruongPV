import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../LendingPoolAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const GetTotalSupplied = () => {
    const [asset, setAsset] = useState<string>('');
    const [totalSupplied, setTotalSupplied] = useState<string | null>(null);
    const account = useAccount();

    const getTotalSupplied = async () => {
        if (!asset) {
            alert('Please provide the asset address.');
            return;
        }
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'totalSupplied',
                args: [asset],
            });
            setTotalSupplied((result as bigint).toString());
        } catch (error) {
            console.error('Error fetching totalSupplied:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Get Total Supplied</h2>
            <label htmlFor='asset'>Asset Address</label>
            <input
                type='text'
                name='asset'
                value={asset}
                onChange={(e) => setAsset(e.target.value)}
            />
            <button type='button' onClick={getTotalSupplied}>Get Total Supplied</button>
            <div className="admin">
                <h6>Total Supplied: {totalSupplied ? totalSupplied : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default GetTotalSupplied;