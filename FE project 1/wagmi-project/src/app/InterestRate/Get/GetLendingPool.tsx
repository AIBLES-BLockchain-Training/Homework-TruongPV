import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../InterestRateAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const GetLendingPool = () => {
    const [lendingPool, setLendingPool] = useState<string | null>(null);
    const account = useAccount();

    const getLendingPool = async () => {
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'LendingPool',
                args: [],
            });
            setLendingPool(result as string);
        } catch (error) {
            console.error('Error fetching LendingPool:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Get LendingPool</h2>
            <button type='button' onClick={getLendingPool}>Get LendingPool</button>
            <div className="admin">
                <h6>LendingPool: {lendingPool ? lendingPool : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default GetLendingPool;