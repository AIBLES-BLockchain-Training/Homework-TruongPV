import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../PriceOracleAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const CustomPrice = () => {
    const [address, setAddress] = useState<string>('');
    const [price, setPrice] = useState<string | null>(null);
    const account = useAccount();

    const getCustomPrice = async () => {
        try {
            const priceResult = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'CustomPrice',
                args: [address],
            });
            setPrice((priceResult as bigint).toString());
        } catch (error) {
            console.error('Error fetching custom price:', error);
        }
    }

    return (
        <div className="form-container">
            <h2>Get Custom Price</h2>
            <div className="input-group">
                <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter address..."
                    className="address-input"
                />
                <button 
                    type="button" 
                    onClick={getCustomPrice}
                    disabled={!address}
                >
                    Get Price
                </button>
            </div>
            <div className="result">
                <h6>Custom Price: {price ? price : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default CustomPrice;
