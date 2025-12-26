import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../LendingPoolAbi';
import { Address } from 'viem';
import '../Function.css';

const GetCollateralManager = () => {
    const [collateralManager, setCollateralManager] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const getCollateralManager = async () => {
        setError(null);
        setCollateralManager(null);
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'collateralManager',
                args: [],
            });
            setCollateralManager(result as string);
        } catch (err: any) {
            setError('Lỗi truy vấn: ' + (err?.message || err));
        }
    };

    return (
        <div className="form-container">
            <h2>Get Collateral Manager</h2>
            <button type="button" onClick={getCollateralManager}>Get Collateral Manager</button>
            <div className="admin">
                <h6>Collateral Manager: {collateralManager !== null ? collateralManager : 'N/A'}</h6>
                {error && <div className="error-message">{error}</div>}
            </div>
        </div>
    );
};

export default GetCollateralManager;
