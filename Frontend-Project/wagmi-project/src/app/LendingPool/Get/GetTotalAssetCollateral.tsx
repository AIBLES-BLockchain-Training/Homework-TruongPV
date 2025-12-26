import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../LendingPoolAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const GetTotalAssetCollateral = () => {
    const [asset, setAsset] = useState<string>('');
    const [collateral, setCollateral] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const account = useAccount();

    const fetchCollateral = async () => {
        setError(null);
        setCollateral(null);
        if (!asset || asset.length !== 42) {
            setError('Please enter a valid asset address.');
            return;
        }
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'totalassetCollateral',
                args: [asset],
            });
            setCollateral(result?.toString() ?? null);
        } catch (err) {
            setError('Error fetching totalassetCollateral.');
            console.error('Error fetching totalassetCollateral:', err);
        }
    };

    return (
        <div className="form-container">
            <h2>Get Total Asset Collateral</h2>
            <input
                type="text"
                placeholder="Asset address"
                value={asset}
                onChange={e => setAsset(e.target.value)}
                className="input-field"
            />
            <button type="button" onClick={fetchCollateral}>Get Collateral</button>
            {error && <div className="error">{error}</div>}
            <div className="admin">
                <h6>Collateral: {collateral !== null ? collateral : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default GetTotalAssetCollateral;
