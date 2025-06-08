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
        try {
            const priceResult = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'getAssetPrice',
                args: [asset],
            });
            setPrice((priceResult as bigint).toString());
        } catch (error) {
            console.error('Error fetching asset price:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Get Asset Price</h2>
            <div className="input-group">
                <input
                    type="text"
                    value={asset}
                    onChange={(e) => setAsset(e.target.value)}
                    placeholder="Enter asset address..."
                    className="address-input"
                />
                <button
                    type="button"
                    onClick={getAssetPrice}
                    disabled={!asset}
                >
                    Get Price
                </button>
            </div>
            <div className="result">
                <h6>Asset Price: {price ? price : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default GetAssetPrice;