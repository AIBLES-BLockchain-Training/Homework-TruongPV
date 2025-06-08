import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../CollateralManagerAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const GetCollateralAssets = () => {
    const [user, setUser] = useState<string>('');
    const [assetAddress, setAssetAddress] = useState<string>('');
    const [result, setResult] = useState<{ amount: string; isLocked: boolean } | null>(null);
    const account = useAccount();

    const getCollateralAssets = async () => {
        if (!user || !assetAddress) {
            alert('Please provide both user and asset address.');
            return;
        }
        try {
            const data = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'collateralAssets',
                args: [user, assetAddress],
            });
            // data is usually an array: [amount, isLocked]
            setResult({
                amount: (data as any)[0].toString(),
                isLocked: (data as any)[1],
            });
        } catch (error) {
            console.error('Error fetching collateralAssets:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Get Collateral Assets</h2>
            <label htmlFor='user'>User Address</label>
            <input
                type='text'
                name='user'
                value={user}
                onChange={(e) => setUser(e.target.value)}
            />
            <label htmlFor='assetAddress'>Asset Address</label>
            <input
                type='text'
                name='assetAddress'
                value={assetAddress}
                onChange={(e) => setAssetAddress(e.target.value)}
            />
            <button type='button' onClick={getCollateralAssets}>Get Collateral Assets</button>
            <div className="admin">
                {result ? (
                    <>
                        <h6>Amount: {result.amount}</h6>
                        <h6>Is Locked: {result.isLocked ? 'Yes' : 'No'}</h6>
                    </>
                ) : (
                    <h6>Amount: N/A</h6>
                )}
            </div>
        </div>
    );
};

export default GetCollateralAssets;