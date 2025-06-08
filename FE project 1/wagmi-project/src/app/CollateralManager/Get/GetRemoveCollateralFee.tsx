import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../CollateralManagerAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const GetRemoveCollateralFee = () => {
    const [fee, setFee] = useState<string | null>(null);
    const account = useAccount();

    const getFee = async () => {
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'removeCollateralFee',
                args: [],
            });
            setFee((result as bigint).toString());
        } catch (error) {
            console.error('Error fetching removeCollateralFee:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Get Remove Collateral Fee</h2>
            <button type='button' onClick={getFee}>Get Remove Collateral Fee</button>
            <div className="admin">
                <h6>Remove Collateral Fee: {fee ? fee : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default GetRemoveCollateralFee;