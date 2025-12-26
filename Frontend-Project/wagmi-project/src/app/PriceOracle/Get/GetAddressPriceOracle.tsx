import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../PriceOracleAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const GetPriceOracle = () => {
    const [asset, setAsset] = useState<string>('');
    const [oracle, setOracle] = useState<string | null>(null);
    const account = useAccount();

    const getPriceOracle = async () => {
        if (!asset) {
            alert('Please enter asset address.');
            return;
        }
        try {
            const oracleResult = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'priceOracles',
                args: [asset],
            });
            setOracle(oracleResult as string);
        } catch (error) {
            console.error('Error fetching price oracle:', error);
        }
    }

    return (
        <div className="form-container">
            <h2>Get Price Oracle</h2>
            <input
                type="text"
                placeholder="Asset Address"
                value={asset}
                onChange={(e) => setAsset(e.target.value)}
            />
            <button type='button' onClick={getPriceOracle}>Get Price Oracle</button>
            <div className="oracle">
                <h6>Oracle: {oracle ? oracle : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default GetPriceOracle;