import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../CollateralManagerAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const GetPriceOracle = () => {
    const [priceOracle, setPriceOracle] = useState<string | null>(null);
    const account = useAccount();

    const fetchPriceOracle = async () => {
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'priceOracle',
                args: [],
            });
            setPriceOracle(result as string);
        } catch (error) {
            console.error('Error fetching priceOracle:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Get Price Oracle</h2>
            <button type='button' onClick={fetchPriceOracle}>Get Price Oracle</button>
            <div className="admin">
                <h6>Price Oracle: {priceOracle ? priceOracle : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default GetPriceOracle;
