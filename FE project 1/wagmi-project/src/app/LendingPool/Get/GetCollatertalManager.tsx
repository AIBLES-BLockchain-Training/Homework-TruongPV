import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../LendingPoolAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const GetCollateralManager = () => {
    const [collateralManager, setCollateralManager] = useState<string | null>(null);
    const account = useAccount();

    const getCollateralManager = async () => {
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'collateralManager',
                args: [],
            });
            setCollateralManager(result as string);
        } catch (error) {
            console.error('Error fetching collateralManager:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Get Collateral Manager</h2>
            <button type='button' onClick={getCollateralManager}>Get Collateral Manager</button>
            <div className="admin">
                <h6>Collateral Manager: {collateralManager ? collateralManager : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default GetCollateralManager;