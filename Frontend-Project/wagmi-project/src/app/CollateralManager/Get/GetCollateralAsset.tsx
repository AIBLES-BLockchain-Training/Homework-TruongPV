import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../CollateralManagerAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const GetCollateralAssets = () => {
    const [user, setUser] = useState<string>('');
    const [assetAddress, setAssetAddress] = useState<string>('');
    const [result, setResult] = useState<{ amount: string, isLocked: boolean } | null>(null);
    const account = useAccount();

    const getCollateralAssets = async () => {
        if (!user || !assetAddress) {
            alert('Please enter both user and asset address.');
            return;
        }
        try {
            const res = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'collateralAssets',
                args: [user, assetAddress],
            });
            // res is usually an array: [amount, isLocked]
            const arr = res as unknown as [bigint, boolean];
            setResult({
                amount: arr[0]?.toString() ?? '0',
                isLocked: Boolean(arr[1]),
            });
        } catch (error) {
            console.error('Error fetching collateralAssets:', error);
        }
    }

    return (
        <div className="form-container">
            <h2>Get Collateral Assets</h2>
            <input
                type="text"
                placeholder="User Address"
                value={user}
                onChange={(e) => setUser(e.target.value)}
            />
            <input
                type="text"
                placeholder="Asset Address"
                value={assetAddress}
                onChange={(e) => setAssetAddress(e.target.value)}
            />
            <button type='button' onClick={getCollateralAssets}>Get Collateral Assets</button>
            <div className="collateral-assets">
                {result ? (
                    <div>
                        <h6>Amount: {result.amount}</h6>
                        <h6>Is Locked: {result.isLocked ? 'Yes' : 'No'}</h6>
                    </div>
                ) : (
                    <h6>No data</h6>
                )}
            </div>
        </div>
    );
};

export default GetCollateralAssets;