import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../LendingPoolAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const GetTotalAssetSupplied = () => {
    const [asset, setAsset] = useState<string>('');
    const [supplied, setSupplied] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const account = useAccount();

    const fetchSupplied = async () => {
        setError(null);
        setSupplied(null);
        if (!asset || asset.length !== 42) {
            setError('Please enter a valid asset address.');
            return;
        }
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'totalassetSupplied',
                args: [asset],
            });
            setSupplied(result?.toString() ?? null);
        } catch (err) {
            setError('Error fetching totalassetSupplied.');
            console.error('Error fetching totalassetSupplied:', err);
        }
    };

    return (
        <div className="form-container">
            <h2>Get Total Asset Supplied</h2>
            <input
                type="text"
                placeholder="Asset address"
                value={asset}
                onChange={e => setAsset(e.target.value)}
                className="input-field"
            />
            <button type="button" onClick={fetchSupplied}>Get Supplied</button>
            {error && <div className="error">{error}</div>}
            <div className="admin">
                <h6>Supplied: {supplied !== null ? supplied : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default GetTotalAssetSupplied;
