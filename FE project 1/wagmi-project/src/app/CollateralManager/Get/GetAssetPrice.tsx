import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../CollateralManagerAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const GetAssetPrice = () => {
    const [asset, setAsset] = useState<string>('');
    const [price, setPrice] = useState<string | null>(null);
    const account = useAccount();

    const getPrice = async () => {
        if (!asset) {
            alert('Please provide the asset address.');
            return;
        }
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'getAssetPrice',
                args: [asset],
            });
            setPrice((result as bigint).toString());
        } catch (error) {
            console.error('Error fetching asset price:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Get Asset Price</h2>
            <label htmlFor='asset'>Asset Address</label>
            <input
                type='text'
                name='asset'
                value={asset}
                onChange={(e) => setAsset(e.target.value)}
            />
            <button type='button' onClick={getPrice}>Get Price</button>
            <div className="admin">
                <h6>Asset Price: {price ? price : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default GetAssetPrice;