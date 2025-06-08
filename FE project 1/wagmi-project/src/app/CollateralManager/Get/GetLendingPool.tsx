import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../CollateralManagerAbi';
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
                functionName: 'lendingPool',
                args: [],
            });
            setLendingPool(result as string);
        } catch (error) {
            console.error('Error fetching lending pool:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Get Lending Pool</h2>
            <button type='button' onClick={getLendingPool}>Get Lending Pool</button>
            <div className="admin">
                <h6>Lending Pool: {lendingPool ? lendingPool : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default GetLendingPool;