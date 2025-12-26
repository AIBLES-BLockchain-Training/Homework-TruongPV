import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../PriceOracleAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const GetCustomPrice = () => {
    const [asset, setAsset] = useState<string>('');
    const [price, setPrice] = useState<string | null>(null);
    const account = useAccount();

    const getCustomPrice = async () => {
        if (!asset) {
            alert('Please enter asset address.');
            return;
        }
        try {
            const priceResult = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'CustomPrice',
                args: [asset],
            });
            setPrice(priceResult?.toString() ?? null);
        } catch (error) {
            console.error('Error fetching custom price:', error);
        }
    }

    return (
        <div className="form-container">
            <h2>Get Custom Price</h2>
            <input
                type="text"
                placeholder="Asset Address"
                value={asset}
                onChange={(e) => setAsset(e.target.value)}
            />
            <button type='button' onClick={getCustomPrice}>Get Custom Price</button>
            <div className="custom-price">
                <h6>Price: {price ? price : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default GetCustomPrice;