import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../LendingPoolAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const GetCurrentUtilizationRate = () => {
    const [asset, setAsset] = useState<string>('');
    const [utilizationRate, setUtilizationRate] = useState<string | null>(null);
    const account = useAccount();

    const getUtilizationRate = async () => {
        if (!asset) {
            alert('Please provide the asset address.');
            return;
        }
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'getCurrentUtilizationRate',
                args: [asset],
            });
            setUtilizationRate((result as bigint).toString());
        } catch (error) {
            console.error('Error fetching getCurrentUtilizationRate:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Get Current Utilization Rate</h2>
            <label htmlFor='asset'>Asset Address</label>
            <input
                type='text'
                name='asset'
                value={asset}
                onChange={(e) => setAsset(e.target.value)}
            />
            <button type='button' onClick={getUtilizationRate}>Get Utilization Rate</button>
            <div className="admin">
                <h6>Utilization Rate: {utilizationRate ? utilizationRate : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default GetCurrentUtilizationRate;