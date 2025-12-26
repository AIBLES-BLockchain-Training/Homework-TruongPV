import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../LendingPoolAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const GetTotalSupplied = () => {
    const [asset, setAsset] = useState<string>('');
    const [totalSupplied, setTotalSupplied] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const account = useAccount();

    const fetchTotalSupplied = async () => {
        setError(null);
        setTotalSupplied(null);
        if (!asset || asset.length !== 42) {
            setError('Please enter a valid asset address.');
            return;
        }
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'totalSupplied',
                args: [asset],
            });
            setTotalSupplied(result?.toString() ?? null);
        } catch (err) {
            setError('Error fetching totalSupplied.');
            console.error('Error fetching totalSupplied:', err);
        }
    };

    return (
        <div className="form-container">
            <h2>Get Total Supplied</h2>
            <input
                type="text"
                placeholder="Asset address"
                value={asset}
                onChange={e => setAsset(e.target.value)}
                className="input-field"
            />
            <button type="button" onClick={fetchTotalSupplied}>Get Total Supplied</button>
            {error && <div className="error">{error}</div>}
            <div className="admin">
                <h6>Total Supplied: {totalSupplied !== null ? totalSupplied : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default GetTotalSupplied;
