import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../PriceOracleAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const GetAssetPrice = () => {
    const [asset, setAsset] = useState<string>('');
    const [price, setPrice] = useState<string | null>(null);
    const account = useAccount();

    const getAssetPrice = async () => {
        if (!asset) {
            alert('Please enter asset address.');
            return;
        }
        try {
            const priceResult = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'getAssetPrice',
                args: [asset],
            });
            setPrice(priceResult?.toString() ?? null);
        } catch (error) {
            console.error('Error fetching asset price:', error);
        }
    }

    return (
        <div className="form-container">
            <h2>Get Asset Price</h2>
            <input
                type="text"
                placeholder="Asset Address"
                value={asset}
                onChange={(e) => setAsset(e.target.value)}
            />
            <button type='button' onClick={getAssetPrice}>Get Asset Price</button>
            <div className="asset-price">
                <h6>Price: {price ? price : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default GetAssetPrice;